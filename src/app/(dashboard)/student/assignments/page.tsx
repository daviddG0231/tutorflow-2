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
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function AssignmentCard({ assignment }: { assignment: AssignmentItem }) {
    return (
      <Link href={`/student/courses/${assignment.courseId}`}>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-sky-200 transition-all cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-sky-500 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 truncate">
                  {assignment.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="truncate">{assignment.courseName}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(assignment.deadline)}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5" />
                  {assignment.totalMarks} marks
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge[assignment.status]}`}
              >
                {statusIcon[assignment.status]}
                {assignment.status}
              </span>
              {assignment.grade !== null && (
                <span className="text-sm font-medium text-sky-600">
                  {assignment.grade}/{assignment.totalMarks}
                </span>
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-sky-500" />
          Assignments
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-amber-500" />
            {pending.length} pending
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            {late.length} late
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {submitted.length} submitted
          </span>
        </div>
      </div>

      {(pending.length > 0 || late.length > 0) && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Pending & Overdue
          </h2>
          <div className="space-y-3">
            {[...pending, ...late].map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}

      {submitted.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Submitted
          </h2>
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
