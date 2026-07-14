import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `false` during SSR and the initial client render, then `true` once
 * the component has hydrated on the client. Uses `useSyncExternalStore` so it
 * never triggers a synchronous setState inside an effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
