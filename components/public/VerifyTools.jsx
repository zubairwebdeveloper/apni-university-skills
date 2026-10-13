"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { FiCheck, FiCopy, FiLink, FiPrinter } from "react-icons/fi";

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
        >
          {copied === "number" ? (
            <FiCheck aria-hidden="true" />
          ) : (
            <FiCopy aria-hidden="true" />
          )}
          Copy number
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => copy("link", window.location.href)}
      >
        {copied === "link" ? (
          <FiCheck aria-hidden="true" />
        ) : (
          <FiLink aria-hidden="true" />
        )}
        Copy link
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.print()}
      >
        <FiPrinter aria-hidden="true" />
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
  const { control, handleSubmit } = useForm({ defaultValues: { code: "" } });

  const onSubmit = ({ code }) => router.push(`/verify/${extractCode(code)}`);

  return (
    <Card className="print:hidden">
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
                    className="font-mono"
                  />
                  <FieldDescription>
                    Codes are 16 characters long.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto">
              Verify
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
