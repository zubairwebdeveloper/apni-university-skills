// repositories/admin/paymentAdminRepository.js
import "server-only";
import { createReadRepository } from "./listRepository";
export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "cancelled",
];
export const PAYMENT_SORTS = ["newest", "oldest", "amount-desc", "amount-asc"];
export const paymentAdminRepository = createReadRepository({
  collection: "payments",
  sorts: {
    newest: ["createdAt", "desc"],
    oldest: ["createdAt", "asc"],
    "amount-desc": ["amount", "desc"],
    "amount-asc": ["amount", "asc"],
  },
});

