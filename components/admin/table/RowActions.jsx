"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // agar aap dusra toast use karte hain to badal dein
import { FiMoreHorizontal } from "react-icons/fi";

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

export function RowActions({ label, items }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(null); // item jis ka confirm pending hai

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
            />
          }
        >
          <FiMoreHorizontal aria-hidden="true" className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {visible.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                {Icon && <Icon aria-hidden="true" className="mr-2 size-4" />}
                {item.label}
              </>
            );

            return (
              <div key={item.key}>
                {item.separatorBefore && <DropdownMenuSeparator />}
                {item.href ? (
                  <DropdownMenuItem render={<Link href={item.href} />}>
                    {content}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onPick(item)}
                    className={cn(
                      item.destructive &&
                        "text-destructive focus:text-destructive",
                    )}
                  >
                    {content}
                  </DropdownMenuItem>
                )}
              </div>
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
            <AlertDialogTitle>{confirming?.confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirming?.confirm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const item = confirming;
                setConfirming(null);
                execute(item);
              }}
            >
              {confirming?.confirm?.confirmLabel || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
