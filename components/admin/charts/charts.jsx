// components/admin/charts/charts.jsx: recharts needs the browser. Props are plain data (no functions).
"use client";
import { useId } from "react";
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
  borderRadius: 10,
  fontSize: 12,
  padding: "8px 12px",
  color: "var(--popover-foreground)",
  boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.25)",
};
const tooltipLabelStyle = {
  color: "var(--muted-foreground)",
  fontSize: 11,
  fontWeight: 500,
  marginBottom: 4,
};
const tooltipItemStyle = {
  color: "var(--popover-foreground)",
  fontWeight: 600,
  padding: 0,
};
const tooltipWrapperStyle = { outline: "none" };

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};
const gridStroke = "var(--border)";
const gridDash = "3 4";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const ANIMATION_MS = 600;

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
  // useId output contains colons; strip them so url(#id) is always valid in SVG
  const gradientId = `trend-${useId().replace(/:/g, "")}`;
  const common = { data, margin: { top: 12, right: 8, left: 0, bottom: 0 } };
  const grid = (
    <CartesianGrid
      vertical={false}
      stroke={gridStroke}
      strokeDasharray={gridDash}
    />
  );
  const x = (
    <XAxis
      dataKey="label"
      {...axis}
      tickMargin={10}
      interval="preserveStartEnd"
      minTickGap={16}
    />
  );
  const y = (
    <YAxis
      {...axis}
      width={52}
      tickMargin={4}
      allowDecimals={false}
      tickFormatter={tick(valueKind, currency)}
    />
  );
  const tip = (
    <Tooltip
      contentStyle={tooltipStyle}
      labelStyle={tooltipLabelStyle}
      itemStyle={tooltipItemStyle}
      wrapperStyle={tooltipWrapperStyle}
      formatter={(v) => [fmt(valueKind, currency)(v), name]}
      cursor={
        kind === "bar"
          ? { fill: "var(--accent)", opacity: 0.6 }
          : { stroke: "var(--border)", strokeWidth: 1 }
      }
    />
  );
  return (
    <div className="h-56 w-full sm:h-64 lg:h-72">
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
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
              isAnimationActive={!reduce}
              animationDuration={ANIMATION_MS}
            />
          </BarChart>
        ) : (
          <AreaChart {...common}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {grid}
            {x}
            {y}
            {tip}
            <Area
              dataKey="value"
              type="monotone"
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "var(--card)",
                fill: color,
              }}
              isAnimationActive={!reduce}
              animationDuration={ANIMATION_MS}
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
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            horizontal={false}
            stroke={gridStroke}
            strokeDasharray={gridDash}
          />
          <XAxis
            type="number"
            {...axis}
            tickMargin={8}
            allowDecimals={false}
            tickFormatter={formatCompact}
          />
          <YAxis
            type="category"
            dataKey="label"
            {...axis}
            width={112}
            tickMargin={4}
            tickFormatter={(v) => {
              const s = String(v);
              return s.length > 16 ? `${s.slice(0, 15)}…` : s;
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            wrapperStyle={tooltipWrapperStyle}
            formatter={(v) => [Number(v).toLocaleString("en-US"), name]}
            cursor={{ fill: "var(--accent)", opacity: 0.6 }}
          />
          <Bar
            dataKey="value"
            fill={color}
            radius={[0, 6, 6, 0]}
            barSize={20}
            isAnimationActive={!reduce}
            animationDuration={ANIMATION_MS}
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
      <div className="relative h-44 w-full sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={shown}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={!reduce}
              animationDuration={ANIMATION_MS}
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
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              wrapperStyle={tooltipWrapperStyle}
              formatter={(v, n) => [Number(v).toLocaleString("en-US"), n]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <div className="text-center leading-tight">
            <p className="text-xl font-semibold tabular-nums tracking-tight">
              {formatCompact(total)}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total
            </p>
          </div>
        </div>
      </div>
      <ul className="mt-4 divide-y divide-border/60 text-sm">
        {data.map((d, i) => (
          <li
            key={d.name}
            className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: PALETTE[i % PALETTE.length] }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate capitalize">{d.name}</span>
            <span className="font-medium tabular-nums">
              {d.value.toLocaleString("en-US")}
            </span>
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
