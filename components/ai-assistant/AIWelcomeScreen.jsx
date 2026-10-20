// AIWelcomeScreen.jsx
import { Sparkles } from "lucide-react";
import { AIQuickActions } from "./AIQuickActions";

export function AIWelcomeScreen({ onSelect, compact }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-xl space-y-5">
        <div className="space-y-2">
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-xl bg-[#FACC15] text-[#111318]"
          >
            <Sparkles className="size-5" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight">
            What would you like to learn today?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ask about courses, programming concepts or code errors. I can&apos;t
            see your account, enrollments or payments, and I only mention
            courses that exist in the catalog.
          </p>
        </div>
        <AIQuickActions onSelect={onSelect} compact={compact} />
      </div>
    </div>
  );
}
