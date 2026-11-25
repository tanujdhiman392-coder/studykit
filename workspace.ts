"use server";

import { z } from "zod";
import { createHash } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { studyArtifactSchema } from "@/lib/ai-study";

const noteSchema = z.object({ id: z.string().uuid(), title: z.string().trim().min(1).max(160), body: z.string().max(50_000), subject: z.string().max(100), updatedAt: z.string().datetime(), pinned: z.boolean().optional() });
const taskSchema = z.object({ id: z.string().uuid(), title: z.string().trim().min(1).max(240), dueDate: z.string().max(20), priority: z.enum(["Low", "Medium", "High"]), completed: z.boolean() });
const workspaceSchema = z.object({ notes: z.array(noteSchema).max(500), tasks: z.array(taskSchema).max(500), savedTools: z.array(z.string().max(100)).max(300), recentTools: z.array(z.string().max(100)).max(8).optional(), preferences: z.object({ theme: z.enum(["light", "dark", "system"]), reducedMotion: z.boolean() }).optional() });

export async function migrateGuestWorkspace(input: unknown) {
  const parsed = workspaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Some workspace data did not pass validation. Your guest data is still saved on this device." };
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Account storage is not configured. Your guest workspace is still on this device." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Sign in to save the guest workspace to your account." };
  const userId = auth.user.id;
  const notes = parsed.data.notes.map((note) => ({ id: note.id, user_id: userId, title: note.title, body: note.body, subject: note.subject, pinned: note.pinned ?? false, updated_at: note.updatedAt }));
  const tasks = parsed.data.tasks.map((task) => ({ id: task.id, user_id: userId, title: task.title, due_date: task.dueDate || null, priority: task.priority.toLowerCase(), completed: task.completed }));
  const savedTools = parsed.data.savedTools.map((tool_slug) => ({ user_id: userId, tool_slug }));
  const activity = [...new Set(parsed.data.recentTools ?? [])].map((item_key) => {
    const hex = createHash("sha256").update(`${userId}:guest-migration:${item_key}`).digest("hex").slice(0, 32);
    const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    return { id, user_id: userId, event_type: "tool_opened", item_key };
  });
  const operations = [
    notes.length ? supabase.from("notes").upsert(notes, { onConflict: "id" }) : Promise.resolve({ error: null }),
    tasks.length ? supabase.from("study_tasks").upsert(tasks, { onConflict: "id" }) : Promise.resolve({ error: null }),
    savedTools.length ? supabase.from("saved_tools").upsert(savedTools, { onConflict: "user_id,tool_slug" }) : Promise.resolve({ error: null }),
    parsed.data.preferences ? supabase.from("user_preferences").upsert({ user_id: userId, theme: parsed.data.preferences.theme, settings: { reducedMotion: parsed.data.preferences.reducedMotion } }, { onConflict: "user_id" }) : Promise.resolve({ error: null }),
    activity.length ? supabase.from("activity_events").upsert(activity, { onConflict: "id" }) : Promise.resolve({ error: null }),
  ];
  const results = await Promise.all(operations);
  if (results.some((result) => result.error)) return { ok: false, message: "We couldn’t save every item yet. Your guest workspace is still available on this device; try again from your dashboard." };
  return { ok: true, message: "Your guest workspace has been saved to your account." };
}

const studyArtifactBatchSchema = z.array(studyArtifactSchema).max(2);
export async function migrateGuestStudyArtifacts(input: unknown) {
  const parsed = studyArtifactBatchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Some saved AI study materials did not pass validation. They remain on this device." };
  if (!parsed.data.length) return { ok: true, message: "No saved AI study materials to migrate." };
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Account storage is not configured. Saved AI study materials remain on this device." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Sign in to migrate your saved AI study materials." };
  const records = parsed.data.map((artifact) => ({ id: artifact.id, user_id: auth.user.id, artifact_type: artifact.kind, title: artifact.title, source_name: artifact.sourceName, content: artifact.content, created_at: artifact.createdAt }));
  const { error } = await supabase.from("ai_study_artifacts").upsert(records, { onConflict: "id" });
  return error ? { ok: false, message: "Cloud library needs supabase/ai-study-schema.sql. Your saved AI study materials remain on this device." } : { ok: true, message: "Saved AI study materials migrated." };
}

const onboardingSchema = z.object({ role: z.string().max(80), college: z.string().max(160), course: z.string().max(160), branch: z.string().max(120), semester: z.string().max(40), interests: z.array(z.string().max(80)).max(12) });

export async function saveOnboarding(input: unknown) {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please review your onboarding details." };
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Account storage is not configured." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Please sign in again to save your profile." };
  const { error } = await supabase.from("profiles").upsert({ id: auth.user.id, full_name: String(auth.user.user_metadata?.full_name ?? ""), role: parsed.data.role || null, college: parsed.data.college || null, course: parsed.data.course || null, branch: parsed.data.branch || null, semester: parsed.data.semester || null, interests: parsed.data.interests, onboarding_complete: true, updated_at: new Date().toISOString() });
  return error ? { ok: false, message: "We couldn’t save that profile just now. Try again." } : { ok: true, message: "Profile saved." };
}

const feedbackSchema = z.object({ category: z.enum(["Feedback", "Feature request", "Bug report", "Tool rating"]), subject: z.string().trim().min(2).max(160), message: z.string().trim().min(5).max(5000) });
export async function submitFeedback(input: unknown) {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please check your feedback fields and try again." };
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Feedback storage is not configured." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Sign in to submit feedback." };
  const { error } = await supabase.from("feedback").insert({ user_id: auth.user.id, category: parsed.data.category, subject: parsed.data.subject, message: parsed.data.message });
  return error ? { ok: false, message: "We couldn’t save your message. Try again later." } : { ok: true, message: "Thanks. Your feedback was saved." };
}
