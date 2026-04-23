"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";

type ApiClass = {
  id: string;
  name: string;
  _count?: { students: number };
};

export default function ExportPage() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [format, setFormat] = useState<string>("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [classes, setClasses] = useState<ApiClass[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadClasses() {
      const response = await fetch("/api/groups", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as ApiClass[];
      if (!cancelled) setClasses(payload);
    }

    void loadClasses();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = async () => {
    if (!selectedClass) return;

    setIsExporting(true);

    try {
      const response = await fetch(`/api/export?classId=${selectedClass}&format=${format}`);
      if (!response.ok) throw new Error(`Export failed with HTTP ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `results_${selectedClass}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-[600px] mx-auto px-6 py-12">
        <PageTitle title="Экспорт данных" subtitle="Выгрузка результатов тестирования" />

        <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[var(--ink)]">Выберите класс</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="rounded-xl border-[var(--border)]">
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все классы</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      Класс {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--ink)]">Формат файла</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat("csv")}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    format === "csv"
                      ? "border-[var(--cloud-purple)] bg-[var(--cloud-purple)]/10"
                      : "border-[var(--border)] hover:border-[var(--cloud-purple)]/50"
                  }`}
                >
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-[var(--ink)]" />
                  <div className="text-sm font-medium text-[var(--ink)]">CSV</div>
                  <div className="text-xs text-[var(--ink-secondary)]">Таблица</div>
                </button>

                <button
                  onClick={() => setFormat("json")}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    format === "json"
                      ? "border-[var(--cloud-purple)] bg-[var(--cloud-purple)]/10"
                      : "border-[var(--border)] hover:border-[var(--cloud-purple)]/50"
                  }`}
                >
                  <FileJson className="w-8 h-8 mx-auto mb-2 text-[var(--ink)]" />
                  <div className="text-sm font-medium text-[var(--ink)]">JSON</div>
                  <div className="text-xs text-[var(--ink-secondary)]">Структурированный</div>
                </button>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={!selectedClass || isExporting}
              className="w-full gradient-btn text-[var(--ink)] rounded-xl py-6 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Экспорт..." : "Скачать"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

