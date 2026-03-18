import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Trophy,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const studentId = session.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: "APPROVED" },
    select: {
      course: {
        select: {
          id: true,
          name: true,
          assignments: {
            select: {
              id: true,
              title: true,
              description: true,
              deadline: true,
              totalMarks: true,
              submissions: {
                where: { studentId },
                select: {
                  id: true,
                  submittedAt: true,
                  grade: true,
                  gradedAt: true,
                },
              },
            },
            orderBy: { deadline: "asc" },
          },
        },
      },
    },
  });

  const now = new Date();

  type AssignmentItem = {
    id: string;
    title: string;
    description: string | null;
    courseId: string;
    courseName: string;
    deadline: Date;
    totalMarks: number;
    status: "Submitted" | "Pending" | "Late";
    grade: number | null;
    gradedAt: Date | null;
    submittedAt: Date | null;
  };

  const allAssignments: AssignmentItem[] = [];

  for (const enrollment of enrollments) {
    const { course } = enrollment;
    for (const assignment of course.assignments) {
      const submission = assignment.submissions[0] ?? null;
      let status: "Submitted" | "Pending" | "Late";

      if (submission) {
        status = "Submitted";
      } else if (assignment.deadline < now) {
        status = "Late";
      } else {
        status = "Pending";
      }

      allAssignments.push({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        courseId: course.id,
        courseName: course.name,
        deadline: assignment.deadline,
        totalMarks: assignment.totalMarks,
        status,
        grade: submission?.grade ?? null,
        gradedAt: submission?.gradedAt ?? null,
        submittedAt: submission?.submittedAt ?? null,
      });
    }
  }

  const pending = allAssignments.filter((a) => a.status === "Pending");
  const late = allAssignments.filter((a) => a.status === "Late");
  const submitted = allAssignments.filter((a) => a.status === "Submitted");

  const statusIcon = {
    Pending: <Clock className="h-4 w-4 text-amber-500" />,
    Late: <AlertTriangle className="h-4 w-4 text-red-500" />,
    Submitted: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  };

  const statusBadge = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Late: "bg-red-50 text-red-700 border-red-200",
    Submitted: "bg-green-50 text-green-700 border-green-200",
  };

  function formatDate(date: Date) {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";  
    if (days === -1) return "Due yesterday";
    if (days > 1 && days <= 7) return `Due in ${days} days`;
    if (days < -1 && days >= -7) return `${Math.abs(days)} days late`;
    
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  function AssignmentCard({ assignment }: { assignment: AssignmentItem }) {
    const isLate = assignment.status === "Late";
    const isPending = assignment.status === "Pending";
    const isUrgent = isPending && (assignment.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 2;

    return (
      <Link href={`/student/courses/${assignment.courseId}`}>
        <div className={`bg-white rounded-xl border p-4 md:p-5 hover:shadow-md transition-all cursor-pointer ${
          isLate ? 'border-red-200 hover:border-red-300' : 
          isUrgent ? 'border-amber-200 hover:border-amber-300' :
          'border-gray-200 hover:border-sky-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <FileText className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 leading-tight">
                    {assignment.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{assignment.courseName}</span>
                  </div>
                </div>
              </div>
              
              {assignment.description && (
                <p className="text-sm text-gray-600 mb-3 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {assignment.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className={`flex items-center gap-1.5 ${
                  isLate ? 'text-red-600' : 
                  isUrgent ? 'text-amber-600' : 
                  'text-gray-600'
                }`}>
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="font-medium">{formatDate(assignment.deadline)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Trophy className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{assignment.totalMarks} marks</span>
                </span>
              </div>
            </div>
            
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge[assignment.status]}`}
              >
                {statusIcon[assignment.status]}
                {assignment.status}
              </span>
              {assignment.grade !== null && (
                <div className="text-right">
                  <span className="text-sm font-medium text-sky-600">
                    {assignment.grade}/{assignment.totalMarks}
                  </span>
                  <div className="text-xs text-gray-500">
                    {Math.round((assignment.grade / assignment.totalMarks) * 100)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (allAssignments.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-sky-500" />
          Assignments
        </h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No assignments yet
          </h3>
          <p className="text-gray-500">
            Assignments from your enrolled courses will appear here.
          </p>
        </div>
      </div>
    );
  }

  const urgentPending = pending.filter(a => (a.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 2);
  const regularPending = pending.filter(a => (a.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) > 2);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-sky-500" />
          Assignments
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{pending.length}</span> pending
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="font-medium">{late.length}</span> late
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium">{submitted.length}</span> submitted
            </span>
          </div>
        </div>
      </div>

      {urgentPending.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider">
              Urgent - Due Soon
            </h2>
            <div className="flex-1 h-px bg-red-100"></div>
          </div>
          <div className="space-y-3">
            {urgentPending.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}

      {late.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider">
              Overdue
            </h2>
            <div className="flex-1 h-px bg-red-100"></div>
          </div>
          <div className="space-y-3">
            {late.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}

      {regularPending.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
              Upcoming
            </h2>
            <div className="flex-1 h-px bg-amber-100"></div>
          </div>
          <div className="space-y-3">
            {regularPending.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}

      {submitted.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider">
              Submitted
            </h2>
            <div className="flex-1 h-px bg-green-100"></div>
          </div>
          <div className="space-y-3">
            {submitted.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
