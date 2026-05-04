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

  const students = await prisma.student.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      classId: true,
      class: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request.cookies)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const classId = typeof body?.classId === "string" ? body.classId.trim() : "";

  if (!firstName || !lastName || !classId) {
    return NextResponse.json(
      { error: "Имя, фамилия и класс обязательны" },
      { status: 400 },
    );
  }

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true },
  });

  if (!cls) {
    return NextResponse.json({ error: "Класс не найден" }, { status: 404 });
  }

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      classId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      classId: true,
      class: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json(student, { status: 201 });
}
