"use client";

import { type FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { firoQuestions, sociometryQuestions } from "@/lib/test-data";
import { Users, GraduationCap, FileQuestion, Plus, Upload, Trash2, Lock, LogOut } from "lucide-react";

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

type AuthResponse = {
  authenticated?: boolean;
  error?: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("classes");
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/auth", { cache: "no-store" });
        const payload = (await response.json()) as AuthResponse;
        if (!cancelled) {
          setIsAdmin(Boolean(payload.authenticated));
        }
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
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
  }, [isAdmin, selectedClassId]);

  useEffect(() => {
    if (!isAdmin) return;
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
  }, [isAdmin, selectedClassId]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const payload = (await response.json()) as AuthResponse;
      if (!response.ok || !payload.authenticated) {
        throw new Error(payload.error ?? "Неверный логин или пароль");
      }
      setIsAdmin(true);
      setLogin("");
      setPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Ошибка авторизации");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAdmin(false);
    setClasses([]);
    setStudents([]);
    setSelectedClassId(null);
    setActiveTab("classes");
  }

  if (!authChecked) {
    return (
      <AppShell>
        <div className="max-w-[600px] mx-auto px-6 py-16 text-center text-[var(--ink-secondary)]">
          Проверка сессии администратора...
        </div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm w-full max-w-md">
            <CardContent className="p-8">
              <div className="w-14 h-14 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-[var(--ink)]" />
              </div>
              <h2 className="text-2xl font-semibold text-[var(--ink)] text-center mb-2">Вход в админ-панель</h2>
              <p className="text-sm text-[var(--ink-secondary)] text-center mb-6">
                Для доступа введите логин и пароль администратора.
              </p>

              <form className="space-y-4" onSubmit={handleAuthSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="admin-login" className="text-[var(--ink-secondary)]">
                    Логин
                  </Label>
                  <Input
                    id="admin-login"
                    value={login}
                    onChange={(event) => setLogin(event.target.value)}
                    autoComplete="username"
                    className="h-10 border-[var(--border)]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-[var(--ink-secondary)]">
                    Пароль
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className="h-10 border-[var(--border)]"
                    required
                  />
                </div>

                {authError ? <p className="text-sm text-red-600">{authError}</p> : null}

                <Button type="submit" className="w-full gradient-btn text-[var(--ink)] rounded-xl h-10" disabled={authLoading}>
                  {authLoading ? "Вход..." : "Войти"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex items-start justify-between gap-4 mb-6">
          <PageTitle title="Панель администратора" subtitle="Управление классами, учащимися и вопросами" />
          <Button variant="outline" className="rounded-xl bg-white/80" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[var(--cloud-bg)] p-1 rounded-xl mb-6">
            <TabsTrigger value="classes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Классы
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <GraduationCap className="w-4 h-4 mr-2" />
              Учащиеся
            </TabsTrigger>
            <TabsTrigger value="questions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
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
