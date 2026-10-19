// components/shared/TextField.jsx: modern Field API + React Hook Form in one reusable piece
"use client";
import { Controller } from "react-hook-form";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const reduce = useReducedMotion();

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
            className={
              fieldState.invalid
                ? "transition-shadow"
                : "transition-shadow focus-visible:shadow-sm"
            }
            {...props}
          />
          <AnimatePresence initial={false} mode="wait">
            {fieldState.invalid ? (
              <motion.div
                key="error"
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <FieldError errors={[fieldState.error]} />
              </motion.div>
            ) : description ? (
              <motion.div key="description">
                <FieldDescription>{description}</FieldDescription>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Field>
      )}
    />
  );
}
