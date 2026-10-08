// components/admin/contacts/contactItems.js
import {
  FiArchive,
  FiCheck,
  FiEye,
  FiRotateCcw,
  FiSlash,
  FiTrash2,
} from "react-icons/fi";
export function contactItems({ row, perms, run }) {
  const can = perms.includes("contacts.update"),
    s = row.status,
    go = (action) => () => run({ action, slug: row.slug });
  return [
    {
      key: "read",
      label: "Mark as read",
      icon: FiEye,
      separatorBefore: true,
      hidden: !can || s !== "new",
      run: go("read"),
      success: "Marked as read.",
    },
    {
      key: "replied",
      label: "Mark as replied",
      icon: FiCheck,
      hidden: !can || !["new", "read"].includes(s),
      run: go("replied"),
      success: "Marked as replied.",
    },
    {
      key: "archive",
      label: "Archive",
      icon: FiArchive,
      hidden: !can || !["new", "read", "replied"].includes(s),
      run: go("archive"),
      success: "Message archived successfully.",
    },
    {
      key: "spam",
      label: "Mark as spam",
      icon: FiSlash,
      hidden: !can || !["new", "read", "replied"].includes(s),
      run: go("spam"),
      success: "Marked as spam.",
      confirm: {
        title: "Mark as spam?",
        description: "It moves out of the inbox. You can restore it later.",
        confirmLabel: "Mark as spam",
      },
    },
    {
      key: "restore",
      label: "Restore",
      icon: FiRotateCcw,
      hidden: !can || !["archived", "spam", "deleted"].includes(s),
      run: go("restore"),
      success: "Message restored.",
    },
    {
      key: "delete",
      label: "Move to trash",
      icon: FiTrash2,
      destructive: true,
      separatorBefore: true,
      hidden: !can || s === "deleted",
      run: go("delete"),
      success: "Message moved to trash.",
      confirm: {
        title: "Move to trash?",
        description: "You can restore it from the Trash filter.",
        confirmLabel: "Move to trash",
      },
    },
  ];
}

