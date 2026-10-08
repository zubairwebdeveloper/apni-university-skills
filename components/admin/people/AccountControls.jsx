// components/admin/people/AccountControls.jsx: role, activation, instructor link, student profile edit
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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

function useRun() {
  const router = useRouter();
  return async (promise, success) => {
    const res = await promise;
    res.ok ? toast.success(success) : toast.error(res.error);
    router.refresh();
    return res;
  };
}

export function RoleCard({ slug, role, isSelf }) {
  const run = useRun();
  const [next, setNext] = useState(role);
  const [open, setOpen] = useState(false);
  return (
    <Card className="gap-3 p-5">
      <h2 className="text-lg">Role</h2>
      <p className="text-sm text-muted-foreground">
        {isSelf
          ? "You can't change your own role."
          : "Changing a role signs the person out everywhere. Their new permissions apply when they log back in."}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={next} onValueChange={setNext} disabled={isSelf}>
          <SelectTrigger className="w-44" aria-label="Role">
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
        <Button
          type="button"
          disabled={isSelf || next === role}
          onClick={() => setOpen(true)}
        >
          Change role
        </Button>
      </div>
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
    </Card>
  );
}

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
    <Card className="gap-3 p-5">
      <h2 className="text-lg">Account status</h2>
      <p className="text-sm text-muted-foreground">
        {isActive ? "Active. They can log in." : "Inactive. They can't log in."}
      </p>
      <div className="flex flex-wrap gap-2">
        {isActive ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isSelf}
            onClick={() => setOpen(true)}
          >
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
          >
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
          >
            Mark email as verified
          </Button>
        )}
      </div>
      {isSelf && (
        <p className="text-xs text-muted-foreground">
          You can&#39;t deactivate your own account.
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
    </Card>
  );
}

export function InstructorLinkCard({ slug, instructorId, instructors }) {
  const run = useRun();
  const current = instructors.find((i) => i.id === instructorId);
  const [value, setValue] = useState(current?.slug ?? "");
  return (
    <Card className="gap-3 p-5">
      <h2 className="text-lg">Instructor profile</h2>
      <p className="text-sm text-muted-foreground">
        Links this account to the instructor profile it teaches under.{" "}
        {current ? `Currently linked to ${current.name}.` : "Not linked yet."}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-60" aria-label="Instructor profile">
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
        <Button
          type="button"
          disabled={!value || value === current?.slug}
          onClick={() =>
            run(
              linkInstructor({ slug, instructorSlug: value }),
              "Instructor profile linked successfully.",
            )
          }
        >
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
          >
            Unlink
          </Button>
        )}
      </div>
    </Card>
  );
}

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
        <Button
          type="submit"
          className="sm:w-fit"
          disabled={form.formState.isSubmitting || !form.formState.isDirty}
        >
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}

