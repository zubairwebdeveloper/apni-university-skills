// components/shared/TextField.jsx: modern Field API + React Hook Form in one reusable piece
"use client";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function TextField({
  control,
  name,
  label,
  description,
  id,
  component: Comp = Input,
  ...props
}) {
  const fid = id ?? `f-${name}`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={fid}>{label}</FieldLabel>
          <Comp
            {...field}
            id={fid}
            aria-invalid={fieldState.invalid}
            {...props}
          />
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
        </Field>
      )}
    />
  );
}

