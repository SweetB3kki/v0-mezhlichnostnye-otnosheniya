import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request.cookies)) {
    return unauthorized();
  }

  const classes = await prisma.class.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      teacher: true,
      _count: { select: { students: true } },
    },
  });

  return NextResponse.json(classes);
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request.cookies)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const teacherRaw = typeof body?.teacher === "string" ? body.teacher.trim() : "";
  const teacher = teacherRaw.length > 0 ? teacherRaw : null;

  if (!name) {
    return NextResponse.json({ error: "Название класса обязательно" }, { status: 400 });
  }

  const created = await prisma.class.create({
    data: { name, teacher },
    select: {
      id: true,
      name: true,
      teacher: true,
      _count: { select: { students: true } },
    },
  });

  return NextResponse.json(created, { status: 201 });
}
