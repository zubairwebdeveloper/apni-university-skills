// AIConversationDialogs.jsx
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { renameSchema } from "@/lib/ai/schemas";

function RenameForm({ target, onSubmit, onClose }) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(renameSchema),
    defaultValues: { title: target.title },
  });

  const submit = handleSubmit(async (values) => {
    const result = await onSubmit(target.id, values.title);
    if (result.ok) onClose();
    else setError("title", { message: result.message });
  });

  return (
    <form onSubmit={submit} noValidate>
      <Card className="border-0 p-0 shadow-none">
        <CardContent className="p-0">
          <FieldGroup>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ai-rename-title">
                    Conversation title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="ai-rename-title"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>
      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save title"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AIRenameDialog({ target, onSubmit, onClose }) {
  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename conversation</DialogTitle>
          <DialogDescription>
            Give this chat a name you can find later.
          </DialogDescription>
        </DialogHeader>
        {target && (
          <RenameForm
            key={target.id}
            target={target}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AIDeleteDialog({ target, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function confirm() {
    setBusy(true);
    setMessage("");
    const result = await onConfirm(target.id);
    setBusy(false);
    if (result.ok) onClose();
    else setMessage(result.message);
  }

  return (
    <Dialog
      open={Boolean(target)}
      onOpenChange={(open) => {
        if (!open) {
          setMessage("");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this conversation?</DialogTitle>
          <DialogDescription>
            &ldquo;{target?.title}&rdquo; and all its messages will be
            permanently deleted.
          </DialogDescription>
        </DialogHeader>
        {message && (
          <p role="alert" className="text-sm text-destructive">
            {message}
          </p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirm}
            disabled={busy}
          >
            {busy ? "Deleting…" : "Delete conversation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
