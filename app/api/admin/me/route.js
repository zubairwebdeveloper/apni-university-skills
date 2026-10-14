// app/api/admin/me/route.js
import { NextResponse } from "next/server";

import { assertPermission } from "@/lib/auth/authorize";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Tells the navbar whether the signed-in user has an entry in the `admins`
 * collection. It uses the same checks as the admin pages (cookie, verified
 * email, admins/{email} doc), so the navbar and the real access never disagree.
 * It always answers 200, so a normal student causes no errors in the console.
 */
export async function GET() {
  try {
    // No permission argument: any admin, editor or instructor counts as staff.
    const actor = await assertPermission();
    return NextResponse.json(
      { isAdmin: true, role: actor.role },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json({ isAdmin: false }, { headers: NO_STORE });
  }
}
