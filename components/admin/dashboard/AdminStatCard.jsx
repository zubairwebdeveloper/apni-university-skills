// components/admin/dashboard/AdminStatCard.jsx (server component)
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { isNavReady } from "@/config/adminNav";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const num = new Intl.NumberFormat("en-US");

function display(tile, value) {
  if (value === null)
    return {
      main: "Unavailable",
      hint: "Couldn't load this figure",
      muted: true,
    };
  if (tile.kind === "money") {
    if (!value.length) return { main: "—", hint: "No paid orders yet" };
    const [first, ...rest] = value;
    return {
      main: formatPrice(first.amount, first.currency),
      hint: rest.length
        ? `Also ${rest.map((r) => formatPrice(r.amount, r.currency)).join(" · ")}`
        : tile.hint,
    };
  }
  return { main: num.format(value), hint: tile.hint };
}

export function AdminStatCard({ tile, value }) {
  const { main, hint, muted } = display(tile, value);
  const Icon = tile.icon;
  const card = (
    <Card className="h-full flex-row items-start gap-4 p-5 transition-shadow group-hover:shadow-md">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{tile.label}</p>
        <p
          className={cn(
            "font-serif text-2xl font-semibold",
            muted && "text-base font-normal text-muted-foreground",
          )}
        >
          {main}
        </p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
  return tile.href && isNavReady(tile.href) ? (
    <Link
      href={tile.href}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  ) : (
    card
  );
}

