// lib/ai/service.js
import "server-only";
import { buildSystemPrompt } from "./system-prompt";
import { retrieveCourseContext } from "./course-context";
import { streamChat } from "./provider";

function startWithUser(messages) {
  const first = messages.findIndex((m) => m.role === "user");
  return first === -1 ? [] : messages.slice(first);
}

export async function* runAssistant({ role, messages, signal }) {
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const courseContext = await retrieveCourseContext(lastUser);

  yield* streamChat({
    system: buildSystemPrompt({ role, courseContext }),
    messages: startWithUser(messages).map(({ role: r, content }) => ({
      role: r,
      content,
    })),
    signal,
  });
}
