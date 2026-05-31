import { getSession } from "@/lib/auth";
import { handle, ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const session = await getSession();
    if (!session) return ok({ user: null });
    return ok({
      user: {
        id: session.sub,
        name: session.name,
        email: session.email,
        role: session.role,
        classLevel: session.classLevel,
      },
    });
  });
}
