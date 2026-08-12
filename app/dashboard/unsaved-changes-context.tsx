"use client";

import { createContext, useContext, useState } from "react";

type UnsavedChangesContextType = {
  dirty: boolean;
  setDirty: (value: boolean) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(
  null
);

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dirty, setDirty] = useState(false);

  return (
    <UnsavedChangesContext.Provider value={{ dirty, setDirty }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    throw new Error(
      "useUnsavedChanges tiene que usarse dentro de UnsavedChangesProvider"
    );
  }
  return ctx;
}
