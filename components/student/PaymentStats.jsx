import {
  FiDollarSign,
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

const fmt = (cents, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );

export function PaymentStats({ payments }) {
  const paid = payments.filter((p) => p.status === "succeeded");
  const pending = payments.filter((p) => p.status === "pending");
  const total = paid.reduce((sum, p) => sum + p.amount, 0);
  const last = paid[0]?.createdAt
    ? new Date(paid[0].createdAt).toLocaleDateString("en-US", {
        dateStyle: "medium",
      })
    : "—";

  const stats = [
    {
      label: "Total spent",
      value: fmt(total, paid[0]?.currency),
      icon: FiDollarSign,
    },
    { label: "Courses purchased", value: paid.length, icon: FiShoppingBag },
    { label: "Pending", value: pending.length, icon: FiClock },
    { label: "Last payment", value: last, icon: FiCheckCircle },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}
