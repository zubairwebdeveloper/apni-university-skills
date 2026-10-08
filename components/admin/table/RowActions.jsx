// components/admin/table/RowActions.jsx
// items: [{ key, label, icon?, href?, run?, success?, destructive?, hidden?, separatorBefore?, confirm?: { title, description, confirmLabel? } }]
// The dialog lives OUTSIDE the menu so focus restores correctly after the menu closes.
"use client";
import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { FiMoreHorizontal } from "react-icons/fi";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn } from "@/lib/utils";

export function RowActions({ label, items }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(null);
  const visible = items.filter((i) => !i.hidden);
  if (!visible.length) return null;

  async function exec(item) {
    const res = await item.run();
    if (!res?.ok) return toast.error(res?.error ?? "Something went wrong.");
    toast.success(item.success ?? "Done");
    router.refresh();
  }
  const select = (item) =>
    item.href
      ? router.push(item.href)
      : item.confirm
        ? setConfirm(item)
        : exec(item);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "size-8",
          )}
          aria-label={`Actions for ${label}`}
        >
          <FiMoreHorizontal aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {visible.map((item) => {
            const Icon = item.icon;
            return (
              <Fragment key={item.key}>
                {item.separatorBefore && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  variant={item.destructive ? "destructive" : undefined}
                  onSelect={() => select(item)}
                >
                  {Icon && <Icon aria-hidden="true" />}
                  {item.label}
                </DropdownMenuItem>
              </Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.confirm?.title}
        description={confirm?.confirm?.description}
        confirmLabel={confirm?.confirm?.confirmLabel ?? confirm?.label}
        destructive={confirm?.destructive}
        onConfirm={() => exec(confirm)}
      />
    </>
  );
}

