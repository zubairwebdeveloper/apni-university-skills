"use client";

import { Fragment, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // agar aap dusra toast use karte hain to badal dein
import { FiAlertTriangle, FiLoader, FiMoreHorizontal } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const pressable =
  "transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

export function RowActions({ label, items }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(null); // item jis ka confirm pending hai

  // Keep the last confirm item so the dialog text doesn't go blank
  // while its close animation is still running.
  const lastConfirming = useRef(null);
  if (confirming) lastConfirming.current = confirming;
  const shown = confirming ?? lastConfirming.current;

  const visible = items.filter((i) => !i.hidden);
  if (!visible.length) return null;

  const execute = (item) => {
    startTransition(async () => {
      try {
        const res = await item.run?.();
        // adminAction ka result { ok, error } jaisa ho sakta hai: apne shape ke mutabiq adjust karein
        if (res && res.ok === false) {
          toast.error(res.error || "Something went wrong.");
          return;
        }
        toast.success(item.success || "Done.");
        router.refresh();
      } catch (error) {
        toast.error(error?.message || "Something went wrong.");
      }
    });
  };

  const onPick = (item) => {
    if (item.confirm) setConfirming(item);
    else execute(item);
  };

  const destructiveDialog = Boolean(shown?.destructive);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${label}`}
              disabled={pending}
              className={cn(
                "size-8 text-muted-foreground hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                pressable,
              )}
            />
          }
        >
          {pending ? (
            <FiLoader
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <FiMoreHorizontal aria-hidden="true" className="size-4" />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-44">
          {visible.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                {Icon && (
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "size-4 shrink-0",
                      item.destructive
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  />
                )}
                <span className="truncate">{item.label}</span>
              </>
            );

            return (
              <Fragment key={item.key}>
                {item.separatorBefore && <DropdownMenuSeparator />}
                {item.href ? (
                  <DropdownMenuItem
                    render={<Link href={item.href} />}
                    className="gap-2.5 text-sm"
                  >
                    {content}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onPick(item)}
                    className={cn(
                      "gap-2.5 text-sm",
                      item.destructive &&
                        "text-destructive focus:bg-destructive/10 focus:text-destructive",
                    )}
                  >
                    {content}
                  </DropdownMenuItem>
                )}
              </Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={Boolean(confirming)}
        onOpenChange={(o) => !o && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            {destructiveDialog && (
              <span
                aria-hidden="true"
                className="mb-1 flex size-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
              >
                <FiAlertTriangle className="size-5" />
              </span>
            )}
            <AlertDialogTitle className="text-lg font-semibold tracking-tight">
              {shown?.confirm?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              {shown?.confirm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={pressable}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                pressable,
                destructiveDialog &&
                  "bg-destructive text-white hover:bg-destructive/90",
              )}
              onClick={() => {
                const item = confirming;
                setConfirming(null);
                execute(item);
              }}
            >
              {shown?.confirm?.confirmLabel || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
