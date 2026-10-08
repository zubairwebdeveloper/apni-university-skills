// components/admin/contacts/ContactRecordActions.jsx
"use client";
import { RowActions } from "@/components/admin/table/RowActions";
import { contactItems } from "./contactItems";
import { runContactAction } from "@/app/actions/admin/contacts";
export function ContactRecordActions({ record, perms }) {
  return (
    <RowActions
      label="this message"
      items={contactItems({ row: record, perms, run: runContactAction })}
    />
  );
}

