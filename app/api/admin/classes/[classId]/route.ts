import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type RouteContext = {
  params: { classId: string } | Promise<{ classId: string }>;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminAuthenticated(request.cookies)) {
    return unauthorized();
  }

  const { classId } = await Promise.resolve(context.params);

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true },
  });

  if (!cls) {
    return NextResponse.json({ error: "Класс не найден" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    const students = await tx.student.findMany({
      where: { classId },
      select: { id: true },
    });
    const studentIds = students.map((student) => student.id);
    const sessionWhere =
      studentIds.length > 0
        ? {
            OR: [{ classId }, { studentId: { in: studentIds } }],
          }
        : { classId };

    const sessions = await tx.testSession.findMany({
      where: sessionWhere,
      select: { id: true },
    });
    const sessionIds = sessions.map((session) => session.id);

    if (sessionIds.length > 0) {
      await tx.response.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });
      await tx.testSession.deleteMany({
        where: { id: { in: sessionIds } },
      });
    }

    if (studentIds.length > 0) {
      await tx.student.deleteMany({
        where: {
          id: { in: studentIds },
        },
      });
    }

    await tx.class.delete({
      where: { id: classId },
    });
  });

  return NextResponse.json({ ok: true });
}
