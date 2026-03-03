# TutorFlow 2 — Design Reference

## Design System
- **Primary**: #0EA5E9 (sky-500, TutorFlow blue)
- **Accent/CTA**: #F97316 (orange-500, for urgent/submit actions)
- **Danger**: #EF4444 (red-500, for logout/delete)
- **Success**: #22C55E (green-500, for completion)
- **Background**: #FAFAFA (gray-50)
- **Sidebar**: White with left border
- **Cards**: White, rounded-xl, subtle shadow-sm, border gray-200
- **Font**: System UI / Inter

## Layout (Desktop-first, 3-column)
- **Left sidebar**: ~220px, fixed. Logo + nav links (Dashboard, My Courses, Create Course, Assignments) + bottom (Settings, Logout)
- **Top bar**: Search bar centered, user name + role + notification bell + avatar on right
- **Main content**: Flexible center column
- **Right sidebar**: ~280px, contextual widgets (schedule, progress, feed)
- **Footer**: "© 2026 TutorFlow Platform. All rights reserved. Specialized IGCSE Curriculum Support."

## Sidebar Nav Items
- Dashboard (grid icon)
- My Courses (book icon)
- Create Course (plus-circle icon)
- Assignments (clipboard icon)
- --- separator ---
- Settings (gear icon)
- Logout (log-out icon, red)

## Pages
1. **Teacher Dashboard** (`/teacher`)
   - Quick Actions: New Course, Create Assignment, Review Submissions
   - Active Cohorts: cards with code, subject, students count, modules count, syllabus progress bar
   - Weekly Participation Summary: bar chart (Mon-Sun)
   - Right: Today's Schedule, Submission Feed (pending grades), Staff Notice

2. **Create Course** (`/teacher/courses/new`)
   - Left: Course Structure (draggable modules list, "+ Add New Module")
   - Center: Global Course Settings form (title, IGCSE subject dropdown, description, type radio, enrollment access checkboxes)
   - Bottom: Enrollment Code card + Student Groups card
   - Footer bar: page dots, draft saved time, Discard/Save Template/Publish buttons
   - Teacher Tip box at bottom of sidebar

3. **Student Course View** (`/student/courses/[id]`)
   - Breadcrumb: MY COURSES > IGCSE BIOLOGY 0610
   - Top: Join New Subject bar with code input
   - Left: Course Content tree (units with expandable sub-topics)
   - Center: Active module content (video tutorials, handouts, recordings), Pending Assignments with urgency, Past Papers Archive
   - Right: Course Progress (completion %, estimated grade, assignments count), Upcoming Deadlines, Group Members, "Struggling?" CTA

4. **Assignment Grading** (`/teacher/assignments/[id]/grade/[submissionId]`)
   - Top: View Mode toggle (Student/Teacher), student avatars, All Submissions link
   - Left: Embedded PDF viewer with pagination
   - Right: Assignment Status (status badge, time remaining with progress bar)
   - Assessment: Grade slider 0-100, IGCSE Grade Boundary buttons (A*-U), Feedback Comments textarea
   - Actions: Publish Grade (primary), Save Draft (secondary)
   - Plagiarism Check card
   - IGCSE Mark Scheme (expandable criteria sections)
   - Resources list with download links

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Neon)
- NextAuth v4
- Lucide React icons
- Framer Motion for animations
