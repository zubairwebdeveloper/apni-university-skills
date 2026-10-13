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

function RoleCard({ value, selected, onSelect }) {
  const info = ROLE_INFO[value];
  const Icon = info.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left outline-none transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        selected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
          : "bg-card",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg border",
            info.tone,
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full border transition-colors duration-200",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30",
          )}
        >
          {selected ? <Check aria-hidden="true" className="size-3" /> : null}
        </span>
      </div>
      <div className="space-y-0.5">
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

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 220, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 220, damping: 20 });
  const glowX = useTransform(springY, [-7, 7], [20, 80]);
  const glowY = useTransform(springX, [7, -7], [0, 60]);
  const glowBackground = useTransform(
    [glowX, glowY],
    ([gx, gy]) =>
      `radial-gradient(260px circle at ${gx}% ${gy}%, hsl(var(--primary) / 0.12), transparent 70%)`,
  );

  function handleMouseMove(e) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 14);
    rotateX.set((0.5 - py) * 14);
  }
  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      style={
        reduce
          ? undefined
          : { rotateX: springX, rotateY: springY, transformPerspective: 900 }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="[transform-style:preserve-3d]"
    >
      <Card className="relative gap-0 overflow-hidden py-0">
        {!reduce && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glowBackground }}
          />
        )}
        <div className="h-16 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        <CardContent className="-mt-8 space-y-4 p-5">
          <Avatar className="size-16 ring-4 ring-card">
            {image ? (
              <AvatarImage
                src={image}
                alt={name || "Admin"}
                onLoadingStatusChange={(status) => setImgStatus(status)}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {(name || email || "A").trim().slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {image && imgStatus === "error" && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <ImageOff aria-hidden="true" className="size-3.5 shrink-0" />
              That image link didn&apos;t load — showing their initial instead.
            </p>
          )}

          <div className="min-w-0 space-y-1">
            <p className="truncate text-lg font-semibold leading-tight tracking-tight">
              {name || "Full name"}
            </p>
            <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              <Mail aria-hidden="true" className="size-3.5 shrink-0" />
              {email || "email@example.com"}
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn("gap-1.5 font-medium", info.tone)}
          >
            <Icon aria-hidden="true" className="size-3" />
            {info.label}
          </Badge>

          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Can access
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={role}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                {info.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 text-sm text-foreground/80"
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
  const addAnotherRef = useRef(false);

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
  const name = form.watch("name");
  const email = form.watch("email");
  const image = form.watch("image");
  const role = form.watch("role");
  const emailFix = isEdit ? null : suggestEmail(email);

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!isDirty || isSubmitting || done) return;
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
      if (draft?.name || draft?.email) setDraftAvailable(true);
    } catch {
      // ignore corrupt draft
    }
  }, [isEdit]);

  // Autosave the in-progress draft (create mode only)
  useEffect(() => {
    if (isEdit || done) return;
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
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        form.reset(JSON.parse(raw));
        toast.success("Draft restored");
      }
    } catch {
      toast.error("Couldn't read that draft");
    }
    setDraftAvailable(false);
  }

  function discardDraft() {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
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

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Couldn't copy — select and copy manually");
    }
  }

  async function onSubmit(values) {
    const another = addAnotherRef.current;
    addAnotherRef.current = false;
    setServerError("");

    try {
      if (isEdit) await updateAdmin(values.email, values);
      else await createAdmin(values);

      clearDraft();

      if (!isEdit && another) {
        toast.success(`${values.name} was added. Add the next one.`);
        form.reset({ name: "", email: "", image: "", role: values.role });
        setTimeout(() => form.setFocus("name"), 50);
        return;
      }

      form.reset(values); // clears "unsaved" state
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

  function submitAndAddAnother() {
    addAnotherRef.current = true;
    form.handleSubmit(onSubmit)();
  }

  // ⌘/Ctrl + Enter submits the form from anywhere in it
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isSubmitting && !done) form.handleSubmit(onSubmit)();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, done]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
    >
      {/* ---------------- Form card ---------------- */}
      <Card className="relative overflow-hidden border-border/60 shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-primary/10" />

        <CardHeader className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {isEdit ? (
                  <ShieldCheck aria-hidden="true" className="size-5" />
                ) : (
                  <UserPlus aria-hidden="true" className="size-5" />
                )}
              </div>
              <div>
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
                variant="ghost"
                size="sm"
                onClick={copyEmail}
                className="gap-1.5 text-xs text-muted-foreground"
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
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-sm">
                <RotateCcw
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                <span className="flex-1 text-foreground/80">
                  You left an unsaved admin form open. Pick up where you left
                  off?
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={restoreDraft}
                  >
                    Restore
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={discardDraft}
                  >
                    Discard
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
                        <AlertCircle className="size-4" />
                        <AlertTitle>Couldn&apos;t save</AlertTitle>
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name */}
                <motion.div variants={item}>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <div className="flex items-center justify-between">
                          <FieldLabel
                            htmlFor="admin-name"
                            className="font-medium"
                          >
                            Full name
                          </FieldLabel>
                          <span
                            className={cn(
                              "text-xs tabular-nums text-muted-foreground",
                              name.length > NAME_MAX && "text-destructive",
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
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </motion.div>

                {/* Email */}
                <motion.div variants={item} className="space-y-2">
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
                        />
                        <FieldDescription>
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
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-foreground/80 outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Sparkles
                          aria-hidden="true"
                          className="size-3 text-primary"
                        />
                        Did you mean{" "}
                        <span className="font-semibold text-primary">
                          {emailFix}
                        </span>
                        ?
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Image */}
                <motion.div variants={item}>
                  <Controller
                    name="image"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="admin-image"
                          className="font-medium"
                        >
                          Profile photo URL
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            Optional
                          </span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="admin-image"
                          placeholder="https://example.com/photo.jpg"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>
                          Paste a direct image link (ending in .jpg, .png or
                          .webp). Leave empty to show their initial.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </motion.div>

                {/* Role */}
                <motion.div variants={item}>
                  <Controller
                    name="role"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="font-medium">Role</FieldLabel>
                        <div
                          role="radiogroup"
                          aria-label="Role"
                          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                        >
                          {ROLE_ORDER.map((r) => (
                            <RoleCard
                              key={r}
                              value={r}
                              selected={field.value === r}
                              onSelect={handleRoleSelect}
                            />
                          ))}
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
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
                        <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                          <AlertTriangle
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          />
                          <span className="flex-1 leading-relaxed">
                            Confirm you want to give full Admin access,
                            including managing other admins.
                          </span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={confirmAdminRole}
                            >
                              Make Admin
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setPendingAdminConfirm(false)}
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
                          className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
                        >
                          <ShieldAlert
                            aria-hidden="true"
                            className="mt-0.5 size-3.5 shrink-0"
                          />
                          Admins have full access and can add or remove other
                          admins. Only give this role to people you trust.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </FieldGroup>
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t bg-muted/30 pt-6">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || done}
                onClick={() => router.push("/admin/admin-users")}
              >
                Cancel
              </Button>

              {!isEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting || done}
                  onClick={submitAndAddAnother}
                >
                  Save and add another
                </Button>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || done}
                className="gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Save aria-hidden="true" className="size-4" />
                )}
                {isSubmitting
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Create admin"}
              </Button>
            </div>

            <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
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
        className="space-y-3 lg:sticky lg:top-6"
        aria-label="Live preview"
        style={{ perspective: 900 }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Live preview
        </p>
        <PreviewCard name={name} email={email} image={image} role={role} />
        <p className="text-xs leading-5 text-muted-foreground">
          They get access the next time they sign in with this email. Their
          email must be verified.
        </p>
      </aside>
    </motion.div>
  );
}
