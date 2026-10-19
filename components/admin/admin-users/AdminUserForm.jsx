// components/admin/admin-users/AdminUserForm.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Copy,
  GraduationCap,
  ImageOff,
  Keyboard,
  Loader2,
  Mail,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserPlus,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

import { AdminImageField } from "@/components/admin/admin-users/AdminImageField";
import { adminUserSchema } from "@/lib/validations/adminUser";
import { createAdmin, updateAdmin } from "@/services/admin/adminUsersClient";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const ROLE_INFO = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    tone: "border-primary/30 bg-primary/10 text-primary",
    summary: "Full access to every section, including managing other admins.",
    points: [
      "Manage courses, blog, careers and jobs",
      "Manage users and admin roles",
      "View payments, analytics and audit logs",
    ],
  },
  editor: {
    label: "Editor",
    icon: UserCog,
    tone: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    summary:
      "Creates and publishes content, but cannot manage people or money.",
    points: [
      "Courses, lessons and categories",
      "Blog, careers and jobs",
      "Moderate reviews and read messages",
    ],
  },
  instructor: {
    label: "Instructor",
    icon: GraduationCap,
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    summary: "Read-only access to courses and lessons.",
    points: ["View courses", "View lessons", "Cannot publish or delete"],
  },
};

const ROLE_ORDER = ["admin", "editor", "instructor"];

const TYPOS = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outlook.con": "outlook.com",
};

function suggestEmail(value) {
  const v = String(value ?? "").trim();
  const at = v.lastIndexOf("@");
  if (at < 1) return null;
  const fix = TYPOS[v.slice(at + 1).toLowerCase()];
  return fix ? `${v.slice(0, at)}@${fix}` : null;
}

const NAME_MAX = 60;
const DRAFT_KEY = "admin-user-form-draft";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function SectionLabel({ step, title }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold tabular-nums text-primary"
      >
        {step}
      </span>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

function RoleCard({ value, selected, tabbable, onSelect }) {
  const info = ROLE_INFO[value];
  const Icon = info.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabbable ? 0 : -1}
      onClick={() => onSelect(value)}
      className={cn(
        "group relative flex min-h-24 w-full cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200",
        focusRing,
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        selected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
          : "bg-card",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border",
            info.tone,
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full border transition-colors duration-200 motion-reduce:transition-none",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30",
          )}
        >
          {selected ? <Check aria-hidden="true" className="size-3" /> : null}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold tracking-tight">{info.label}</p>
        <p className="text-xs leading-5 text-muted-foreground">
          {info.summary}
        </p>
      </div>
    </button>
  );
}

/**
 * Preview card with a subtle, pointer-driven 3D tilt. Pure CSS-perspective
 * transforms (no WebGL) so it stays cheap and works everywhere; disabled
 * entirely under prefers-reduced-motion.
 */
function PreviewCard({ name, email, image, role }) {
  const info = ROLE_INFO[role] ?? ROLE_INFO.admin;
  const Icon = info.icon;
  const reduce = useReducedMotion();
  const [imgStatus, setImgStatus] = useState("idle");

  // A new image source starts a fresh load, so clear any old error
  useEffect(() => {
    setImgStatus("idle");
  }, [image]);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 220, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 220, damping: 20 });
  const glowX = useTransform(springY, [-7, 7], [20, 80]);
  const glowY = useTransform(springX, [7, -7], [0, 60]);
  // currentColor + text-primary keeps the glow on-theme whatever colour format
  // the design tokens use (hsl, oklch, hex).
  const glowBackground = useTransform(
    [glowX, glowY],
    ([gx, gy]) =>
      `radial-gradient(260px circle at ${gx}% ${gy}%, currentColor, transparent 70%)`,
  );

  function handlePointerMove(e) {
    if (reduce || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 14);
    rotateX.set((0.5 - py) * 14);
  }
  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  const displayName = name || "Full name";
  const displayEmail = email || "email@example.com";

  return (
    <motion.div
      style={
        reduce
          ? undefined
          : { rotateX: springX, rotateY: springY, transformPerspective: 900 }
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group [transform-style:preserve-3d]"
    >
      <Card className="relative gap-0 overflow-hidden py-0 shadow-sm">
        {!reduce && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-[0.12]"
            style={{ background: glowBackground }}
          />
        )}
        <div className="h-20 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        <CardContent className="-mt-10 space-y-5 p-5 sm:p-6">
          <Avatar className="size-20 shadow-md ring-4 ring-card">
            {image ? (
              <AvatarImage
                src={image}
                alt=""
                onLoadingStatusChange={(status) => setImgStatus(status)}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
              {(name || email || "A").trim().slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {image && imgStatus === "error" && (
            <p className="flex items-start gap-1.5 text-xs leading-5 text-destructive">
              <ImageOff
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0"
              />
              That image link didn&apos;t load, so we&apos;re showing their
              initial instead.
            </p>
          )}

          <div className="min-w-0 space-y-1.5">
            <p
              title={displayName}
              className={cn(
                "truncate text-xl font-semibold leading-tight tracking-tight",
                !name && "text-muted-foreground/70",
              )}
            >
              {displayName}
            </p>
            <p
              title={displayEmail}
              className={cn(
                "flex items-center gap-1.5 text-sm text-muted-foreground",
                !email && "text-muted-foreground/70",
              )}
            >
              <Mail aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{displayEmail}</span>
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn("gap-1.5 px-2.5 py-1 font-medium", info.tone)}
          >
            <Icon aria-hidden="true" className="size-3" />
            {info.label}
          </Badge>

          <div className="space-y-2.5 border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Can access
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={role}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {info.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 text-sm leading-5 text-foreground/80"
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-emerald-500"
                    />
                    {p}
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

export function AdminUserForm({ mode = "create", initial }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const isEdit = mode === "edit";

  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [pendingAdminConfirm, setPendingAdminConfirm] = useState(false);

  // Image upload state, reported by <AdminImageField />
  const [imagePreview, setImagePreview] = useState(""); // local blob while/after upload
  const [imageBusy, setImageBusy] = useState(false); // optimising or uploading
  const [imageKey, setImageKey] = useState(0); // bump to fully reset the field

  const addAnotherRef = useRef(false);
  // The draft found on load. Kept here because autosave overwrites localStorage
  // as soon as the person starts typing, which would lose it before "Restore".
  const draftRef = useRef(null);
  const submitRef = useRef(null);

  const defaults = {
    name: initial?.name ?? "",
    email: initial?.email ?? initial?.id ?? "",
    image: initial?.image ?? "",
    role: initial?.role ?? "editor",
  };

  const form = useForm({
    resolver: zodResolver(adminUserSchema),
    defaultValues: defaults,
  });

  const { isSubmitting, isDirty } = form.formState;
  const name = form.watch("name") ?? "";
  const email = form.watch("email") ?? "";
  const image = form.watch("image");
  const role = form.watch("role");
  const emailFix = isEdit ? null : suggestEmail(email);

  const locked = isSubmitting || done || imageBusy;

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!isDirty || isSubmitting || done) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, isSubmitting, done]);

  // Offer to restore an abandoned draft (create mode only)
  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft?.name || draft?.email) {
        draftRef.current = draft;
        setDraftAvailable(true);
      }
    } catch {
      // ignore corrupt draft
    }
  }, [isEdit]);

  // Autosave the in-progress draft (create mode only).
  // Only the final image URL is stored, never a local blob.
  useEffect(() => {
    if (isEdit || done) return undefined;
    const sub = form.watch((values) => {
      try {
        if (values.name || values.email || values.image) {
          window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
        } else {
          window.localStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        // ignore storage errors (private browsing, quota, etc.)
      }
    });
    return () => sub.unsubscribe?.();
  }, [isEdit, done, form]);

  function restoreDraft() {
    if (draftRef.current) {
      form.reset(draftRef.current);
      setImageKey((k) => k + 1);
      toast.success("Draft restored");
    } else {
      toast.error("Couldn't read that draft");
    }
    draftRef.current = null;
    setDraftAvailable(false);
  }

  function discardDraft() {
    draftRef.current = null;
    clearDraft();
    setDraftAvailable(false);
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }

  // Require a second tap before switching someone into the Admin role
  function handleRoleSelect(value) {
    if (value === "admin" && role !== "admin") {
      setPendingAdminConfirm(true);
      return;
    }
    setPendingAdminConfirm(false);
    form.setValue("role", value, { shouldDirty: true, shouldValidate: true });
  }

  function confirmAdminRole() {
    form.setValue("role", "admin", { shouldDirty: true, shouldValidate: true });
    setPendingAdminConfirm(false);
  }

  // Arrow keys move through the roles, like a native radio group
  function handleRoleKeyDown(e) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      e.key
    ];
    if (!step) return;
    const nodes = Array.from(
      e.currentTarget.querySelectorAll('[role="radio"]'),
    );
    const index = nodes.indexOf(document.activeElement);
    if (index === -1) return;
    e.preventDefault();
    const next = (index + step + nodes.length) % nodes.length;
    nodes[next].focus();
    handleRoleSelect(ROLE_ORDER[next]);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Couldn't copy, select and copy manually");
    }
  }

  async function onSubmit(values) {
    const another = addAnotherRef.current;
    addAnotherRef.current = false;
    setServerError("");

    if (imageBusy) {
      toast.info("Wait for the photo to finish uploading");
      return;
    }

    try {
      // Empty string means "no photo"
      const payload = { ...values, image: (values.image ?? "").trim() };

      if (isEdit) await updateAdmin(payload.email, payload);
      else await createAdmin(payload);

      if (!isEdit && another) {
        toast.success(`${payload.name} was added. Add the next one.`);
        form.reset({ name: "", email: "", image: "", role: payload.role });
        clearDraft();
        setImageKey((k) => k + 1);
        setImagePreview("");
        setTimeout(() => form.setFocus("name"), 50);
        return;
      }

      form.reset(payload); // clears "unsaved" state
      // Clear after the reset: resetting fires the autosave watcher, which
      // would otherwise write the just-saved values back as a "draft".
      clearDraft();
      setDone(true);
      toast.success(isEdit ? "Admin updated" : "Admin created");
      await new Promise((r) => setTimeout(r, reduce ? 0 : 900));
      router.push("/admin/admin-users");
      router.refresh();
    } catch (e) {
      setServerError(e.message);
      toast.error(e.message);
    }
  }

  // If validation fails, "Save and add another" must not stay armed
  function onInvalid() {
    addAnotherRef.current = false;
  }

  function submitAndAddAnother() {
    addAnotherRef.current = true;
    form.handleSubmit(onSubmit, onInvalid)();
  }

  // Always points at the latest onSubmit, so the shortcut never runs stale code
  useEffect(() => {
    submitRef.current = () => form.handleSubmit(onSubmit, onInvalid)();
  });

  // ⌘/Ctrl + Enter submits the form from anywhere in it
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isSubmitting && !done && !imageBusy) submitRef.current?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSubmitting, done, imageBusy]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      {/* ---------------- Form card ---------------- */}
      <Card className="relative min-w-0 overflow-hidden border-border/60 shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-primary/10" />

        <CardHeader className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {isEdit ? (
                  <ShieldCheck aria-hidden="true" className="size-5" />
                ) : (
                  <UserPlus aria-hidden="true" className="size-5" />
                )}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl font-semibold tracking-tight">
                  {isEdit ? "Edit admin details" : "Admin details"}
                </CardTitle>
                <CardDescription className="text-sm leading-6">
                  {isEdit
                    ? "The email can't be changed because it identifies this admin."
                    : "They will sign in with this email address."}
                </CardDescription>
              </div>
            </div>

            {isEdit && email && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyEmail}
                className="min-h-9 gap-1.5 text-xs"
              >
                <Copy aria-hidden="true" className="size-3.5" />
                Copy email
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Abandoned-draft banner */}
        <AnimatePresence initial={false}>
          {draftAvailable && (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden px-6"
            >
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
                <RotateCcw
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                <span className="min-w-0 flex-1 basis-48 leading-6 text-foreground/80">
                  You left an unsaved admin form open. Pick up where you left
                  off?
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={restoreDraft}
                    className="min-h-9"
                  >
                    Restore
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={discardDraft}
                    className="min-h-9"
                  >
                    Discard
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate>
          <CardContent>
            <motion.div variants={list} initial="hidden" animate="show">
              <FieldGroup>
                <AnimatePresence initial={false}>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        x: reduce ? 0 : [0, -8, 8, -6, 6, 0],
                      }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Alert variant="destructive" role="alert">
                        <AlertCircle aria-hidden="true" className="size-4" />
                        <AlertTitle>Couldn&apos;t save</AlertTitle>
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 1. Account: name + email */}
                <motion.div variants={item} className="space-y-5">
                  <SectionLabel step="1" title="Account" />

                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <div className="flex items-center justify-between gap-3">
                          <FieldLabel
                            htmlFor="admin-name"
                            className="font-medium"
                          >
                            Full name
                          </FieldLabel>
                          <span
                            className={cn(
                              "text-xs tabular-nums text-muted-foreground",
                              name.length > NAME_MAX &&
                                "font-medium text-destructive",
                            )}
                          >
                            {name.length}/{NAME_MAX}
                          </span>
                        </div>
                        <Input
                          {...field}
                          id="admin-name"
                          placeholder="e.g. Zubair Ahmed"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                          className="min-h-11 sm:min-h-9"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className="space-y-2">
                    <Controller
                      name="email"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="admin-email"
                            className="font-medium"
                          >
                            Email address
                          </FieldLabel>
                          <Input
                            {...field}
                            id="admin-email"
                            type="email"
                            placeholder="name@gmail.com"
                            autoComplete="off"
                            disabled={isEdit}
                            aria-invalid={fieldState.invalid}
                            aria-describedby="admin-email-hint"
                            className="min-h-11 sm:min-h-9"
                          />
                          <FieldDescription id="admin-email-hint">
                            {isEdit
                              ? "This is the document ID, so it can't be changed."
                              : "Use the exact email they sign in with. It is saved in lowercase."}
                          </FieldDescription>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <AnimatePresence initial={false}>
                      {emailFix && (
                        <motion.button
                          type="button"
                          key={emailFix}
                          initial={
                            reduce ? false : { opacity: 0, y: -6, scale: 0.96 }
                          }
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          onClick={() =>
                            form.setValue("email", emailFix, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          className={cn(
                            "inline-flex min-h-9 max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs text-foreground/80 transition-colors hover:bg-primary/10 motion-reduce:transition-none",
                            focusRing,
                          )}
                        >
                          <Sparkles
                            aria-hidden="true"
                            className="size-3 shrink-0 text-primary"
                          />
                          <span className="min-w-0 truncate">
                            Did you mean{" "}
                            <span className="font-semibold text-primary">
                              {emailFix}
                            </span>
                            ?
                          </span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* 2. Profile photo: upload or link, both optional */}
                <motion.div variants={item} className="space-y-5">
                  <SectionLabel step="2" title="Profile photo" />

                  <Controller
                    name="image"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="admin-image"
                          className="font-medium"
                        >
                          Photo
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            Optional
                          </span>
                        </FieldLabel>

                        <AdminImageField
                          key={imageKey}
                          id="admin-image"
                          value={field.value ?? ""}
                          invalid={fieldState.invalid}
                          onChange={(url) => field.onChange(url)}
                          onBlur={field.onBlur}
                          onPreviewChange={setImagePreview}
                          onBusyChange={setImageBusy}
                        />

                        <FieldDescription>
                          Upload a photo or paste an image link. Leave it empty
                          to show their initial.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </motion.div>

                {/* 3. Access: role */}
                <motion.div variants={item} className="space-y-5">
                  <SectionLabel step="3" title="Access level" />

                  <div>
                    <Controller
                      name="role"
                      control={form.control}
                      render={({ field, fieldState }) => {
                        const current = ROLE_ORDER.includes(field.value)
                          ? field.value
                          : ROLE_ORDER[0];
                        return (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel
                              id="admin-role-label"
                              className="font-medium"
                            >
                              Role
                            </FieldLabel>
                            <div
                              role="radiogroup"
                              aria-label="Role"
                              aria-labelledby="admin-role-label"
                              onKeyDown={handleRoleKeyDown}
                              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                            >
                              {ROLE_ORDER.map((r) => (
                                <RoleCard
                                  key={r}
                                  value={r}
                                  selected={field.value === r}
                                  tabbable={current === r}
                                  onSelect={handleRoleSelect}
                                />
                              ))}
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        );
                      }}
                    />

                    {/* Second tap required to grant Admin */}
                    <AnimatePresence initial={false}>
                      {pendingAdminConfirm && (
                        <motion.div
                          initial={reduce ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div
                            role="alert"
                            className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                          >
                            <AlertTriangle
                              aria-hidden="true"
                              className="size-4 shrink-0"
                            />
                            <span className="min-w-0 flex-1 basis-48 leading-6">
                              Confirm you want to give full Admin access,
                              including managing other admins.
                            </span>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={confirmAdminRole}
                                className="min-h-9"
                              >
                                Make Admin
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setPendingAdminConfirm(false)}
                                className="min-h-9"
                              >
                                <X aria-hidden="true" className="size-3.5" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence initial={false}>
                      {role === "admin" && !pendingAdminConfirm && (
                        <motion.div
                          initial={reduce ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p
                            role="status"
                            className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-800 dark:text-amber-300"
                          >
                            <ShieldAlert
                              aria-hidden="true"
                              className="mt-1 size-4 shrink-0"
                            />
                            Admins have full access and can add or remove other
                            admins. Only give this role to people you trust.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </FieldGroup>
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t bg-muted/30 pt-6">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || done}
                onClick={() => router.push("/admin/admin-users")}
                className="h-11 w-full sm:h-9 sm:w-auto"
              >
                Cancel
              </Button>

              {!isEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={locked}
                  onClick={submitAndAddAnother}
                  className="h-11 w-full sm:h-9 sm:w-auto"
                >
                  Save and add another
                </Button>
              )}

              <Button
                type="submit"
                disabled={locked}
                className="h-11 w-full gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 sm:h-9 sm:w-auto"
              >
                {isSubmitting || imageBusy ? (
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                ) : (
                  <Save aria-hidden="true" className="size-4" />
                )}
                {isSubmitting
                  ? "Saving…"
                  : imageBusy
                    ? "Uploading photo…"
                    : isEdit
                      ? "Save changes"
                      : "Create admin"}
              </Button>
            </div>

            <p className="hidden items-center justify-end gap-1.5 text-xs text-muted-foreground md:flex">
              <Keyboard aria-hidden="true" className="size-3.5" />
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                Ctrl/⌘
              </kbd>
              +
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>
              to save
            </p>
          </CardFooter>
        </form>

        {/* Success overlay */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 grid place-content-center justify-items-center gap-3 bg-card/90 text-center backdrop-blur-sm"
            >
              <svg
                viewBox="0 0 64 64"
                className="size-20 text-emerald-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <motion.circle
                  cx="32"
                  cy="32"
                  r="26"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <motion.path
                  d="M20 33 L29 42 L45 24"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                />
              </svg>
              <div role="status">
                <p className="text-lg font-semibold">
                  {isEdit ? "Changes saved" : "Admin created"}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Taking you back to the list…
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* ---------------- Live preview ---------------- */}
      <aside
        className="min-w-0 space-y-3 lg:sticky lg:top-6"
        aria-label="Live preview"
        style={{ perspective: 900 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Live preview
        </p>
        <PreviewCard
          name={name}
          email={email}
          image={imagePreview || image}
          role={role}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          They get access the next time they sign in with this email. Their
          email must be verified.
        </p>
      </aside>
    </motion.div>
  );
}
