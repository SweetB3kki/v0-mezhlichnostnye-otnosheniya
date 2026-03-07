"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sociogram } from "@/components/sociogram";
import type { ClassResultsApiResponse } from "@/lib/results-types";
import type { SocialStatus } from "@/lib/sociometry";
import { ArrowLeft } from "lucide-react";

const statusLabel: Record<SocialStatus, string> = {
  STAR: "Звезда",
  PREFERRED: "Предпочитаемый",
  NEGLECTED: "Пренебрегаемый",
  ISOLATED: "Изолированный",
};

const statusStyle: Record<SocialStatus, string> = {
  STAR: "bg-[var(--cloud-purple)] text-[var(--ink)]",
  PREFERRED: "bg-[var(--cloud-pink)] text-[var(--ink)]",
  NEGLECTED: "bg-[var(--cloud-bg)] text-[var(--ink-secondary)]",
  ISOLATED: "bg-gray-100 text-[var(--ink-secondary)]",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}

export default function ClassResultsPage() {
  const routeParams = useParams<{ classId: string }>();
  const classId = Array.isArray(routeParams.classId) ? routeParams.classId[0] : routeParams.classId;
  const [data, setData] = useState<ClassResultsApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/results/class/${classId}`, { cache: "no-store" });
        const payload = (await response.json()) as ClassResultsApiResponse | { error?: string };
        if (!response.ok) {
          throw new Error("error" in payload && payload.error ? payload.error : `HTTP ${response.status}`);
        }
        if (!cancelled) setData(payload as ClassResultsApiResponse);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load class results");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  const avgFiro = useMemo(() => {
    if (!data || data.students.length === 0) return 0;
    const sum = data.students.reduce((acc, student) => acc + student.firoAvg, 0);
    return sum / data.students.length;
  }, [data]);

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <Link href="/results">
          <Button variant="ghost" className="mb-4 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все результаты
          </Button>
        </Link>

        {loading ? (
          <div className="text-[var(--ink-secondary)]">Загрузка результатов…</div>
        ) : error || !data ? (
          <div className="text-[var(--ink)] font-medium">{error ?? "Не удалось загрузить результаты"}</div>
        ) : (
          <>
            <PageTitle
              title={`Результаты класса ${data.class.name}`}
              subtitle={`${data.class.studentCount} учащихся`}
            />

            <Tabs defaultValue="sociometry" className="space-y-6">
              <TabsList className="bg-[var(--cloud-bg)] p-1 rounded-xl">
                <TabsTrigger
                  value="sociometry"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Социометрия
                </TabsTrigger>
                <TabsTrigger
                  value="firo"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  ОМО/FIRO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sociometry" className="space-y-6">
                <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ink)]">Социограмма класса</h3>
                      <p className="text-sm text-[var(--ink-secondary)]">
                        Узлы — учащиеся, стрелки — выборы в социометрии. Взаимные выборы выделены фиолетовым.
                      </p>
                    </div>
                    <Sociogram
                      students={data.students.map((student) => ({
                        id: student.id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        status: student.status,
                        inDegree: student.inDegree,
                        outDegree: student.outDegree,
                        mutualChoices: student.mutualChoices,
                      }))}
                      edges={data.sociometry.edges}
                    />
                  </CardContent>
                </Card>

                <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="p-4 rounded-xl bg-[var(--cloud-purple)]/10">
                        <div className="text-2xl font-semibold text-[var(--ink)]">{data.sociometry.statusCounts.STAR}</div>
                        <div className="text-xs text-[var(--ink-secondary)]">Звезды</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--cloud-pink)]/20">
                        <div className="text-2xl font-semibold text-[var(--ink)]">{data.sociometry.statusCounts.PREFERRED}</div>
                        <div className="text-xs text-[var(--ink-secondary)]">Предпочитаемые</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                        <div className="text-2xl font-semibold text-[var(--ink)]">{data.sociometry.statusCounts.NEGLECTED}</div>
                        <div className="text-xs text-[var(--ink-secondary)]">Пренебрегаемые</div>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-100">
                        <div className="text-2xl font-semibold text-[var(--ink)]">{data.sociometry.statusCounts.ISOLATED}</div>
                        <div className="text-xs text-[var(--ink-secondary)]">Изолированные</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--cloud-purple)]/10">
                        <div className="text-2xl font-semibold text-[var(--ink)]">{data.sociometry.cohesion.toFixed(3)}</div>
                        <div className="text-xs text-[var(--ink-secondary)]">Индекс сплоченности</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[var(--cloud-bg)]">
                            <TableHead>Учащийся</TableHead>
                            <TableHead className="text-center">Sociometry</TableHead>
                            <TableHead className="text-center">FIRO</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-center">inDegree</TableHead>
                            <TableHead className="text-center">outDegree</TableHead>
                            <TableHead className="text-center">mutual</TableHead>
                            <TableHead>status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.students.map((student) => (
                            <TableRow key={student.id} className="hover:bg-[var(--cloud-bg)]/50">
                              <TableCell className="font-medium text-[var(--ink)]">
                                <Link href={`/student/${student.id}/results`} className="hover:underline">
                                  {student.lastName} {student.firstName}
                                </Link>
                              </TableCell>
                              <TableCell className="text-center text-[var(--ink-secondary)]">
                                {student.sociometryResponseCount}
                              </TableCell>
                              <TableCell className="text-center text-[var(--ink-secondary)]">{student.firoResponseCount}</TableCell>
                              <TableCell className="text-[var(--ink-secondary)]">{formatDate(student.submittedAt)}</TableCell>
                              <TableCell className="text-center text-[var(--ink-secondary)]">{student.inDegree}</TableCell>
                              <TableCell className="text-center text-[var(--ink-secondary)]">{student.outDegree}</TableCell>
                              <TableCell className="text-center text-[var(--ink-secondary)]">{student.mutualChoices}</TableCell>
                              <TableCell>
                                <Badge className={statusStyle[student.status]}>{statusLabel[student.status]}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="firo" className="space-y-6">
                <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-[var(--cloud-pink)]/20">
                        <div className="text-2xl font-semibold text-[var(--ink)]">{avgFiro.toFixed(2)}</div>
                        <div className="text-xs text-[var(--ink-secondary)]">Средний балл класса</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                        <div className="text-2xl font-semibold text-[var(--ink)]">
                          {data.students.reduce((sum, student) => sum + student.firoCount, 0)}
                        </div>
                        <div className="text-xs text-[var(--ink-secondary)]">Всего FIRO ответов</div>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--cloud-purple)]/10">
                        <div className="text-2xl font-semibold text-[var(--ink)]">{data.students.length}</div>
                        <div className="text-xs text-[var(--ink-secondary)]">Учащихся в выборке</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[var(--cloud-bg)]">
                            <TableHead>Учащийся</TableHead>
                            <TableHead className="text-center">FIRO count</TableHead>
                            <TableHead className="text-center">FIRO sum</TableHead>
                            <TableHead className="text-center">FIRO avg</TableHead>
                            <TableHead>Submitted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.students.map((student) => (
                            <TableRow key={student.id} className="hover:bg-[var(--cloud-bg)]/50">
                              <TableCell className="font-medium text-[var(--ink)]">
                                {student.lastName} {student.firstName}
                              </TableCell>
                              <TableCell className="text-center text-[var(--ink-secondary)]">{student.firoCount}</TableCell>
                              <TableCell className="text-center text-[var(--ink-secondary)]">{student.firoSum}</TableCell>
                              <TableCell className="text-center text-[var(--ink-secondary)]">{student.firoAvg.toFixed(2)}</TableCell>
                              <TableCell className="text-[var(--ink-secondary)]">{formatDate(student.submittedAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppShell>
  );
}
