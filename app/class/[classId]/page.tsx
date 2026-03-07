import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { StudentCard } from "@/components/student-card";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: { classId: string } | Promise<{ classId: string }>;
}

export default async function ClassPage({ params }: Props) {
  const { classId } = await Promise.resolve(params);

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      teacher: true,
      students: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  if (!cls) {
    return (
      <AppShell>
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <Link href="/class">
            <Button variant="ghost" className="mb-4 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Все классы
            </Button>
          </Link>
          <PageTitle title="Класс не найден" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <Link href="/class">
          <Button variant="ghost" className="mb-4 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все классы
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <PageTitle
            title={`Класс ${cls.name}`}
            subtitle={cls.teacher ? `Классный руководитель: ${cls.teacher}` : undefined}
          />

          <Link href={`/results/class/${classId}`}>
            <Button className="gradient-btn text-[var(--ink)] rounded-xl">
              <BarChart3 className="w-4 h-4 mr-2" />
              Результаты класса
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {cls.students.map((student) => (
            <StudentCard
              key={student.id}
              student={{ id: student.id, firstName: student.firstName, lastName: student.lastName }}
              classId={classId}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
