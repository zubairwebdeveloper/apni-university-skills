// config/adminPeople.js
import { z } from "zod";
export const FLAG_FILTERS = {
  active: z.enum(["active", "inactive"]),
  verified: z.enum(["yes", "no"]),
};
export const flagOptions = [
  {
    key: "active",
    label: "Account",
    allLabel: "Active & inactive",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    key: "verified",
    label: "Email",
    allLabel: "Verified & not",
    options: [
      { value: "yes", label: "Verified" },
      { value: "no", label: "Not verified" },
    ],
  },
];

