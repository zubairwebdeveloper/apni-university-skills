// components/student/ProfileForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { FiLoader, FiSave } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import { profileSchema } from "@/lib/validations/profile";
import { updateProfile } from "@/app/actions/student";

export function ProfileForm({ profile }) {
  const router = useRouter();
  const reduce = useReducedMotion();
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

  const { isSubmitting, isDirty } = form.formState;
  const bioLength = (form.watch("bio") ?? "").length;

  async function onSubmit(v) {
    const res = await updateProfile(v);
    if (!res.ok) return toast.error(res.error);
    toast.success("Profile saved");
    router.refresh();
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="rounded-2xl border-border shadow-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="text-lg font-semibold tracking-tight">
              Personal information
            </CardTitle>
            <CardDescription>
              Keep your details up to date so your profile is accurate.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <section aria-labelledby="profile-basics" className="space-y-4">
              <h3
                id="profile-basics"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Basics
              </h3>
              <FieldGroup>
                <TextField
                  control={form.control}
                  name="displayName"
                  label="Full name"
                  autoComplete="name"
                />
                <TextField
                  control={form.control}
                  name="phone"
                  label="Phone"
                  type="tel"
                  autoComplete="tel"
                />
              </FieldGroup>
            </section>

            <section aria-labelledby="profile-location" className="space-y-4">
              <h3
                id="profile-location"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Location
              </h3>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    control={form.control}
                    name="country"
                    label="Country"
                    autoComplete="country-name"
                  />
                  <TextField
                    control={form.control}
                    name="city"
                    label="City"
                    autoComplete="address-level2"
                  />
                </div>
              </FieldGroup>
            </section>

            <section aria-labelledby="profile-about" className="space-y-4">
              <h3
                id="profile-about"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                About you
              </h3>
              <FieldGroup>
                <TextField
                  control={form.control}
                  name="bio"
                  label="Short bio"
                  component={Textarea}
                  rows={4}
                  maxLength={500}
                  description={`Up to 500 characters. ${bioLength}/500 used.`}
                />
              </FieldGroup>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {isDirty ? "You have unsaved changes." : "All changes saved."}
            </p>
            <Button
              type="submit"
              size="lg"
              className="sm:w-fit"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <>
                  <FiLoader
                    aria-hidden="true"
                    className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                  />
                  Saving…
                </>
              ) : (
                <>
                  <FiSave aria-hidden="true" className="mr-2 size-4" />
                  Save changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
