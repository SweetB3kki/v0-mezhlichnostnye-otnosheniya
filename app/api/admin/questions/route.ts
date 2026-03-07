import { type NextRequest, NextResponse } from "next/server";
import { ResponseKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type QuestionKind = "SOCIOMETRY" | "FIRO";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isQuestionKind(value: string): value is QuestionKind {
  return value === "SOCIOMETRY" || value === "FIRO";
}

function buildQuestionKey(kind: QuestionKind): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `custom_${kind.toLowerCase()}_${timestamp}_${random}`;
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request.cookies)) {
    return unauthorized();
  }

  const questions = await prisma.questionBank.findMany({
    orderBy: [{ kind: "asc" }, { key: "asc" }],
    select: {
      id: true,
      kind: true,
      key: true,
      text: true,
      isActive: true,
    },
  });

  return NextResponse.json(questions);
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request.cookies)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const kindRaw = typeof body?.kind === "string" ? body.kind.trim().toUpperCase() : "";
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!isQuestionKind(kindRaw)) {
    return NextResponse.json({ error: "Некорректный тип вопроса" }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Текст вопроса обязателен" }, { status: 400 });
  }

  const created = await prisma.questionBank.create({
    data: {
      kind: kindRaw === "SOCIOMETRY" ? ResponseKind.SOCIOMETRY : ResponseKind.FIRO,
      key: buildQuestionKey(kindRaw),
      text,
      isActive: true,
    },
    select: {
      id: true,
      kind: true,
      key: true,
      text: true,
      isActive: true,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
