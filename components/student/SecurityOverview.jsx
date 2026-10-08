import { FiShield, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

export function SecurityOverview({ user }) {
  const hasPassword =
    user.providerData?.some((p) => p.providerId === "password") ?? true;

  const checks = [
    { label: "Email verified", ok: !!user.emailVerified },
    { label: "Password sign-in enabled", ok: hasPassword },
  ];
  const good = checks.filter((c) => c.ok).length;
  const allGood = good === checks.length;

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center ${
        allGood
          ? "bg-gradient-to-r from-emerald-500/10 to-transparent"
          : "bg-gradient-to-r from-amber-500/10 to-transparent"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          allGood
            ? "bg-emerald-500/15 text-emerald-600"
            : "bg-amber-500/15 text-amber-600"
        }`}
      >
        <FiShield className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">
          {allGood
            ? "Your account looks secure"
            : "A few things need attention"}
        </p>
        <p className="text-sm text-muted-foreground">
          {good} of {checks.length} security checks passed
        </p>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {checks.map(({ label, ok }) => (
          <li key={label} className="flex items-center gap-1.5">
            {ok ? (
              <FiCheckCircle className="text-emerald-500" />
            ) : (
              <FiAlertTriangle className="text-amber-500" />
            )}
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
