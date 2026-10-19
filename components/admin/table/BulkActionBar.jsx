// components/admin/table/BulkActionBar.jsx
// actions: [{ key, label, icon?, destructive?, confirm?: { title, description, confirmLabel? } }]
// run(actionKey, ids) => server action result
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { FiLoader, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const pressable =
  "transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

// Confirm copy uses "{n}" as a placeholder for the number of selected rows.
function fillCount(text, n) {
  return typeof text === "string" ? text.replace(/\{n\}/g, String(n)) : text;
}

export function BulkActionBar({ selectedIds, actions, run, onClear }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyKey, setBusyKey] = useState(null);

  async function exec(action) {
    setBusy(true);
    setBusyKey(action.key);
    try {
      const res = await run(action.key, selectedIds);
      if (!res.ok) return toast.error(res.error);
      const d = res.data ?? {};
      (d.updated === 0 ? toast.info : toast.success)(d.message ?? "Done");
      onClear();
      router.refresh();
    } catch (err) {
      console.error("Bulk action failed", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
      setBusyKey(null);
    }
  }

  const count = selectedIds.length;

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            role="region"
            aria-label="Bulk actions"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="sticky bottom-4 z-20 mx-auto mt-4 flex w-full max-w-full flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg sm:w-fit"
          >
            <p
              className="flex items-center gap-2 px-2 text-sm font-medium text-foreground"
              aria-live="polite"
            >
              <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 text-xs font-semibold leading-4 tabular-nums text-violet-700 dark:text-violet-300">
                {count}
              </span>
              selected
            </p>

            <span
              aria-hidden="true"
              className="mx-1 hidden h-6 w-px bg-border sm:block"
            />

            {actions.map((a) => {
              const Icon = a.icon;
              const loading = busy && busyKey === a.key;
              return (
                <Button
                  key={a.key}
                  type="button"
                  size="sm"
                  variant={a.destructive ? "destructive" : "outline"}
                  disabled={busy}
                  onClick={() => (a.confirm ? setConfirm(a) : exec(a))}
                  className={`gap-1.5 ${pressable}`}
                >
                  {loading ? (
                    <FiLoader
                      aria-hidden="true"
                      className="size-4 animate-spin motion-reduce:animate-none"
                    />
                  ) : (
                    Icon && <Icon aria-hidden="true" className="size-4" />
                  )}
                  {a.label}
                </Button>
              );
            })}

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onClear}
              disabled={busy}
              className={`ml-auto gap-1.5 sm:ml-0 ${pressable}`}
            >
              <FiX aria-hidden="true" className="size-4" />
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={fillCount(confirm?.confirm?.title, count)}
        description={fillCount(confirm?.confirm?.description, count)}
        confirmLabel={confirm?.confirm?.confirmLabel ?? confirm?.label}
        destructive={confirm?.destructive}
        onConfirm={() => exec(confirm)}
      />
    </>
  );
}
