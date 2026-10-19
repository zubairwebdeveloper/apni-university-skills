// components/admin/coupons/CouponForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { Ticket } from "lucide-react";
import { toast } from "sonner";
import { TextField } from "@/components/shared/TextField";
import {
  CheckboxListField,
  DateField,
  FormFooter,
  FormSection,
  NumberField,
  SelectField,
} from "@/components/admin/forms/fields";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { couponSchema } from "@/lib/validations/coupon";
import { utcDate } from "@/lib/utils/date";
import { formatPrice } from "@/lib/utils/format";
import { createCoupon, updateCoupon } from "@/app/actions/admin/coupons";

const defaults = (c) => ({
  code: c?.code ?? "",
  description: c?.description ?? "",
  type: c?.type ?? "percentage",
  value: c?.value ?? 10,
  currency: c?.currency ?? "USD",
  minPurchase: c?.minPurchase ?? 0,
  maxDiscount: c?.maxDiscount ?? "",
  usageLimit: c?.usageLimit ?? "",
  perUserLimit: c?.perUserLimit ?? 1,
  startsAt: utcDate(c?.startsAt),
  expiresAt: utcDate(c?.expiresAt),
  courseIds: c?.courseIds ?? [],
  categoryIds: c?.categoryIds ?? [],
});

// Staggered fade-and-slide entrance; fully off under prefers-reduced-motion
function Reveal({ index = 0, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: reduce ? 0 : index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Read-only summary built from what the admin has typed so far
function DiscountPreview({ control }) {
  const [type, value, currency] = useWatch({
    control,
    name: ["type", "value", "currency"],
  });
  const n = Number(value);
  if (value === "" || !Number.isFinite(n) || n <= 0) return null;
  const text =
    type === "fixed" ? `${formatPrice(n, currency)} off` : `${n}% off`;
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3.5 py-3">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#FACC15]/15 text-[#a16207] dark:text-[#FACC15]"
      >
        <Ticket className="size-4" />
      </span>
      <p className="text-sm">
        <span className="text-muted-foreground">Customers will get </span>
        <span className="font-semibold tabular-nums">{text}</span>
        <span className="text-muted-foreground"> eligible courses.</span>
      </p>
    </div>
  );
}

export function CouponForm({ record = null, courses, categories }) {
  const router = useRouter();
  const edit = !!record;
  const form = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: defaults(record),
  });
  const type = useWatch({ control: form.control, name: "type" });
  const c = form.control;

  async function onSubmit(values) {
    const res = edit
      ? await updateCoupon({
          currentSlug: record.slug,
          ifUpdatedAt: record.updatedAt,
          values,
        })
      : await createCoupon(values);
    if (!res.ok) {
      if (res.code === "409" && /slug/i.test(res.error))
        form.setError("code", { message: "That coupon code already exists." });
      return toast.error(res.error);
    }
    toast.success(
      edit ? "Coupon updated successfully." : "Coupon created successfully.",
    );
    router.push("/admin/coupons");
    router.refresh();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <Reveal index={0}>
        <FormSection
          title="Coupon"
          description="The code customers enter at checkout, plus a private note for your team."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              control={c}
              name="code"
              label="Code"
              disabled={edit}
              autoComplete="off"
              description={
                edit
                  ? "A code can't be changed after creation."
                  : "Letters, numbers, hyphens. Customers type this at checkout."
              }
            />
            <TextField
              control={c}
              name="description"
              label="Internal note"
              description="Only staff see this."
            />
          </div>
        </FormSection>
      </Reveal>

      <Reveal index={1}>
        <FormSection
          title="Discount"
          description="Choose how much the coupon takes off and the conditions it needs."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <SelectField
              control={c}
              name="type"
              label="Type"
              options={[
                { value: "percentage", label: "Percentage" },
                { value: "fixed", label: "Fixed amount" },
              ]}
            />
            <NumberField
              control={c}
              name="value"
              label={type === "fixed" ? "Amount off" : "Percent off"}
            />
            {type === "fixed" ? (
              <SelectField
                control={c}
                name="currency"
                label="Currency"
                options={SUPPORTED_CURRENCIES.map((x) => ({
                  value: x,
                  label: x,
                }))}
                description="Only applies to courses priced in this currency."
              />
            ) : (
              <NumberField
                control={c}
                name="maxDiscount"
                label="Maximum discount (optional)"
                description="Cap in the course's currency."
              />
            )}
          </div>
          <NumberField
            control={c}
            name="minPurchase"
            label="Minimum purchase"
            description="The course price must be at least this much. A coupon can't bring any price below 0.50."
          />
          <DiscountPreview control={c} />
        </FormSection>
      </Reveal>

      <Reveal index={2}>
        <FormSection
          title="Limits and dates"
          description="Control how often the coupon can be used and when it is valid."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              control={c}
              name="usageLimit"
              label="Total usage limit (optional)"
              step={1}
            />
            <NumberField
              control={c}
              name="perUserLimit"
              label="Uses per student"
              step={1}
            />
            <DateField
              control={c}
              name="startsAt"
              label="Starts on (optional)"
              description="UTC, from the start of the day."
            />
            <DateField
              control={c}
              name="expiresAt"
              label="Expires on (optional)"
              description="UTC, through the end of the day."
            />
          </div>
        </FormSection>
      </Reveal>

      <Reveal index={3}>
        <FormSection
          title="Applies to"
          description="Leave both lists empty to apply to every paid course. If you pick any, the coupon works for those courses and for any course in those categories."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <CheckboxListField
              control={c}
              name="courseIds"
              label="Courses"
              options={courses.map((x) => ({ value: x.id, label: x.title }))}
              description="Published courses (first 100)."
            />
            <CheckboxListField
              control={c}
              name="categoryIds"
              label="Categories"
              options={categories.map((x) => ({ value: x.id, label: x.name }))}
            />
          </div>
        </FormSection>
      </Reveal>

      <FormFooter
        submitting={form.formState.isSubmitting}
        cancelHref="/admin/coupons"
        submitLabel={edit ? "Save changes" : "Create coupon"}
      />
    </form>
  );
}
