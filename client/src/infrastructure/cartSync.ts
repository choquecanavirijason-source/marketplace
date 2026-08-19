import { getAuthToken } from "@/shared/lib/marketplaceStorage";
import { useCartStore } from "@/infrastructure/state/cartStore";
import { container } from "@/infrastructure/container";

let syncedToken: string | null = null;

export function resetCartSync(): void {
  syncedToken = null;
}

export async function mergeCartWithServer(): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  if (syncedToken === token) return;
  syncedToken = token;

  try {
    await container.syncCart.execute(useCartStore.getState().items);
  } catch {
    syncedToken = null;
  }
}