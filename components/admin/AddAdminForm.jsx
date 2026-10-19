// components/admin/AddAdminForm.jsx
"use client";

import { useId, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiLoader,
  FiUserPlus,
} from "react-icons/fi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase/client";

const focusInput =
  "focus-visible:border-yellow-400 focus-visible:ring-yellow-400/30";

function getInitial(name, email) {
  return (name || email || "?").trim().charAt(0).toUpperCase() || "?";
}

export function AddAdminForm() {
  const reduceMotion = useReducedMotion();
  const nameId = useId();
  const emailId = useId();
  const imageId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event?.preventDefault();
    if (submitting) return;

    const clean = email.trim().toLowerCase();
    if (!clean) {
      setStatus("error");
      setMsg("Email is required.");
      return;
    }

    setSubmitting(true);
    setStatus(null);
    setMsg("");

    try {
      await setDoc(doc(db, "admins", clean), {
        name: name.trim(),
        email: clean,
        image: image.trim(),
        role: "admin",
        createdAt: serverTimestamp(),
      });
      setStatus("success");
      setMsg("Admin added successfully.");
      setName("");
      setEmail("");
      setImage("");
    } catch (e) {
      setStatus("error");
      setMsg("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const previewSrc = /^(https?:\/\/|\/)/.test(image.trim())
    ? image.trim()
    : undefined;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full min-w-0 max-w-lg"
    >
      <Card className="gap-0 overflow-hidden p-0">
        <div className="flex items-start gap-3 border-b border-border p-5 sm:p-6">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300"
          >
            <FiUserPlus className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
              Add admin
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Grants admin access to the person with this email address. They
              sign in with that same email.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5 p-5 sm:p-6"
        >
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-3">
            <Avatar className="size-10 shrink-0 border border-border">
              <AvatarImage src={previewSrc} alt="" />
              <AvatarFallback className="bg-violet-500/10 text-sm font-semibold text-violet-600 dark:text-violet-300">
                {getInitial(name, email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-5 text-foreground">
                {name.trim() || "New admin"}
              </p>
              <p className="truncate text-xs leading-5 text-muted-foreground">
                {email.trim() || "email@example.com"}
              </p>
            </div>
          </div>

          <Field>
            <FieldLabel
              htmlFor={nameId}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Name
            </FieldLabel>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="off"
              className={focusInput}
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor={emailId}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Email <span className="text-red-600 dark:text-red-400">*</span>
            </FieldLabel>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="off"
              required
              aria-invalid={
                status === "error" && !email.trim() ? true : undefined
              }
              className={focusInput}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Saved in lowercase and used as the admin's ID.
            </p>
          </Field>

          <Field>
            <FieldLabel
              htmlFor={imageId}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Image URL{" "}
              <span className="font-normal normal-case tracking-normal">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id={imageId}
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
              autoComplete="off"
              className={focusInput}
            />
          </Field>

          {msg && (
            <div
              role={status === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5 ${
                status === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                  : "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200"
              }`}
            >
              {status === "success" ? (
                <FiCheckCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                />
              ) : (
                <FiAlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400"
                />
              )}
              <p className="min-w-0 break-words">{msg}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="submit"
              disabled={submitting || !email.trim()}
              className="w-full gap-2 transition-transform active:scale-[0.98] sm:w-auto motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              {submitting ? (
                <FiLoader
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <FiUserPlus aria-hidden="true" className="size-4" />
              )}
              {submitting ? "Adding…" : "Add admin"}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
