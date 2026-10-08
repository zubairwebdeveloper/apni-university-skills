// components/admin/reviews/reviewItems.js
import { FiArchive, FiCheck, FiRotateCcw, FiTrash2, FiX } from "react-icons/fi";

export function reviewItems({ row, perms, run }) {
  const mod = perms.includes("reviews.moderate"),
    del = perms.includes("reviews.delete"),
    s = row.status;
  const go = (action) => () => run({ action, slug: row.slug });
  const who = `${row.studentName}'s review of “${row.courseTitle}”`;
  return [
    {
      key: "approve",
      label: "Approve",
      icon: FiCheck,
      separatorBefore: true,
      hidden: !mod || !["pending", "rejected", "archived"].includes(s),
      run: go("approve"),
      success: "Review approved successfully.",
    },
    {
      key: "reject",
      label: "Reject",
      icon: FiX,
      hidden: !mod || !["pending", "approved"].includes(s),
      run: go("reject"),
      success: "Review rejected.",
      confirm: {
        title: "Reject this review?",
        description: `${who} is hidden from the public site${s === "approved" ? " and removed from the course rating" : ""}.`,
        confirmLabel: "Reject",
      },
    },
    {
      key: "archive",
      label: "Archive",
      icon: FiArchive,
      hidden: !mod || !["pending", "approved", "rejected"].includes(s),
      run: go("archive"),
      success: "Review archived successfully.",
      confirm: {
        title: "Archive this review?",
        description: `${who} is hidden from the public site${s === "approved" ? " and removed from the course rating" : ""}. You can restore it later.`,
      },
    },
    {
      key: "restore",
      label: "Restore",
      icon: FiRotateCcw,
      hidden: !mod || !["archived", "deleted"].includes(s),
      run: go("restore"),
      success: "Review restored to the pending queue.",
    },
    {
      key: "delete",
      label: "Move to trash",
      icon: FiTrash2,
      destructive: true,
      separatorBefore: true,
      hidden: !del || s === "deleted",
      run: go("delete"),
      success: "Review moved to trash.",
      confirm: {
        title: "Move this review to trash?",
        description:
          "It is hidden everywhere and the student can't edit it again. You can restore it from the Trash filter.",
        confirmLabel: "Move to trash",
      },
    },
  ];
}

