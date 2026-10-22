'use client';

import { useMemo } from 'react';
import { create, list, payExpense, remove, transferExport, transferImport, transferTemplate, update } from '../services';

export default function useOperations() {
  return useMemo(() => ({ create, list, payExpense, remove, transferExport, transferImport, transferTemplate, update }), []);
}
