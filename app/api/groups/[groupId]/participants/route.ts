import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  ctx: { params: { groupId: string } | Promise<{ groupId: string }> }
) {
  const { groupId } = await Promise.resolve(ctx.params);
  const withClass = new URL(req.url).searchParams.get("withClass") === "1";

  const studentsPromise = prisma.student.findMany({
    where: { classId: groupId },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true, classId: true },
  });

  if (withClass) {
    const [group, students] = await Promise.all([
      prisma.class.findUnique({
        where: { id: groupId },
        select: { id: true, name: true, teacher: true },
      }),
      studentsPromise,
    ]);

    if (!group) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ class: group, students });
  }

  const students = await studentsPromise;

  return NextResponse.json(students);
}

export async function POST(
  req: Request,
  ctx: { params: { groupId: string } | Promise<{ groupId: string }> }
) {
  const { groupId } = await Promise.resolve(ctx.params);
  const body = await req.json().catch(() => null);

  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";

  let fn = firstName;
  let ln = lastName;

  if ((!fn || !ln) && fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean);
    ln = parts[0] ?? "";
    fn = parts.slice(1).join(" ") || "";
  }

  if (!fn || !ln) {
    return NextResponse.json(
      { error: "firstName/lastName required (or fullName)" },
      { status: 400 }
    );
  }

  const created = await prisma.student.create({
    data: { firstName: fn, lastName: ln, classId: groupId },
    select: { id: true, firstName: true, lastName: true, classId: true },
  });

  return NextResponse.json(created);
}
