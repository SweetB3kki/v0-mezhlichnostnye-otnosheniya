import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type RouteContext = {
  params: { studentId: string } | Promise<{ studentId: string }>;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminAuthenticated(request.cookies)) {
    return unauthorized();
  }

  const { studentId } = await Promise.resolve(context.params);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Учащийся не найден" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.response.deleteMany({
      where: {
        session: {
          studentId,
        },
      },
    });

    await tx.testSession.deleteMany({
      where: { studentId },
    });

    await tx.student.delete({
      where: { id: studentId },
    });
  });

  return NextResponse.json({ ok: true });
}
