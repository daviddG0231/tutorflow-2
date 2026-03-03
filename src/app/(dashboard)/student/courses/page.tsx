import { redirect } from 'next/navigation'

// /student/courses just redirects to the student dashboard which shows courses
export default function StudentCoursesPage() {
  redirect('/student')
}
