// components/admin/charts/charts.jsx: recharts needs the browser. Props are plain data (no functions).
"use client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "framer-motion";
import { formatCompact, formatPrice } from "@/lib/utils/format";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--popover-foreground)",
};
const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};
const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const fmt = (kind, currency) => (v) =>
  kind === "money"
    ? formatPrice(v, currency)
    : Number(v).toLocaleString("en-US");
const tick = (kind, currency) => (v) =>
  kind === "money"
    ? formatPrice(v, currency).replace(/\.\d+/, "")
    : formatCompact(v);

export function TrendChart({
  data,
  kind = "area",
  valueKind = "count",
  currency,
  name = "Value",
  color = "var(--chart-1)",
}) {
  const reduce = useReducedMotion();
  const common = { data, margin: { top: 8, right: 8, left: 0, bottom: 0 } };
  const grid = <CartesianGrid vertical={false} stroke="var(--border)" />;
  const x = (
    <XAxis
      dataKey="label"
      {...axis}
      interval="preserveStartEnd"
      minTickGap={16}
    />
  );
  const y = (
    <YAxis
      {...axis}
      width={52}
      allowDecimals={false}
      tickFormatter={tick(valueKind, currency)}
    />
  );
  const tip = (
    <Tooltip
      contentStyle={tooltipStyle}
      formatter={(v) => [fmt(valueKind, currency)(v), name]}
      cursor={{ fill: "var(--accent)", stroke: "var(--border)" }}
    />
  );
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {kind === "bar" ? (
          <BarChart {...common}>
            {grid}
            {x}
            {y}
            {tip}
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
              isAnimationActive={!reduce}
            />
          </BarChart>
        ) : (
          <AreaChart {...common}>
            {grid}
            {x}
            {y}
            {tip}
            <Area
              dataKey="value"
              type="monotone"
              stroke={color}
              fill={color}
              fillOpacity={0.15}
              strokeWidth={2}
              isAnimationActive={!reduce}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function HBarChart({
  data,
  name = "Students",
  color = "var(--chart-1)",
}) {
  const reduce = useReducedMotion();
  return (
    <div className="w-full" style={{ height: Math.max(160, data.length * 44) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            {...axis}
            allowDecimals={false}
            tickFormatter={formatCompact}
          />
          <YAxis
            type="category"
            dataKey="label"
            {...axis}
            width={112}
            tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [Number(v).toLocaleString("en-US"), name]}
            cursor={{ fill: "var(--accent)" }}
          />
          <Bar
            dataKey="value"
            fill={color}
            radius={[0, 4, 4, 0]}
            isAnimationActive={!reduce}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// The legend is real HTML (name + count + share), so meaning never depends on color alone
export function DonutChart({ data }) {
  const reduce = useReducedMotion();
  const total = data.reduce((n, d) => n + d.value, 0);
  const shown = data.filter((d) => d.value > 0);
  return (
    <div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={shown}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={2}
              stroke="var(--card)"
              isAnimationActive={!reduce}
            >
              {shown.map((d) => (
                <Cell
                  key={d.name}
                  fill={
                    PALETTE[
                      data.findIndex((x) => x.name === d.name) % PALETTE.length
                    ]
                  }
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: PALETTE[i % PALETTE.length] }}
              aria-hidden="true"
            />
            <span className="flex-1 capitalize">{d.name}</span>
            <span className="font-medium">
              {d.value.toLocaleString("en-US")}
            </span>
            <span className="w-10 text-right text-xs text-muted-foreground">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

