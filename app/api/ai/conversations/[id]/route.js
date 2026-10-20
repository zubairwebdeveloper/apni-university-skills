// app/api/ai/conversations/[id]/route.js
import { NextResponse } from "next/server";
import { AppError, errorResponse } from "@/lib/ai/errors";
import {
  assertJsonRequest,
  assertSameOrigin,
  readJsonBody,
  requireAIUser,
} from "@/lib/ai/http";
import { conversationIdSchema, renameSchema } from "@/lib/ai/schemas";
import {
  deleteConversation,
  getConversation,
  listAllMessages,
  renameConversation,
} from "@/lib/ai/conversation-service";

export const runtime = "nodejs";

async function resolveId(context) {
  const parsed = conversationIdSchema.safeParse((await context.params).id);
  if (!parsed.success) {
    throw new AppError("not_found", 404, "Conversation not found.");
  }
  return parsed.data;
}

const noStore = { headers: { "Cache-Control": "no-store" } };

export async function GET(_request, context) {
  try {
    const user = await requireAIUser();
    const id = await resolveId(context);
    const conversation = await getConversation(user.uid, id);
    const messages = await listAllMessages(user.uid, id);
    return NextResponse.json({ conversation, messages }, noStore);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request, context) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    const user = await requireAIUser();
    const id = await resolveId(context);
    const parsed = renameSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new AppError(
        "invalid_request",
        400,
        parsed.error.issues[0]?.message || "Invalid title.",
      );
    }
    await renameConversation(user.uid, id, parsed.data.title);
    return NextResponse.json({ ok: true, title: parsed.data.title }, noStore);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, context) {
  try {
    assertSameOrigin(request);
    const user = await requireAIUser();
    const id = await resolveId(context);
    await deleteConversation(user.uid, id);
    return NextResponse.json({ ok: true }, noStore);
  } catch (error) {
    return errorResponse(error);
  }
}
