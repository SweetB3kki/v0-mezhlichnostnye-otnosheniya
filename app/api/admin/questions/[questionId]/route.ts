import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type RouteContext = {
  params: { questionId: string } | Promise<{ questionId: string }>;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminAuthenticated(request.cookies)) {
    return unauthorized();
  }

  const { questionId } = await Promise.resolve(context.params);

  const exists = await prisma.questionBank.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json({ error: "Вопрос не найден" }, { status: 404 });
  }

  await prisma.questionBank.delete({
    where: { id: questionId },
  });

  return NextResponse.json({ ok: true });
}
