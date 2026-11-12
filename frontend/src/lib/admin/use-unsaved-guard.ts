'use client';

import { useEffect } from 'react';

/**
 * Registers browser beforeunload warning whenever isDirty is true.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'تغییرات ذخیره‌نشده دارید. آیا از خروج اطمینان دارید؟';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
