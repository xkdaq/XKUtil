import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KeyFormat, KeySize } from "../utils/crypto";

export interface SavedKeyPair {
  id: string;
  label: string;
  key: string;
  iv: string;
  keyFormat: KeyFormat;
  keySize: KeySize;
  createdAt: number;
}

interface KeyStoreState {
  keys: SavedKeyPair[];
  addKey: (entry: Omit<SavedKeyPair, "id" | "createdAt">) => void;
  updateKey: (id: string, updates: Partial<Omit<SavedKeyPair, "id" | "createdAt">>) => void;
  deleteKey: (id: string) => void;
}

export const useKeyStore = create<KeyStoreState>()(
  persist(
    (set) => ({
      keys: [],
      addKey: (entry) =>
        set((state) => ({
          keys: [
            ...state.keys,
            { ...entry, id: crypto.randomUUID(), createdAt: Date.now() },
          ],
        })),
      updateKey: (id, updates) =>
        set((state) => ({
          keys: state.keys.map((k) =>
            k.id === id ? { ...k, ...updates } : k
          ),
        })),
      deleteKey: (id) =>
        set((state) => ({
          keys: state.keys.filter((k) => k.id !== id),
        })),
    }),
    { name: "xkutil-aes-keystore" }
  )
);
