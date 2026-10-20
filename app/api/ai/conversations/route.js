// app/api/ai/conversations/route.js
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/ai/errors";
import { requireAIUser } from "@/lib/ai/http";
import { listConversations } from "@/lib/ai/conversation-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireAIUser();
    const conversations = await listConversations(user.uid);
    return NextResponse.json(
      { conversations },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
