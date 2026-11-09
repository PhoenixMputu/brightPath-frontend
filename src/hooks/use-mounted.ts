import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only on the client, after hydration. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
