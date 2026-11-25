# StudyKit India

A student productivity and academic utility platform designed to help students study smarter, organize their academic life, and manage everyday college tasks from one workspace.

**Built for students. Designed for productivity.**

StudyKit India brings essential student tools together in one modern, accessible, and easy-to-use platform.

## Overview

StudyKit India is an all-in-one student utility platform that provides a centralized workspace for studying, writing, organizing notes, managing academic tasks, and using everyday productivity tools.

The platform is designed for students who want a simple and efficient digital workspace without switching between multiple websites and applications.

## Features

- Student productivity dashboard
- User registration and login
- Continue as Guest option
- Personal student workspace
- Notes and digital notepad
- Text editor and file utilities
- Document editing and printing tools
- Study and academic utilities
- Responsive interface for desktop, tablet, and mobile
- Modern user interface with smooth animations
- Organized tools and dashboard navigation

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Lucide Icons
- Vercel-ready deployment

## Folder Structure

```text
studykit-india/
  src/
    app/
      App Router pages and layouts
    components/
      Reusable UI components
      Dashboard components
      Navigation components
    lib/
      Utility functions
      Supabase helpers
    hooks/
      Custom React hooks
    types/
      Shared TypeScript types

  public/
    Static assets
    Images
    Icons

  supabase/
    Database migrations

  .env.example
  .gitignore
  next.config.ts
  package.json
  package-lock.json
  tsconfig.json
  README.md
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- Git
- A code editor such as Visual Studio Code

### Installation

Clone the repository:

```bash
git clone https://github.com/tanujdhiman392-coder/studykit.git
```

Navigate to the project directory:

```bash
cd studykit
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

## Environment Variables

Create a `.env.local` file in the project root if Supabase integration is enabled.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never expose private API keys, service-role keys, or database credentials in frontend code or public repositories.

## Supabase Setup

1. Create a project on Supabase.
2. Copy your project URL.
3. Copy your public anon/publishable key.
4. Add the credentials to `.env.local`.
5. Configure authentication providers if required.
6. Apply the database migrations provided in the project.

Supabase can be used for authentication, database storage, and user-specific workspace data.

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build production application
npm run start     # Start production server
npm run lint      # Run linting
```

## Deployment on Vercel

StudyKit India can be deployed using Vercel.

1. Push the project to GitHub.
2. Open Vercel.
3. Import the StudyKit repository.
4. Select the Next.js framework preset.
5. Configure the required environment variables.
6. Deploy the application.

After deployment, your project will be available through a public URL.

## Project Goals

StudyKit India aims to make student productivity tools accessible through a single, clean, and organized digital workspace.

The platform focuses on:

- Simplicity
- Accessibility
- Productivity
- Student-friendly design
- Reliable performance
- Responsive user experience

## License

This project is developed for educational and student productivity purposes.
