export type StudyNote = {
  id: string;
  title: string;
  body: string;
  subject: string;
  updatedAt: string;
  pinned?: boolean;
};

export type StudyTask = {
  id: string;
  title: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  completed: boolean;
};

export type WorkspaceData = {
  notes: StudyNote[];
  tasks: StudyTask[];
  savedTools: string[];
  recentTools: string[];
  preferences: { theme: "light" | "dark" | "system"; reducedMotion: boolean };
};

import type { StudyArtifact } from "@/lib/ai-study";

const STORE = "studykit-workspace-v1";
const LIBRARY_STORE = "studykit-ai-library-v1";
const DB_NAME = "studykit-guest";
const DB_VERSION = 1;
function storedTheme(): WorkspaceData["preferences"]["theme"] {
  if (typeof window === "undefined") return "light";
  const value = localStorage.getItem("studykit-theme");
  return value === "dark" || value === "system" ? value : "light";
}

export function emptyWorkspace(): WorkspaceData { return { notes: [], tasks: [], savedTools: [], recentTools: [], preferences: { theme: storedTheme(), reducedMotion: false } }; }
const EMPTY = emptyWorkspace();

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("workspace")) req.result.createObjectStore("workspace");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function readWorkspace(): Promise<WorkspaceData> {
  if (typeof window === "undefined") return EMPTY;
  try {
    const db = await openDb();
    if (db) {
      const value = await new Promise<WorkspaceData | undefined>((resolve) => {
        const request = db.transaction("workspace", "readonly").objectStore("workspace").get(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(undefined);
      });
      db.close();
      if (value) return { ...EMPTY, ...value, preferences: { theme: value.preferences?.theme ?? storedTheme(), reducedMotion: value.preferences?.reducedMotion ?? false } };
    }
    const fallback = localStorage.getItem(STORE);
    if (!fallback) return emptyWorkspace();
    const value = JSON.parse(fallback) as Partial<WorkspaceData>;
    return { ...EMPTY, ...value, preferences: { theme: value.preferences?.theme ?? storedTheme(), reducedMotion: value.preferences?.reducedMotion ?? false } };
  } catch {
    return EMPTY;
  }
}

export async function writeWorkspace(value: WorkspaceData): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const db = await openDb();
    if (db) {
      const ok = await new Promise<boolean>((resolve) => {
        const request = db.transaction("workspace", "readwrite").objectStore("workspace").put(value, STORE);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
      db.close();
      if (ok) return true;
    }
    localStorage.setItem(STORE, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function clearWorkspace(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openDb();
    if (db) {
      await new Promise<void>((resolve) => {
        const objectStore = db.transaction("workspace", "readwrite").objectStore("workspace");
        objectStore.delete(STORE);
        const request = objectStore.delete(LIBRARY_STORE);
        request.onsuccess = request.onerror = () => resolve();
      });
      db.close();
    }
    localStorage.removeItem(STORE);
    localStorage.removeItem(LIBRARY_STORE);
  } catch {
    // Keep the UI usable if the browser blocks local storage cleanup.
  }
}

export async function readStudyLibrary(): Promise<StudyArtifact[]> {
  if (typeof window === "undefined") return [];
  try {
    const db = await openDb();
    if (db) {
      const value = await new Promise<StudyArtifact[] | undefined>((resolve) => {
        const request = db.transaction("workspace", "readonly").objectStore("workspace").get(LIBRARY_STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(undefined);
      });
      db.close();
      if (Array.isArray(value)) return value;
    }
    const fallback = localStorage.getItem(LIBRARY_STORE);
    if (!fallback) return [];
    const parsed: unknown = JSON.parse(fallback);
    return Array.isArray(parsed) ? parsed as StudyArtifact[] : [];
  } catch { return []; }
}

export async function writeStudyLibrary(value: StudyArtifact[]): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const db = await openDb();
    if (db) {
      const ok = await new Promise<boolean>((resolve) => {
        const request = db.transaction("workspace", "readwrite").objectStore("workspace").put(value, LIBRARY_STORE);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
      db.close();
      if (ok) return true;
    }
    localStorage.setItem(LIBRARY_STORE, JSON.stringify(value));
    return true;
  } catch { return false; }
}

export function hasGuestSession() {
  return typeof window !== "undefined" && sessionStorage.getItem("studykit-guest-session") === "active";
}

export function beginGuestSession() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("studykit-guest-session", "active");
  sessionStorage.setItem("studykit-guest-id", crypto.randomUUID());
  window.dispatchEvent(new Event("studykit-guest-change"));
}

export function endGuestSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("studykit-guest-session");
  sessionStorage.removeItem("studykit-guest-id");
  window.dispatchEvent(new Event("studykit-guest-change"));
}
