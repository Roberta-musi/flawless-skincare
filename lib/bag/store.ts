"use client";

import { useSyncExternalStore } from "react";
import { addLine, type BagLine, parseStoredBag, setQuantity } from "./core";

const storageKey = "flawless-bag";
const empty: BagLine[] = [];

let lines: BagLine[] = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    lines = parseStoredBag(window.localStorage.getItem(storageKey));
  } catch {
    lines = empty;
  }
}

function commit(next: BagLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {}
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== storageKey) return;
  lines = parseStoredBag(event.newValue);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export const bagActions = {
  add(line: Omit<BagLine, "key" | "quantity">, quantity = 1) {
    load();
    commit(addLine(lines, line, quantity));
  },
  setQuantity(key: string, quantity: number) {
    commit(setQuantity(lines, key, quantity));
  },
  clear() {
    commit(empty);
  },
};

export function useBag() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return lines;
    },
    () => empty,
  );
}

let drawerOpen = false;
const drawerListeners = new Set<() => void>();

export const bagDrawer = {
  open() {
    drawerOpen = true;
    drawerListeners.forEach((listener) => listener());
  },
  close() {
    drawerOpen = false;
    drawerListeners.forEach((listener) => listener());
  },
};

export function useBagDrawer() {
  return useSyncExternalStore(
    (listener) => {
      drawerListeners.add(listener);
      return () => drawerListeners.delete(listener);
    },
    () => drawerOpen,
    () => false,
  );
}
