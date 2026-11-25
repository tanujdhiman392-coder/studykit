export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tone: "violet" | "green" | "amber" | "rose";
  ready: boolean;
};

export const tools: Tool[] = [
  { slug: "pdf-merge", name: "Merge PDF", description: "Combine multiple PDFs into one tidy file.", category: "PDF tools", icon: "files", tone: "violet", ready: true },
  { slug: "pdf-compress", name: "Compress PDF", description: "Reduce PDF file size with local processing.", category: "PDF tools", icon: "file-down", tone: "rose", ready: true },
  { slug: "image-resizer", name: "Image Resizer", description: "Resize photos for forms, IDs, and assignments.", category: "Image tools", icon: "image", tone: "green", ready: true },
  { slug: "image-to-pdf", name: "Image to PDF", description: "Turn JPG or PNG images into a shareable PDF.", category: "PDF tools", icon: "file-image", tone: "amber", ready: true },
  { slug: "attendance-calculator", name: "Attendance Calculator", description: "Check attendance and plan classes to reach your target.", category: "Calculators", icon: "calendar-check", tone: "green", ready: true },
  { slug: "cgpa-calculator", name: "CGPA Calculator", description: "Calculate a credit-weighted CGPA from your subjects.", category: "Calculators", icon: "chart", tone: "violet", ready: true },
  { slug: "scientific-calculator", name: "Scientific Calculator", description: "Evaluate arithmetic and common scientific functions.", category: "Engineering", icon: "calculator", tone: "amber", ready: true },
  { slug: "resume-builder", name: "Student Resume Builder", description: "Draft a clear fresher resume and print it to PDF.", category: "Career tools", icon: "briefcase", tone: "rose", ready: true },
  { slug: "notes", name: "Study Notes", description: "Create, organize, and search your study notes.", category: "Productivity", icon: "notebook", tone: "violet", ready: true },
  { slug: "study-planner", name: "Study Planner", description: "Plan study sessions and keep track of deadlines.", category: "Productivity", icon: "calendar", tone: "green", ready: true },
  { slug: "json-formatter", name: "JSON Formatter", description: "Validate, format, and copy JSON in your browser.", category: "Engineering", icon: "braces", tone: "amber", ready: true },
  { slug: "ai-notes-summarizer", name: "AI Notes Summarizer", description: "Turn PDF, DOCX, and TXT course notes into editable revision guides.", category: "AI study", icon: "sparkles", tone: "violet", ready: true },
  { slug: "quiz-generator", name: "Quiz Generator", description: "Generate source-grounded MCQs and written practice questions.", category: "AI study", icon: "list-checks", tone: "green", ready: true },
  { slug: "flashcards", name: "Flashcards", description: "Create and review question-and-answer cards from your notes.", category: "AI study", icon: "layers", tone: "amber", ready: true },
  { slug: "internship-tracker", name: "Internship Tracker", description: "Keep application stages and follow-ups organized.", category: "Career tools", icon: "briefcase", tone: "rose", ready: false },
];

export const implementedTools = tools.filter((tool) => tool.ready);

export function findTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
