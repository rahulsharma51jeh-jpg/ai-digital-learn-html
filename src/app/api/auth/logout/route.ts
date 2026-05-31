import { clearSessionCookie } from "@/lib/auth";
import { handle, ok } from "@/lib/api";

export const runtime = "nodejs";

export async function POST() {
  return handle(async () => {
    clearSessionCookie();
    return ok({ loggedOut: true });
  });
}
