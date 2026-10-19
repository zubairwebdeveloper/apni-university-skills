"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiCopy,
  FiLink,
  FiPrinter,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const CODE = /^[a-f0-9]{16}$/;

// Accepts the bare code or a pasted verification link.
function extractCode(value) {
  const last = value
    .trim()
    .replace(/[?#].*$/, "")
    .split("/")
    .filter(Boolean)
    .pop();
  return (last ?? "").toLowerCase();
}

const EASE = [0.22, 1, 0.36, 1];

/** Icon that swaps to a check mark briefly, without layout shift. */
function CopyIcon({ copied, icon: Icon }) {
  return (
    <span className="relative inline-grid size-4 place-items-center">
      <AnimatePresence initial={false} mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 grid place-items-center text-primary"
          >
            <FiCheck aria-hidden="true" className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="icon"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 grid place-items-center"
          >
            <Icon aria-hidden="true" className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Copy number, copy link and print, for the page the visitor is looking at. */
export function VerifyActions({ certificateNumber }) {
  const [copied, setCopied] = useState("");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (kind, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(""), 2000);
    } catch {
      // Clipboard can be blocked; the address bar still has the link.
    }
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      {certificateNumber && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copy("number", certificateNumber)}
          className="transition-colors data-[copied=true]:border-primary/40 data-[copied=true]:text-primary"
          data-copied={copied === "number"}
        >
          <CopyIcon copied={copied === "number"} icon={FiCopy} />
          {copied === "number" ? "Copied" : "Copy number"}
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => copy("link", window.location.href)}
        className="transition-colors data-[copied=true]:border-primary/40 data-[copied=true]:text-primary"
        data-copied={copied === "link"}
      >
        <CopyIcon copied={copied === "link"} icon={FiLink} />
        {copied === "link" ? "Copied" : "Copy link"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.print()}
      >
        <FiPrinter aria-hidden="true" className="size-4" />
        Print
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied === "number" && "Certificate number copied"}
        {copied === "link" && "Link copied"}
      </span>
    </div>
  );
}

/** Look up another certificate by its code or pasted link. */
export function VerifyAnother() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { code: "" },
  });

  const onSubmit = ({ code }) => router.push(`/verify/${extractCode(code)}`);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="print:hidden"
    >
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Verify another certificate</CardTitle>
          <CardDescription>
            Enter the verification code printed on the certificate, or paste its
            verification link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                name="code"
                control={control}
                rules={{
                  validate: (v) =>
                    CODE.test(extractCode(v)) ||
                    "Enter the 16-character code, using only numbers and the letters a to f.",
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="verify-code">
                      Verification code
                    </FieldLabel>
                    <Input
                      {...field}
                      id="verify-code"
                      inputMode="text"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="a1b2c3d4e5f6a7b8"
                      aria-invalid={fieldState.invalid}
                      className="font-mono transition-shadow focus-visible:shadow-sm"
                    />
                    <FieldDescription>
                      Codes are 16 characters long.
                    </FieldDescription>
                    <AnimatePresence initial={false}>
                      {fieldState.invalid && (
                        <motion.div
                          initial={reduce ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={
                            reduce ? { opacity: 0 } : { opacity: 0, height: 0 }
                          }
                          transition={{ duration: 0.2, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <FieldError errors={[fieldState.error]} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Field>
                )}
              />
              <Button
                type="submit"
                className="group w-full sm:w-auto"
                disabled={formState.isSubmitting}
              >
                Verify
                <FiArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
