"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { demoClasses, demoStudents } from "@/lib/demo-data"
import { Users, GraduationCap, FileQuestion, Plus, Upload, Trash2, Settings } from "lucide-react"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("classes")

  // TODO: Add auth guard
  const isAdmin = true

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="max-w-[600px] mx-auto px-6 py-16 text-center">
          <Card className="cloud-shadow border-0 bg-white/90">
            <CardContent className="p-8">
              <Settings className="w-12 h-12 text-[var(--ink-secondary)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">Доступ ограничен</h2>
              <p className="text-[var(--ink-secondary)]">Для доступа к панели администратора необходима авторизация.</p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <PageTitle title="Панель администратора" subtitle="Управление классами, учащимися и вопросами" />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[var(--cloud-bg)] p-1 rounded-xl mb-6">
            <TabsTrigger
              value="classes"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
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
                    {demoClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.teacher || "-"}</TableCell>
                        <TableCell className="text-center">{cls.studentCount}</TableCell>
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
                  <div className="flex gap-2 mt-2">
                    {demoClasses.map((cls) => (
                      <Badge
                        key={cls.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-[var(--cloud-purple)]/20"
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
                    {demoStudents["7a"].slice(0, 10).map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.lastName}</TableCell>
                        <TableCell>{student.firstName}</TableCell>
                        <TableCell>7А</TableCell>
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
                      <span className="text-xs text-[var(--ink-secondary)]">3 вопроса</span>
                    </div>
                    <p className="text-sm text-[var(--ink)]">
                      Вопросы для социометрического опроса по методике Дж. Морено
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--cloud-pink)]/20">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-[var(--cloud-pink)] text-[var(--ink)]">ОМО/FIRO</Badge>
                      <span className="text-xs text-[var(--ink-secondary)]">54 вопроса</span>
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
  )
}
