// components/admin/people/AccountControls.jsx: role, activation, instructor link, student profile edit
"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiLink,
  FiLoader,
  FiMail,
  FiSave,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ROLE_LABELS, ROLE_LIST } from "@/lib/constants/roles";
import { profileSchema } from "@/lib/validations/profile";
import {
  markStudentVerified,
  setStudentActive,
  updateStudentProfile,
} from "@/app/actions/admin/students";
import {
  linkInstructor,
  setUserActive,
  updateUserRole,
} from "@/app/actions/admin/users";

const pressable =
  "transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

function useRun() {
  const router = useRouter();
  return async (promise, success) => {
    const res = await promise;
    if (res.ok) toast.success(success);
    else toast.error(res.error);
    router.refresh();
    return res;
  };
}

/* Shared presentation pieces */

function Panel({ icon: Icon, title, badge, description, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full min-w-0"
    >
      <Card className="gap-0 overflow-hidden p-0">
        <div className="flex items-start gap-3 border-b border-border p-5 sm:p-6">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300"
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
                {title}
              </h2>
              {badge}
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-5 sm:p-6">{children}</div>
      </Card>
    </motion.div>
  );
}

function Pill({ tone = "neutral", children }) {
  const tones = {
    neutral: "border-border bg-muted/50 text-muted-foreground",
    violet:
      "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    success:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    danger:
      "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Dot({ className }) {
  return (
    <span
      aria-hidden="true"
      className={`size-1.5 rounded-full bg-current ${className ?? ""}`}
    />
  );
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
    >
      {children}
    </label>
  );
}

function Notice({ children }) {
  return (
    <div
      role="note"
      className="flex items-start gap-2.5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3.5 py-3 text-sm leading-5 text-yellow-800 dark:text-yellow-200"
    >
      <FiAlertTriangle
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-yellow-600 dark:text-yellow-400"
      />
      <p>{children}</p>
    </div>
  );
}

/* Role */

export function RoleCard({ slug, role, isSelf }) {
  const run = useRun();
  const roleId = useId();
  const [next, setNext] = useState(role);
  const [open, setOpen] = useState(false);
  const changed = next !== role;
  return (
    <Panel
      icon={FiShield}
      title="Role"
      badge={<Pill tone="violet">{ROLE_LABELS[role]}</Pill>}
      description={
        isSelf
          ? "You can't change your own role."
          : "Changing a role signs the person out everywhere. Their new permissions apply when they log back in."
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-col gap-2">
          <FieldLabel htmlFor={roleId}>New role</FieldLabel>
          <Select value={next} onValueChange={setNext} disabled={isSelf}>
            <SelectTrigger
              id={roleId}
              className="w-full sm:w-56"
              aria-label="Role"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_LIST.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          disabled={isSelf || next === role}
          onClick={() => setOpen(true)}
          className={`w-full gap-2 sm:w-auto ${pressable}`}
        >
          <FiShield aria-hidden="true" className="size-4" />
          Change role
        </Button>
      </div>
      {!isSelf && changed && ["admin", "editor"].includes(next) && (
        <Notice>Staff roles can change site content.</Notice>
      )}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Change role to ${ROLE_LABELS[next]}?`}
        description={`This takes effect immediately for what they can do, and they will be signed out of every device. ${["admin", "editor"].includes(next) ? "Staff roles can change site content." : ""}`}
        confirmLabel="Change role"
        destructive={next === "admin"}
        onConfirm={() =>
          run(
            updateUserRole({ slug, role: next }),
            "User role changed successfully.",
          )
        }
      />
    </Panel>
  );
}

/* Account status */

export function ActiveCard({
  slug,
  isActive,
  isSelf,
  scope = "user",
  verified,
}) {
  const run = useRun();
  const [open, setOpen] = useState(false);
  const act = scope === "student" ? setStudentActive : setUserActive;
  return (
    <Panel
      icon={isActive ? FiUserCheck : FiUserX}
      title="Account status"
      badge={
        <Pill tone={isActive ? "success" : "danger"}>
          <Dot />
          {isActive ? "Active" : "Inactive"}
        </Pill>
      }
      description={
        isActive ? "Active. They can log in." : "Inactive. They can't log in."
      }
    >
      {scope === "student" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {verified ? (
            <>
              <FiCheckCircle
                aria-hidden="true"
                className="size-4 text-emerald-600 dark:text-emerald-400"
              />
              <span>Email verified</span>
            </>
          ) : (
            <>
              <FiMail aria-hidden="true" className="size-4" />
              <span>Email not verified</span>
            </>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {isActive ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isSelf}
            onClick={() => setOpen(true)}
            className={`w-full gap-2 sm:w-auto ${pressable}`}
          >
            <FiUserX aria-hidden="true" className="size-4" />
            Deactivate
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() =>
              run(
                act({ slug, active: true }),
                "Account activated successfully.",
              )
            }
            className={`w-full gap-2 sm:w-auto ${pressable}`}
          >
            <FiUserCheck aria-hidden="true" className="size-4" />
            Activate
          </Button>
        )}
        {scope === "student" && !verified && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              run(markStudentVerified({ slug }), "Email marked as verified.")
            }
            className={`w-full gap-2 sm:w-auto ${pressable}`}
          >
            <FiMail aria-hidden="true" className="size-4" />
            Mark email as verified
          </Button>
        )}
      </div>
      {isSelf && (
        <p className="text-xs leading-5 text-muted-foreground">
          You can&apos;t deactivate your own account.
        </p>
      )}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Deactivate this account?"
        description="They are signed out everywhere and can't log in until you reactivate it."
        confirmLabel="Deactivate"
        destructive
        onConfirm={() =>
          run(act({ slug, active: false }), "Account deactivated successfully.")
        }
      />
    </Panel>
  );
}

/* Instructor link */

export function InstructorLinkCard({ slug, instructorId, instructors }) {
  const run = useRun();
  const profileId = useId();
  const current = instructors.find((i) => i.id === instructorId);
  const [value, setValue] = useState(current?.slug ?? "");
  return (
    <Panel
      icon={FiUsers}
      title="Instructor profile"
      badge={
        current ? (
          <Pill tone="success">
            <Dot />
            Linked
          </Pill>
        ) : (
          <Pill>Not linked</Pill>
        )
      }
      description={
        <>
          Links this account to the instructor profile it teaches under.{" "}
          {current ? (
            <>
              Currently linked to{" "}
              <span className="font-medium text-foreground">
                {current.name}
              </span>
              .
            </>
          ) : (
            "Not linked yet."
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-col gap-2">
          <FieldLabel htmlFor={profileId}>Profile</FieldLabel>
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger
              id={profileId}
              className="w-full sm:w-64"
              aria-label="Instructor profile"
            >
              <SelectValue placeholder="Choose a profile" />
            </SelectTrigger>
            <SelectContent>
              {instructors.map((i) => (
                <SelectItem key={i.id} value={i.slug}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            disabled={!value || value === current?.slug}
            onClick={() =>
              run(
                linkInstructor({ slug, instructorSlug: value }),
                "Instructor profile linked successfully.",
              )
            }
            className={`w-full gap-2 sm:w-auto ${pressable}`}
          >
            <FiLink aria-hidden="true" className="size-4" />
            Link
          </Button>
          {current && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setValue("");
                run(
                  linkInstructor({ slug, instructorSlug: null }),
                  "Instructor profile unlinked.",
                );
              }}
              className={`w-full gap-2 sm:w-auto ${pressable}`}
            >
              <FiX aria-hidden="true" className="size-4" />
              Unlink
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}

/* Student profile form */

export function StudentProfileForm({ student }) {
  const run = useRun();
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: student.displayName ?? "",
      phone: student.phone ?? "",
      bio: student.bio ?? "",
      country: student.country ?? "",
      city: student.city ?? "",
    },
  });
  async function onSubmit(values) {
    const res = await run(
      updateStudentProfile({ slug: student.slug, values }),
      "Student updated successfully.",
    );
    if (res.ok) form.reset(values);
  }
  const { isSubmitting, isDirty } = form.formState;
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <TextField
          control={form.control}
          name="displayName"
          label="Full name"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="phone"
            label="Phone"
            type="tel"
          />
          <TextField control={form.control} name="country" label="Country" />
        </div>
        <TextField control={form.control} name="city" label="City" />
        <TextField
          control={form.control}
          name="bio"
          label="Bio"
          component={Textarea}
          rows={3}
          maxLength={500}
        />
        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className="flex items-center gap-2 text-xs leading-5 text-muted-foreground"
          >
            {isDirty ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-yellow-400"
                />
                Unsaved changes
              </>
            ) : (
              "All changes saved"
            )}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {isDirty && !isSubmitting && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
                className={`w-full sm:w-auto ${pressable}`}
              >
                Discard
              </Button>
            )}
            <Button
              type="submit"
              className={`w-full gap-2 sm:w-fit ${pressable}`}
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <FiLoader
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <FiSave aria-hidden="true" className="size-4" />
              )}
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
}