"use client";

import { useCallback, useMemo, useState } from "react";

export function useSelection(visibleIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visibleSelected = useMemo(
    () => visibleIds.filter((id) => selected.has(id)).length,
    [visibleIds, selected],
  );
  const allVisibleSelected = visibleIds.length > 0 && visibleSelected === visibleIds.length;

  const toggleAllVisible = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }, [allVisibleSelected, visibleIds]);

  return {
    selected,
    toggle,
    toggleAllVisible,
    clear: () => setSelected(new Set()),
    allVisibleSelected,
    someVisibleSelected: visibleSelected > 0 && !allVisibleSelected,
  };
}
