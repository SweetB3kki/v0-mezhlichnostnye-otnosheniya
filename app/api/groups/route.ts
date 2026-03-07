import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function POST(req: Request) {
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
