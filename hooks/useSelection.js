// hooks/useSelection.js: per-page selection that resets whenever the visible rows change
import { useState } from "react";
export function useSelection(rows) {
  const signature = rows.map((r) => r.id).join("|");
  const [selection, setSelection] = useState(() => ({
    signature,
    selected: new Set(),
  }));
  const selected =
    selection.signature === signature ? selection.selected : new Set();
  const setSelected = (value) => {
    setSelection((current) => {
      const currentSelected =
        current.signature === signature ? current.selected : new Set();
      return {
        signature,
        selected: typeof value === "function" ? value(currentSelected) : value,
      };
    });
  };
  return {
    selected,
    setSelected,
    clear: () => setSelected(new Set()),
    ids: [...selected],
  };
}

