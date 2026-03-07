"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { firoQuestions, sociometryQuestions } from "@/lib/test-data";
import { Users, GraduationCap, FileQuestion, Plus, Upload, Trash2, Settings } from "lucide-react";

type ApiClass = {
  id: string;
  name: string;
  teacher: string | null;
  _count?: { students: number };
};

type ApiStudent = {
  id: string;
  firstName: string;
  lastName: string;
  classId?: string | null;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("classes");
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // TODO: Add auth guard
  const isAdmin = true;

  useEffect(() => {
    let cancelled = false;
    async function loadClasses() {
      const response = await fetch("/api/groups", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as ApiClass[];
      if (cancelled) return;
      setClasses(payload);
      if (!selectedClassId && payload.length > 0) {
        setSelectedClassId(payload[0].id);
      }
    }
    void loadClasses();
    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    let cancelled = false;
    async function loadStudents() {
      const response = await fetch(`/api/groups/${selectedClassId}/participants`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as ApiStudent[];
      if (!cancelled) setStudents(payload);
    }
    void loadStudents();
    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="max-w-[600px] mx-auto px-6 py-16 text-center">
          <Card className="cloud-shadow border-0 bg-white/90">
            <CardContent className="p-8">
              <Settings className="w-12 h-12 text-[var(--ink-secondary)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">Доступ ограничен</h2>
              <p className="text-[var(--ink-secondary)]">
                Для доступа к панели администратора необходима авторизация.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <PageTitle title="Панель администратора" subtitle="Управление классами, учащимися и вопросами" />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[var(--cloud-bg)] p-1 rounded-xl mb-6">
            <TabsTrigger value="classes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Классы
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Учащиеся
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileQuestion className="w-4 h-4 mr-2" />
              Вопросы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-[var(--ink)]">Список классов</h3>
                  <Button className="gradient-btn text-[var(--ink)] rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить класс
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--cloud-bg)]">
                      <TableHead>Название</TableHead>
                      <TableHead>Учитель</TableHead>
                      <TableHead className="text-center">Учащихся</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.teacher ?? "-"}</TableCell>
                        <TableCell className="text-center">{cls._count?.students ?? 0}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-[var(--ink)]">Учащиеся</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-[var(--border)] bg-transparent">
                      <Upload className="w-4 h-4 mr-2" />
                      Импорт CSV
                    </Button>
                    <Button className="gradient-btn text-[var(--ink)] rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <Label className="text-[var(--ink-secondary)] text-sm">Фильтр по классу</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {classes.map((cls) => (
                      <Badge
                        key={cls.id}
                        variant={cls.id === selectedClassId ? "default" : "outline"}
                        className="cursor-pointer hover:bg-[var(--cloud-purple)]/20"
                        onClick={() => setSelectedClassId(cls.id)}
                      >
                        {cls.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--cloud-bg)]">
                      <TableHead>Фамилия</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Класс</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.lastName}</TableCell>
                        <TableCell>{student.firstName}</TableCell>
                        <TableCell>{classes.find((x) => x.id === (student.classId ?? ""))?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-[var(--ink)]">Банк вопросов</h3>
                  <Button className="gradient-btn text-[var(--ink)] rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить вопрос
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-[var(--cloud-purple)] text-[var(--ink)]">Социометрия</Badge>
                      <span className="text-xs text-[var(--ink-secondary)]">{sociometryQuestions.length} вопросов</span>
                    </div>
                    <p className="text-sm text-[var(--ink)]">Вопросы для социометрического опроса по методике Дж. Морено</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--cloud-pink)]/20">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-[var(--cloud-pink)] text-[var(--ink)]">ОМО/FIRO</Badge>
                      <span className="text-xs text-[var(--ink-secondary)]">{firoQuestions.length} вопросов</span>
                    </div>
                    <p className="text-sm text-[var(--ink)]">Опросник межличностных отношений В. Шутца</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

