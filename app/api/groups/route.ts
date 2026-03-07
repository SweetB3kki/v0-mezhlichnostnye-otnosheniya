import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  const classes = await prisma.class.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      teacher: true,
      createdAt: true,
      _count: { select: { students: true } },
    },
  });

  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const teacher = typeof body?.teacher === "string" ? body.teacher.trim() : null;

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const created = await prisma.class.create({
    data: { name, teacher },
    select: { id: true, name: true, teacher: true },
  });

  return NextResponse.json(created);
}
