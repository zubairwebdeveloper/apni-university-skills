// components/student/ProfileForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import { profileSchema } from "@/lib/validations/profile";
import { updateProfile } from "@/app/actions/student";

export function ProfileForm({ profile }) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile.displayName ?? "",
      phone: profile.phone ?? "",
      bio: profile.bio ?? "",
      country: profile.country ?? "",
      city: profile.city ?? "",
    },
  });

  async function onSubmit(v) {
    const res = await updateProfile(v);
    if (!res.ok) return toast.error(res.error);
    toast.success("Profile saved");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <TextField
          control={form.control}
          name="displayName"
          label="Full name"
          autoComplete="name"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="phone"
            label="Phone"
            type="tel"
            autoComplete="tel"
          />
          <TextField
            control={form.control}
            name="country"
            label="Country"
            autoComplete="country-name"
          />
        </div>
        <TextField
          control={form.control}
          name="city"
          label="City"
          autoComplete="address-level2"
        />
        <TextField
          control={form.control}
          name="bio"
          label="Short bio"
          component={Textarea}
          rows={4}
          maxLength={500}
          description="Up to 500 characters."
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

