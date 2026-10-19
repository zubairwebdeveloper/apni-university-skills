// components/admin/forms/fields.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import { cn } from "@/lib/utils";

// `id` is optional: give a section one to make it a link target (#id)
export function FormSection({ id, title, description, children }) {
  return (
    <Card id={id} className="scroll-mt-24 gap-6 p-5 shadow-sm sm:p-6">
      <header className="flex items-start gap-3 border-b pb-4">
        <span
          aria-hidden="true"
          className="mt-1 h-5 w-1 shrink-0 rounded-full bg-[#FACC15]"
        />
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold leading-snug tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </header>
      <FieldGroup>{children}</FieldGroup>
    </Card>
  );
}

const hint = (fieldState, description) =>
  fieldState.invalid ? (
    <FieldError errors={[fieldState.error]} />
  ) : description ? (
    <FieldDescription>{description}</FieldDescription>
  ) : null;

// Live character count for use inside a field description.
// It only turns red when a hard limit (min or max) is broken.
export function CharCount({ value, min, max }) {
  const n = value?.length ?? 0;
  const bad = n > 0 && ((min && n < min) || (max && n > max));
  return (
    <span
      className={cn("ml-1 tabular-nums", bad && "font-medium text-destructive")}
    >
      ({n}
      {max ? `/${max}` : ""})
    </span>
  );
}

export function NumberField({
  control,
  name,
  label,
  description,
  disabled,
  step = "any",
  min = 0,
}) {
  const id = `f-${name}`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} data-disabled={disabled}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            id={id}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            type="number"
            inputMode="decimal"
            step={step}
            min={min}
            disabled={disabled}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            aria-invalid={fieldState.invalid}
            className="tabular-nums"
          />
          {hint(fieldState, description)}
        </Field>
      )}
    />
  );
}

export function SelectField({
  control,
  name,
  label,
  options,
  placeholder = "Select…",
  description,
}) {
  const id = `f-${name}`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select value={field.value ?? ""} onValueChange={field.onChange}>
            <SelectTrigger
              id={id}
              className="w-full"
              aria-invalid={fieldState.invalid}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hint(fieldState, description)}
        </Field>
      )}
    />
  );
}

// A bordered row: text on the left, the switch on the right
export function SwitchField({ control, name, label, description, disabled }) {
  const id = `f-${name}`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field
          orientation="horizontal"
          data-disabled={disabled}
          className={cn(
            "items-center justify-between gap-4 rounded-lg border bg-muted/20 p-4",
            "motion-safe:transition-colors motion-safe:duration-150",
            !disabled && "hover:bg-muted/40",
          )}
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </div>
          <Switch
            id={id}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        </Field>
      )}
    />
  );
}

export const LinesField = ({ rows = 4, ...props }) => (
  <TextField component={Textarea} rows={rows} {...props} />
);

// `dirty` is optional. Pass the form's isDirty to show an unsaved-changes note.
export function FormFooter({
  submitting,
  cancelHref,
  submitLabel = "Save changes",
  dirty = false,
}) {
  const unsaved = dirty && !submitting;
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_16px_-12px_rgb(0_0_0/0.25)] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <p
        aria-live="polite"
        className="mr-auto flex items-center gap-2 text-sm text-muted-foreground"
      >
        {unsaved && (
          <>
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#FACC15]"
            />
            Unsaved changes
          </>
        )}
      </p>
      <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>
        Cancel
      </Link>
      <Button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting && (
          <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />
        )}
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}

// Shared submit-error handling: slug conflicts land on the slug field, everything else is a toast
export function applyActionError(res, form, toast) {
  if (res.code === "409" && /slug/i.test(res.error))
    form.setError("slug", { message: res.error });
  toast.error(res.error);
}

export function DateField({
  control,
  name,
  label,
  description,
  min,
  max,
  type = "date",
}) {
  const id = `f-${name}`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            {...field}
            id={id}
            type={type}
            min={min}
            max={max}
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
            className="tabular-nums"
          />
          {hint(fieldState, description)}
        </Field>
      )}
    />
  );
}

// Inner component so it can hold its own filter state
function CheckboxList({
  name,
  label,
  options,
  description,
  emptyText,
  value: rawValue,
  onChange,
}) {
  const [query, setQuery] = useState("");
  const value = rawValue ?? [];
  const q = query.trim().toLowerCase();
  const visible = q
    ? options.filter((o) => String(o.label).toLowerCase().includes(q))
    : options;

  return (
    <FieldSet>
      <FieldLegend variant="label">{label}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}

      {options.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            aria-live="polite"
            className="text-xs tabular-nums text-muted-foreground"
          >
            <span className="font-medium text-foreground">{value.length}</span>{" "}
            of {options.length} selected
          </p>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!visible.length}
              onClick={() =>
                onChange([
                  ...new Set([...value, ...visible.map((o) => o.value)]),
                ])
              }
            >
              {q ? "Select shown" : "Select all"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!value.length}
              onClick={() => onChange([])}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {options.length > 8 && (
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter…"
          aria-label={`Filter ${label}`}
        />
      )}

      <div className="max-h-56 space-y-0.5 overflow-y-auto rounded-lg border bg-muted/10 p-1.5">
        {options.length ? (
          visible.length ? (
            visible.map((o) => {
              const id = `${name}-${o.value}`;
              return (
                <Field
                  key={o.value}
                  orientation="horizontal"
                  className="items-center rounded-md px-2 py-1.5 motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted/60"
                >
                  <Checkbox
                    id={id}
                    checked={value.includes(o.value)}
                    onCheckedChange={(v) =>
                      onChange(
                        v === true
                          ? [...value, o.value]
                          : value.filter((x) => x !== o.value),
                      )
                    }
                  />
                  <FieldLabel
                    htmlFor={id}
                    className="min-w-0 flex-1 cursor-pointer font-normal leading-snug"
                  >
                    {o.label}
                  </FieldLabel>
                </Field>
              );
            })
          ) : (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No matches for “{query}”.
            </p>
          )
        ) : (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {emptyText}
          </p>
        )}
      </div>
    </FieldSet>
  );
}

export function CheckboxListField({
  control,
  name,
  label,
  options,
  description,
  emptyText = "Nothing to choose from yet.",
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <CheckboxList
          name={name}
          label={label}
          options={options}
          description={description}
          emptyText={emptyText}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
}
