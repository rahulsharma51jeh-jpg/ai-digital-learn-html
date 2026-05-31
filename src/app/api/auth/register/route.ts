import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { handle, ok, fail } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = await req.json();
    const input = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return fail("An account with this email already exists", 409);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: await hashPassword(input.password),
        classLevel: input.classLevel ?? null,
      },
    });

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      classLevel: user.classLevel,
    });

    return ok(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        classLevel: user.classLevel,
      },
      { status: 201 }
    );
  });
}
