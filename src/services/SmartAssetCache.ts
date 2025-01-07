import { SmartAssetInstance, Wallet } from "@arianee/wallet";
import { ChainType } from "@arianee/common-types";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface SmartAssetParams {
  id: string;
  passphrase: string;
}

class SmartAssetCache {
  private cache: Map<string, CacheEntry<SmartAssetInstance<ChainType, 'WAIT_TRANSACTION_RECEIPT'>>>;

  constructor() {
    this.cache = new Map();
  }

  private generateKey(network: string, id: string, passphrase: string): string {
    return `${network}-${id}-${passphrase}`;
  }

  public set(
      network: string,
      id: string,
      passphrase: string,
      data: SmartAssetInstance<ChainType, 'WAIT_TRANSACTION_RECEIPT'>
  ): void {
    const key = this.generateKey(network, id, passphrase);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  public get(
      network: string,
      id: string,
      passphrase: string
  ): SmartAssetInstance<ChainType, 'WAIT_TRANSACTION_RECEIPT'> | null {
    const key = this.generateKey(network, id, passphrase);
    const cached = this.cache.get(key);

    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const smartAssetCache = new SmartAssetCache();

export const getSmartAssetWithCache = async (
    wallet: Wallet,
    network: string,
    { id, passphrase }: SmartAssetParams
): Promise<SmartAssetInstance<ChainType, 'WAIT_TRANSACTION_RECEIPT'>> => {
  const cachedData = smartAssetCache.get(network, id, passphrase);
  if (cachedData) {
    return cachedData;
  }

  const data = await wallet.smartAsset.get(network, { id, passphrase });
  smartAssetCache.set(network, id, passphrase, data);
  return data;
};
