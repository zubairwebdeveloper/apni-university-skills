// components/admin/dashboard/DashboardCharts.jsx

import Link from "next/link";

import { ChartCard } from "@/components/admin/charts/ChartCard";
import {
  DonutChart,
  HBarChart,
  TrendChart,
} from "@/components/admin/charts/charts";

import { Rating } from "@/components/shared/Rating";
import { formatPrice } from "@/lib/utils/format";

const stateOf = (value, hasData) =>
  value === null ? "error" : hasData ? "ready" : "empty";

/**
 * Safely determine whether a chart dataset
 * contains at least one non-zero value.
 */
const nonZero = (points) =>
  Array.isArray(points) &&
  points.some((point) => Number(point?.value ?? 0) > 0);

export function DashboardCharts({ charts = {} }) {
  const {
    revenue,
    enrollments,
    students,
    paymentStatus,
    enrollmentStatus,
    popular,
    topRated,
    categories,
  } = charts;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {revenue !== undefined && (
        <ChartCard
          className="lg:col-span-2"
          title="Revenue over time"
          description={
            revenue?.currency
              ? `Paid orders per month, ${revenue.currency} (the currency with the most revenue)`
              : "Paid orders per month"
          }
          state={stateOf(revenue, nonZero(revenue?.points))}
          srHeaders={["Month", "Revenue"]}
          srRows={(revenue?.points ?? []).map((point) => [
            point.label,
            formatPrice(point.value, revenue?.currency),
          ])}
        >
          <TrendChart
            data={revenue?.points ?? []}
            valueKind="money"
            currency={revenue?.currency}
            name="Revenue"
          />
        </ChartCard>
      )}

      {paymentStatus !== undefined && (
        <ChartCard
          title="Payment status"
          state={stateOf(
            paymentStatus,
            nonZero(
              paymentStatus?.map((item) => ({
                value: item.value,
              })),
            ),
          )}
          srHeaders={["Status", "Payments"]}
          srRows={(paymentStatus ?? []).map((item) => [item.name, item.value])}
        >
          <DonutChart data={paymentStatus ?? []} />
        </ChartCard>
      )}

      {enrollments !== undefined && (
        <ChartCard
          className="lg:col-span-2"
          title="Enrollments over time"
          description="New enrollments per month"
          state={stateOf(enrollments, nonZero(enrollments))}
          srHeaders={["Month", "Enrollments"]}
          srRows={(enrollments ?? []).map((point) => [
            point.label,
            point.value,
          ])}
        >
          <TrendChart
            data={enrollments ?? []}
            kind="bar"
            name="Enrollments"
            color="var(--chart-2)"
          />
        </ChartCard>
      )}

      {enrollmentStatus !== undefined && (
        <ChartCard
          title="Course completion"
          description="Enrollments by status"
          state={stateOf(
            enrollmentStatus,
            nonZero(
              enrollmentStatus?.map((item) => ({
                value: item.value,
              })),
            ),
          )}
          srHeaders={["Status", "Enrollments"]}
          srRows={(enrollmentStatus ?? []).map((item) => [
            item.name,
            item.value,
          ])}
        >
          <DonutChart data={enrollmentStatus ?? []} />
        </ChartCard>
      )}

      {students !== undefined && (
        <ChartCard
          className="lg:col-span-2"
          title="Student growth"
          description="Total registered students at the end of each month"
          state={stateOf(students, nonZero(students))}
          srHeaders={["Month", "Total students"]}
          srRows={(students ?? []).map((point) => [point.label, point.value])}
        >
          <TrendChart
            data={students ?? []}
            name="Students"
            color="var(--chart-3)"
          />
        </ChartCard>
      )}

      {categories !== undefined && (
        <ChartCard
          title="Category performance"
          description="Students enrolled per category"
          state={stateOf(categories, nonZero(categories))}
          srHeaders={["Category", "Students"]}
          srRows={(categories ?? []).map((category) => [
            category.label,
            category.value,
          ])}
        >
          <HBarChart data={categories ?? []} color="var(--chart-3)" />
        </ChartCard>
      )}

      {popular !== undefined && (
        <ChartCard
          className="lg:col-span-2"
          title="Popular courses"
          description="Top published courses by students"
          state={stateOf(popular, nonZero(popular))}
          srHeaders={["Course", "Students"]}
          srRows={(popular ?? []).map((course) => [course.label, course.value])}
        >
          <HBarChart data={popular ?? []} />
        </ChartCard>
      )}

      {topRated !== undefined && (
        <ChartCard
          title="Course performance"
          description="Highest rated courses with at least one review"
          state={stateOf(
            topRated,
            Array.isArray(topRated) && topRated.length > 0,
          )}
        >
          <ol className="space-y-3">
            {(topRated ?? []).map((course) => (
              <li
                key={course.slug}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate font-medium">
                  {course.title}
                </span>

                <span className="shrink-0">
                  <Rating value={course.rating} count={course.reviewCount} />
                </span>
              </li>
            ))}
          </ol>
        </ChartCard>
      )}
    </div>
  );
}
