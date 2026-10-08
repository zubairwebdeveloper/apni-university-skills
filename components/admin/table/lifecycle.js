import {
  FiArchive,
  FiClock,
  FiDownloadCloud,
  FiRotateCcw,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";

// components/admin/table/lifecycle.js
// Builds row/bulk actions from one place so every table behaves the same.

const has = (perms, prefix, action) => perms.includes(`${prefix}.${action}`);

export function lifecycleItems({ row, perms, prefix, noun, run }) {
  const s = row.status;

  const go = (action) => () =>
    run({
      action,
      slug: row.slug,
    });

  const name = row.title ?? row.name;

  return [
    {
      key: "publish",
      label: "Publish",
      icon: FiUploadCloud,
      separatorBefore: true,
      hidden:
        !has(perms, prefix, "publish") ||
        !["draft", "pending", "archived", "scheduled"].includes(s),
      run: go("publish"),
      success: `${noun} published successfully.`,
    },

    {
      key: "unpublish",
      label: "Unpublish",
      icon: FiDownloadCloud,
      hidden: !has(perms, prefix, "publish") || s !== "published",
      run: go("unpublish"),
      success: `${noun} unpublished successfully.`,
      confirm: {
        title: `Unpublish “${name}”?`,
        description: "It will no longer be visible on the public site.",
      },
    },

    {
      key: "unschedule",
      label: "Cancel schedule",
      icon: FiClock,
      hidden: !has(perms, prefix, "publish") || s !== "scheduled",
      run: go("unschedule"),
      success: `${noun} returned to draft.`,
    },

    {
      key: "archive",
      label: "Archive",
      icon: FiArchive,
      hidden:
        !has(perms, prefix, "update") ||
        !["draft", "pending", "published", "scheduled"].includes(s),
      run: go("archive"),
      success: `${noun} archived successfully.`,
      confirm: {
        title: `Archive “${name}”?`,
        description:
          "It will be hidden from the public site. You can restore it later.",
      },
    },

    {
      key: "restore",
      label: "Restore",
      icon: FiRotateCcw,
      hidden:
        !has(perms, prefix, "update") || !["archived", "deleted"].includes(s),
      run: go("restore"),
      success: `${noun} restored as a draft.`,
    },

    {
      key: "delete",
      label: "Move to trash",
      icon: FiTrash2,
      destructive: true,
      separatorBefore: true,
      hidden: !has(perms, prefix, "delete") || s === "deleted",
      run: go("delete"),
      success: `${noun} moved to trash.`,
      confirm: {
        title: `Move “${name}” to trash?`,
        description:
          "It is hidden everywhere and can be restored from the Trash filter.",
        confirmLabel: "Move to trash",
      },
    },
  ];
}

export function lifecycleBulkActions(perms, prefix, plural) {
  const actions = [];

  if (has(perms, prefix, "publish")) {
    actions.push(
      {
        key: "publish",
        label: "Publish",
        icon: FiUploadCloud,
      },
      {
        key: "unpublish",
        label: "Unpublish",
        icon: FiDownloadCloud,
        confirm: {
          title: `Unpublish {n} ${plural}?`,
          description: "They will no longer be visible on the public site.",
        },
      },
      {
        key: "unschedule",
        label: "Cancel schedule",
        icon: FiClock,
        confirm: {
          title: `Cancel schedule for {n} ${plural}?`,
          description: "They will be returned to draft status.",
          confirmLabel: "Cancel schedule",
        },
      },
    );
  }

  if (has(perms, prefix, "update")) {
    actions.push(
      {
        key: "archive",
        label: "Archive",
        icon: FiArchive,
        confirm: {
          title: `Archive {n} ${plural}?`,
          description: "They will be hidden from the public site.",
        },
      },
      {
        key: "restore",
        label: "Restore",
        icon: FiRotateCcw,
      },
    );
  }

  if (has(perms, prefix, "delete")) {
    actions.push({
      key: "delete",
      label: "Trash",
      icon: FiTrash2,
      destructive: true,
      confirm: {
        title: `Move {n} ${plural} to trash?`,
        description: "They can be restored from the Trash filter.",
        confirmLabel: "Move to trash",
      },
    });
  }

  return actions;
}

