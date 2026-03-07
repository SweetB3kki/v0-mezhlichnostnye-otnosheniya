import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ClassListPage() {
  const classes = await prisma.class.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      teacher: true,
      _count: { select: { students: true } },
    },
  });

  return (
    <AppShell>
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <PageTitle title="Выбор класса" subtitle="Выберите класс для прохождения тестирования" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((classItem) => (
            <Link key={classItem.id} href={`/class/${classItem.id}`}>
              <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm hover:bg-white transition-colors cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl gradient-btn flex items-center justify-center">
                      <span className="text-lg font-semibold text-[var(--ink)]">
                        {classItem.name.slice(0, 2)}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--ink-secondary)] group-hover:text-[var(--ink)] transition-colors" />
                  </div>

                  <h3 className="font-semibold text-[var(--ink)] mb-1">Класс {classItem.name}</h3>

                  {classItem.teacher && <p className="text-sm text-[var(--ink-secondary)] mb-2">{classItem.teacher}</p>}

                  <div className="flex items-center gap-1 text-xs text-[var(--ink-secondary)]">
                    <Users className="w-3 h-3" />
                    <span>{classItem._count.students} учащихся</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

