import { redirect } from 'next/navigation'

// /teacher/courses redirects to teacher dashboard which shows courses
export default function TeacherCoursesPage() {
  redirect('/teacher')
}
