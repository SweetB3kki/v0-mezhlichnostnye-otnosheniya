"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User } from "lucide-react";
import type { StudentResultsApiResponse } from "@/lib/results-types";
import type { SocialStatus } from "@/lib/sociometry";
import { FIRO_SCALE_ORDER, getFiroLevelLabel, type FiroScoreLevel } from "@/lib/firo";

const statusLabel: Record<SocialStatus, string> = {
  STAR: "Звезда",
  PREFERRED: "Предпочитаемый",
  NEGLECTED: "Пренебрегаемый",
  ISOLATED: "Изолированный",
};

const firoLevelStyle: Record<FiroScoreLevel, string> = {
  EXTREMELY_LOW: "bg-slate-100 text-slate-700",
  LOW: "bg-blue-100 text-blue-700",
  BORDERLINE: "bg-amber-100 text-amber-800",
  HIGH: "bg-emerald-100 text-emerald-700",
  EXTREMELY_HIGH: "bg-rose-100 text-rose-700",
};

export default function StudentResultsPage() {
  const routeParams = useParams<{ studentId: string }>();
  const studentId = Array.isArray(routeParams.studentId) ? routeParams.studentId[0] : routeParams.studentId;
  const [data, setData] = useState<StudentResultsApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/results/student/${studentId}`, { cache: "no-store" });
        const payload = (await response.json()) as StudentResultsApiResponse | { error?: string };
        if (!response.ok) {
          throw new Error("error" in payload && payload.error ? payload.error : `HTTP ${response.status}`);
        }
        if (!cancelled) setData(payload as StudentResultsApiResponse);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load student results");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return (
    <AppShell>
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <Link href="/results">
          <Button variant="ghost" className="mb-4 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все результаты
          </Button>
        </Link>

        {loading ? (
          <div className="text-[var(--ink-secondary)]">Загрузка профиля…</div>
        ) : error || !data ? (
          <div className="text-[var(--ink)] font-medium">{error ?? "Не удалось загрузить данные ученика"}</div>
        ) : (
          <>
            <PageTitle
              title={`${data.student.lastName} ${data.student.firstName}`}
              subtitle={data.student.className ? `Класс ${data.student.className}` : "Класс не назначен"}
            />

            <div className="space-y-6">
              <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center">
                      <User className="w-8 h-8 text-[var(--ink)]" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-[var(--ink)]">
                        {data.student.lastName} {data.student.firstName}
                      </h2>
                      <p className="text-[var(--ink-secondary)]">
                        Последняя отправка:{" "}
                        {data.session ? new Date(data.session.submittedAt).toLocaleString("ru-RU") : "нет"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-[var(--ink)]">Социометрия</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[var(--cloud-purple)] text-[var(--ink)]">
                      {statusLabel[data.sociometry.status]}
                    </Badge>
                    <Badge variant="outline">inDegree: {data.sociometry.inDegree}</Badge>
                    <Badge variant="outline">outDegree: {data.sociometry.outDegree}</Badge>
                    <Badge variant="outline">mutual: {data.sociometry.mutualChoices}</Badge>
                  </div>

                  {data.sociometry.answers.length === 0 ? (
                    <div className="text-[var(--ink-secondary)]">Нет социометрических ответов.</div>
                  ) : (
                    <div className="space-y-3">
                      {data.sociometry.answers.map((answer) => (
                        <div key={answer.questionKey} className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                          <div className="text-sm font-medium text-[var(--ink)] mb-2">{answer.questionKey}</div>
                          {answer.selectedStudents.length === 0 ? (
                            <div className="text-sm text-[var(--ink-secondary)]">Без выборов</div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {answer.selectedStudents.map((student) => (
                                <Badge key={student.id} variant="secondary" className="bg-white text-[var(--ink)]">
                                  {student.lastName} {student.firstName}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-[var(--ink)]">FIRO</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-[var(--cloud-pink)]/20">
                      <div className="text-xl font-semibold text-[var(--ink)]">{data.firo.sum}</div>
                      <div className="text-xs text-[var(--ink-secondary)]">Сумма</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                      <div className="text-xl font-semibold text-[var(--ink)]">{data.firo.avg.toFixed(2)}</div>
                      <div className="text-xs text-[var(--ink-secondary)]">Среднее</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--cloud-purple)]/10">
                      <div className="text-xl font-semibold text-[var(--ink)]">{data.firo.count}</div>
                      <div className="text-xs text-[var(--ink-secondary)]">Ответов</div>
                    </div>
                  </div>

                  {data.firo.count > 0 ? (
                    <>
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {FIRO_SCALE_ORDER.map((scale) => {
                          const item = data.firo.scales[scale];
                          return (
                            <div key={scale} className="p-4 rounded-xl bg-[var(--cloud-bg)] space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="text-sm font-semibold text-[var(--ink)]">{scale}</div>
                                  <div className="text-xs text-[var(--ink-secondary)]">{item.name}</div>
                                </div>
                                <div className="text-2xl font-semibold text-[var(--ink)]">{item.score}</div>
                              </div>
                              <Badge className={firoLevelStyle[item.level]}>{getFiroLevelLabel(item.level)}</Badge>
                              <p className="text-xs leading-5 text-[var(--ink-secondary)]">{item.description}</p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid md:grid-cols-3 gap-3">
                        {Object.entries(data.firo.domains).map(([domainCode, domain]) => (
                          <div key={domainCode} className="p-4 rounded-xl bg-[var(--cloud-purple)]/10 space-y-2">
                            <div className="text-sm font-semibold text-[var(--ink)]">{domain.name}</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="rounded-lg bg-white/80 px-3 py-2">
                                <div className="text-[var(--ink-secondary)]">e</div>
                                <div className="font-semibold text-[var(--ink)]">{domain.expressed}</div>
                              </div>
                              <div className="rounded-lg bg-white/80 px-3 py-2">
                                <div className="text-[var(--ink-secondary)]">w</div>
                                <div className="font-semibold text-[var(--ink)]">{domain.wanted}</div>
                              </div>
                              <div className="rounded-lg bg-white/80 px-3 py-2">
                                <div className="text-[var(--ink-secondary)]">e + w</div>
                                <div className="font-semibold text-[var(--ink)]">{domain.volume}</div>
                              </div>
                              <div className="rounded-lg bg-white/80 px-3 py-2">
                                <div className="text-[var(--ink-secondary)]">e - w</div>
                                <div className="font-semibold text-[var(--ink)]">{domain.contradiction}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}

                  {data.firo.responses.length === 0 ? (
                    <div className="text-[var(--ink-secondary)]">Нет FIRO-ответов.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.firo.responses.map((response) => (
                        <div key={response.questionKey} className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                          <div className="text-sm text-[var(--ink-secondary)]">{response.questionKey}</div>
                          <div className="text-xl font-semibold text-[var(--ink)]">{response.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
