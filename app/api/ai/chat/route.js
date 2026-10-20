// app/api/ai/chat/route.js
import { chatRequestSchema } from "@/lib/ai/schemas";
import { AI_LIMITS } from "@/lib/ai/constants";
import {
  AppError,
  errorResponse,
  normalizeProviderError,
} from "@/lib/ai/errors";
import {
  assertJsonRequest,
  assertSameOrigin,
  readJsonBody,
  requireAIUser,
} from "@/lib/ai/http";
import { assertProviderConfigured } from "@/lib/ai/provider";
import { enforceRateLimit } from "@/lib/ai/rate-limit";
import { runAssistant } from "@/lib/ai/service";
import {
  addMessage,
  createConversation,
  deleteMessage,
  getConversation,
  listRecentMessages,
} from "@/lib/ai/conversation-service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    const user = await requireAIUser();

    const parsed = chatRequestSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new AppError(
        "invalid_request",
        400,
        parsed.error.issues[0]?.message || "Invalid request.",
      );
    }

    assertProviderConfigured();
    await enforceRateLimit(user.uid);

    const { message, regenerate } = parsed.data;
    let conversationId = parsed.data.conversationId;
    let history;

    if (conversationId) {
      const conversation = await getConversation(user.uid, conversationId);
      if (
        !regenerate &&
        conversation.messageCount >= AI_LIMITS.conversationMaxMessages
      ) {
        throw new AppError(
          "conversation_full",
          400,
          "This conversation is getting long. Please start a new chat.",
        );
      }
    } else {
      conversationId = await createConversation(user.uid, message);
    }

    if (regenerate) {
      history = await listRecentMessages(
        user.uid,
        conversationId,
        AI_LIMITS.historyMessages,
      );
      const last = history[history.length - 1];
      if (last?.role === "assistant") {
        await deleteMessage(user.uid, conversationId, last.id);
        history.pop();
      }
      if (history[history.length - 1]?.role !== "user") {
        throw new AppError(
          "nothing_to_regenerate",
          400,
          "There is nothing to regenerate yet.",
        );
      }
    } else {
      await addMessage(user.uid, conversationId, {
        role: "user",
        content: message,
      });
      history = await listRecentMessages(
        user.uid,
        conversationId,
        AI_LIMITS.historyMessages,
      );
    }

    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(AI_LIMITS.streamTimeoutMs),
    ]);
    const encoder = new TextEncoder();
    const uid = user.uid;
    const role = user.role ?? "student"; // prompt personalisation only, never authorisation

    const body = new ReadableStream({
      async start(controller) {
        const send = (event) => {
          try {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          } catch {
            // client disconnected
          }
        };

        let text = "";
        let usage = null;
        let failure = null;

        send({ type: "meta", conversationId });

        try {
          for await (const event of runAssistant({
            role,
            messages: history,
            signal,
          })) {
            if (event.type === "text") {
              text += event.text;
              send(event);
            } else if (event.type === "usage") {
              usage = {
                inputTokens: event.inputTokens,
                outputTokens: event.outputTokens,
              };
            }
          }
        } catch (error) {
          // Asal error terminal mein dikhane ke liye (debugging)
          console.error("[ai] provider error:", error);

          if (!request.signal.aborted) {
            failure = signal.aborted
              ? new AppError(
                  "timeout",
                  504,
                  "The response took too long. Please try again.",
                )
              : normalizeProviderError(error);
          }
        }

        let messageId = null;
        if (text.trim()) {
          try {
            messageId = await addMessage(uid, conversationId, {
              role: "assistant",
              content: text,
              usage,
              stopped: request.signal.aborted || Boolean(failure),
            });
          } catch (error) {
            console.error("[ai] failed to persist assistant message:", error);
          }
        }

        if (failure) {
          send({ type: "error", code: failure.code, message: failure.message });
        } else {
          send({ type: "done", messageId });
        }
        try {
          controller.close();
        } catch {
          // already closed
        }
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
        "X-Conversation-Id": conversationId,
      },
    });
  } catch (error) {
    console.error("[ai] request failed:", error);
    return errorResponse(error);
  }
}
