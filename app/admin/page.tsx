"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
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
import { Users, GraduationCap, FileQuestion, Plus, Trash2, Lock, LogOut } from "lucide-react";

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
  classId: string | null;
  class?: { id: string; name: string } | null;
};

type ApiQuestion = {
  id: string;
  kind: "SOCIOMETRY" | "FIRO";
  key: string;
  text: string;
  isActive: boolean;
};

type AuthResponse = {
  authenticated?: boolean;
  error?: string;
};

type ApiError = { error?: string };

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
  });

  const payload = (await response.json().catch(() => ({}))) as T & ApiError;
  if (!response.ok) {
    throw new Error(payload.error ?? `HTTP ${response.status}`);
  }
  return payload as T;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("classes");

  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");

  const [newClassName, setNewClassName] = useState("");
  const [newClassTeacher, setNewClassTeacher] = useState("");

  const [newStudentLastName, setNewStudentLastName] = useState("");
  const [newStudentFirstName, setNewStudentFirstName] = useState("");
  const [newStudentClassId, setNewStudentClassId] = useState("");

  const [newQuestionKind, setNewQuestionKind] = useState<"SOCIOMETRY" | "FIRO">("SOCIOMETRY");
  const [newQuestionText, setNewQuestionText] = useState("");

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [dataLoading, setDataLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    if (selectedClassId === "ALL") return students;
    return students.filter((student) => student.classId === selectedClassId);
  }, [students, selectedClassId]);

  async function loadAdminData() {
    setDataLoading(true);
    try {
      const [classesPayload, studentsPayload, questionsPayload] = await Promise.all([
        fetchJson<ApiClass[]>("/api/admin/classes"),
        fetchJson<ApiStudent[]>("/api/admin/students"),
        fetchJson<ApiQuestion[]>("/api/admin/questions"),
      ]);

      setClasses(classesPayload);
      setStudents(studentsPayload);
      setQuestions(questionsPayload);

      if (selectedClassId !== "ALL" && !classesPayload.some((cls) => cls.id === selectedClassId)) {
        setSelectedClassId("ALL");
      }

      if (!newStudentClassId && classesPayload.length > 0) {
        setNewStudentClassId(classesPayload[0].id);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Не удалось загрузить данные админ-панели");
    } finally {
      setDataLoading(false);
    }
  }

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
    void loadAdminData();
  }, [isAdmin]);

  function clearMessages() {
    setActionError(null);
    setActionSuccess(null);
  }

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
    setQuestions([]);
    setSelectedClassId("ALL");
    setActiveTab("classes");
    clearMessages();
  }

  async function handleAddClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    setActionLoading(true);

    try {
      await fetchJson<ApiClass>("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName, teacher: newClassTeacher }),
      });
      setNewClassName("");
      setNewClassTeacher("");
      setActionSuccess("Класс добавлен");
      await loadAdminData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Не удалось добавить класс");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteClass(classId: string, className: string) {
    if (!confirm(`Удалить класс ${className} вместе с учениками и результатами?`)) return;
    clearMessages();
    setActionLoading(true);

    try {
      await fetchJson<{ ok: true }>(`/api/admin/classes/${classId}`, { method: "DELETE" });
      setActionSuccess(`Класс ${className} удален`);
      await loadAdminData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Не удалось удалить класс");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    setActionLoading(true);

    try {
      await fetchJson<ApiStudent>("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: newStudentFirstName,
          lastName: newStudentLastName,
          classId: newStudentClassId,
        }),
      });
      setNewStudentLastName("");
      setNewStudentFirstName("");
      setActionSuccess("Учащийся добавлен");
      await loadAdminData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Не удалось добавить учащегося");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteStudent(studentId: string, fullName: string) {
    if (!confirm(`Удалить учащегося ${fullName} и все его результаты?`)) return;
    clearMessages();
    setActionLoading(true);

    try {
      await fetchJson<{ ok: true }>(`/api/admin/students/${studentId}`, { method: "DELETE" });
      setActionSuccess(`Учащийся ${fullName} удален`);
      await loadAdminData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Не удалось удалить учащегося");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();
    setActionLoading(true);

    try {
      await fetchJson<ApiQuestion>("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: newQuestionKind,
          text: newQuestionText,
        }),
      });
      setNewQuestionText("");
      setActionSuccess("Вопрос добавлен");
      await loadAdminData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Не удалось добавить вопрос");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm("Удалить этот вопрос из банка вопросов?")) return;
    clearMessages();
    setActionLoading(true);

    try {
      await fetchJson<{ ok: true }>(`/api/admin/questions/${questionId}`, { method: "DELETE" });
      setActionSuccess("Вопрос удален");
      await loadAdminData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Не удалось удалить вопрос");
    } finally {
      setActionLoading(false);
    }
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

        {actionError ? <p className="mb-4 text-sm text-red-600">{actionError}</p> : null}
        {actionSuccess ? <p className="mb-4 text-sm text-emerald-600">{actionSuccess}</p> : null}

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
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-[var(--ink)] mb-4">Добавить класс</h3>
                  <form className="grid md:grid-cols-[1fr_1fr_auto] gap-3" onSubmit={handleAddClass}>
                    <Input
                      value={newClassName}
                      onChange={(event) => setNewClassName(event.target.value)}
                      placeholder="Например: 9А"
                      required
                    />
                    <Input
                      value={newClassTeacher}
                      onChange={(event) => setNewClassTeacher(event.target.value)}
                      placeholder="Классный руководитель"
                    />
                    <Button type="submit" className="gradient-btn text-[var(--ink)] rounded-xl" disabled={actionLoading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить класс
                    </Button>
                  </form>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--ink)] mb-4">Список классов</h3>
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
                          <TableCell>{cls.teacher ?? "—"}</TableCell>
                          <TableCell className="text-center">{cls._count?.students ?? 0}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => void handleDeleteClass(cls.id, cls.name)}
                              disabled={actionLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-[var(--ink)] mb-4">Добавить учащегося</h3>
                  <form className="grid md:grid-cols-4 gap-3" onSubmit={handleAddStudent}>
                    <Input
                      value={newStudentLastName}
                      onChange={(event) => setNewStudentLastName(event.target.value)}
                      placeholder="Фамилия"
                      required
                    />
                    <Input
                      value={newStudentFirstName}
                      onChange={(event) => setNewStudentFirstName(event.target.value)}
                      placeholder="Имя"
                      required
                    />
                    <select
                      value={newStudentClassId}
                      onChange={(event) => setNewStudentClassId(event.target.value)}
                      className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
                      required
                    >
                      <option value="" disabled>
                        Выберите класс
                      </option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" className="gradient-btn text-[var(--ink)] rounded-xl" disabled={actionLoading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить
                    </Button>
                  </form>
                </div>

                <div>
                  <Label className="text-[var(--ink-secondary)] text-sm">Фильтр по классу</Label>
                  <div className="mt-2 max-w-xs">
                    <select
                      value={selectedClassId}
                      onChange={(event) => setSelectedClassId(event.target.value)}
                      className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm"
                    >
                      <option value="ALL">Все классы</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
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
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.lastName}</TableCell>
                        <TableCell>{student.firstName}</TableCell>
                        <TableCell>{student.class?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => void handleDeleteStudent(student.id, `${student.lastName} ${student.firstName}`)}
                            disabled={actionLoading}
                          >
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
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[var(--ink)]">Банк вопросов</h3>

                  <div className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-[var(--cloud-purple)] text-[var(--ink)]">Социометрия (базовый)</Badge>
                      <span className="text-xs text-[var(--ink-secondary)]">{sociometryQuestions.length} вопросов</span>
                    </div>
                    <p className="text-sm text-[var(--ink)]">Вопросы для социометрического опроса по методике Дж. Морено</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--cloud-pink)]/20">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-[var(--cloud-pink)] text-[var(--ink)]">ОМО/FIRO (базовый)</Badge>
                      <span className="text-xs text-[var(--ink-secondary)]">{firoQuestions.length} вопросов</span>
                    </div>
                    <p className="text-sm text-[var(--ink)]">Опросник межличностных отношений В. Шутца</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--ink)] mb-4">Добавить пользовательский вопрос</h4>
                  <form className="grid md:grid-cols-[180px_1fr_auto] gap-3" onSubmit={handleAddQuestion}>
                    <select
                      value={newQuestionKind}
                      onChange={(event) => setNewQuestionKind(event.target.value as "SOCIOMETRY" | "FIRO")}
                      className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
                    >
                      <option value="SOCIOMETRY">Социометрия</option>
                      <option value="FIRO">ОМО/FIRO</option>
                    </select>
                    <Input
                      value={newQuestionText}
                      onChange={(event) => setNewQuestionText(event.target.value)}
                      placeholder="Текст вопроса"
                      required
                    />
                    <Button type="submit" className="gradient-btn text-[var(--ink)] rounded-xl" disabled={actionLoading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить вопрос
                    </Button>
                  </form>
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--ink)] mb-4">Пользовательские вопросы ({questions.length})</h4>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[var(--cloud-bg)]">
                        <TableHead>Тип</TableHead>
                        <TableHead>Ключ</TableHead>
                        <TableHead>Текст</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <Badge variant="outline">{question.kind === "FIRO" ? "ОМО/FIRO" : "Социометрия"}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-[var(--ink-secondary)]">{question.key}</TableCell>
                          <TableCell>{question.text}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => void handleDeleteQuestion(question.id)}
                              disabled={actionLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {dataLoading ? <p className="mt-4 text-sm text-[var(--ink-secondary)]">Обновление данных...</p> : null}
      </div>
    </AppShell>
  );
}
