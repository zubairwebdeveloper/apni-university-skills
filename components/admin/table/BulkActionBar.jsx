// components/admin/table/BulkActionBar.jsx
// actions: [{ key, label, icon?, destructive?, confirm?: { title, description, confirmLabel? } }]
// run(actionKey, ids) => server action result
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function BulkActionBar({ selectedIds, actions, run, onClear }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  async function exec(action) {
    setBusy(true);
    const res = await run(action.key, selectedIds);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    const d = res.data ?? {};
    (d.updated === 0 ? toast.info : toast.success)(d.message ?? "Done");
    onClear();
    router.refresh();
  }

  return (
    <>
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            role="region"
            aria-label="Bulk actions"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="sticky bottom-4 z-20 mx-auto mt-4 flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border bg-card p-2 shadow-lg"
          >
            <p className="px-2 text-sm font-medium" aria-live="polite">
              {selectedIds.length} selected
            </p>
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <Button
                  key={a.key}
                  type="button"
                  size="sm"
                  variant={a.destructive ? "destructive" : "outline"}
                  disabled={busy}
                  onClick={() => (a.confirm ? setConfirm(a) : exec(a))}
                >
                  {Icon && <Icon aria-hidden="true" />}
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
            >
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.confirm?.title}
        description={confirm?.confirm?.description?.replace(
          "{n}",
          selectedIds.length,
        )}
        confirmLabel={confirm?.confirm?.confirmLabel ?? confirm?.label}
        destructive={confirm?.destructive}
        onConfirm={() => exec(confirm)}
      />
    </>
  );
}

