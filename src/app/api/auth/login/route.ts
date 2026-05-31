import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { handle, ok, fail } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = await req.json();
    const input = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user) return fail("Invalid email or password", 401);

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) return fail("Invalid email or password", 401);

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      classLevel: user.classLevel,
    });

    return ok({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      classLevel: user.classLevel,
    });
  });
}
