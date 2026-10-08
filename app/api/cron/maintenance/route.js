// app/api/cron/maintenance/route.js
import { NextResponse } from "next/server";
import { cronGuard } from "@/lib/cron";
import {
  cleanupStorage,
  reconcilePayments,
  recountCourses,
  releaseStaleReservations,
} from "@/services/admin/maintenanceService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req) {
  const denied = cronGuard(req);
  if (denied) return denied;
  const only = new URL(req.url).searchParams.get("task");
  const weekly = new Date().getUTCDay() === 0; // heavy jobs run on Sundays, or on demand with ?task=
  const jobs = {
    payments: [true, reconcilePayments],
    reservations: [true, releaseStaleReservations],
    recount: [weekly, recountCourses],
    storage: [weekly, cleanupStorage],
  };
  const out = {};
  for (const [name, [daily, fn]] of Object.entries(jobs)) {
    if (only ? only !== name : !daily) continue;
    try {
      out[name] = await fn();
    } catch (e) {
      console.error("[maintenance]", name, e);
      out[name] = { error: "failed" };
    }
  }
  return NextResponse.json(out);
}

