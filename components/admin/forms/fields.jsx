// components/admin/forms/fields.jsx
"use client";
import Link from "next/link";
import { Controller } from "react-hook-form";
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

export function FormSection({ title, description, children }) {
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <div>
        <h2 className="text-lg">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
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

export function NumberField({
  control,
  name,
  label,
  description,
  disabled,
  step = "any",
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
            min={0}
            disabled={disabled}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            aria-invalid={fieldState.invalid}
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

export function SwitchField({ control, name, label, description }) {
  const id = `f-${name}`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field orientation="horizontal">
          <Switch
            id={id}
            checked={!!field.value}
            onCheckedChange={field.onChange}
          />
          <div>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </div>
        </Field>
      )}
    />
  );
}

export const LinesField = ({ rows = 4, ...props }) => (
  <TextField component={Textarea} rows={rows} {...props} />
);

export function FormFooter({
  submitting,
  cancelHref,
  submitLabel = "Save changes",
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>
        Cancel
      </Link>
      <Button type="submit" disabled={submitting}>
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
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
          />
          {hint(fieldState, description)}
        </Field>
      )}
    />
  );
}
// add to components/admin/forms/fields.jsx
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
        <FieldSet>
          <FieldLegend variant="label">{label}</FieldLegend>
          {description && <FieldDescription>{description}</FieldDescription>}
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
            {options.length ? (
              options.map((o) => {
                const id = `${name}-${o.value}`,
                  value = field.value ?? [];
                return (
                  <Field key={o.value} orientation="horizontal">
                    <Checkbox
                      id={id}
                      checked={value.includes(o.value)}
                      onCheckedChange={(v) =>
                        field.onChange(
                          v === true
                            ? [...value, o.value]
                            : value.filter((x) => x !== o.value),
                        )
                      }
                    />
                    <FieldLabel htmlFor={id} className="font-normal">
                      {o.label}
                    </FieldLabel>
                  </Field>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">{emptyText}</p>
            )}
          </div>
        </FieldSet>
      )}
    />
  );
}
// imports: Checkbox, FieldSet, FieldLegend

