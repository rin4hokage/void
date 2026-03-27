import { beatVault } from "@/integrations/beats/client";
import { separateBackendConfig, seedBeats, STORAGE_KEYS, type Beat } from "@/lib/voidSupply";

const isBrowser = typeof window !== "undefined";

const safeRead = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const readStoredBeats = () => safeRead<Beat[]>(STORAGE_KEYS.beats, seedBeats);
export const readStoredCart = () => safeRead<string[]>(STORAGE_KEYS.cart, []);
export const readStoredLicenses = () => safeRead<Record<string, string>>(STORAGE_KEYS.licenses, {});

export const persistStoredBeats = (beats: Beat[]) => safeWrite(STORAGE_KEYS.beats, beats);
export const persistStoredCart = (cart: string[]) => safeWrite(STORAGE_KEYS.cart, cart);
export const persistStoredLicenses = (licenses: Record<string, string>) => safeWrite(STORAGE_KEYS.licenses, licenses);

export const listRemoteBeats = async (): Promise<Beat[] | null> => {
  if (!beatVault) return null;
  const { data, error } = await beatVault.from("beats").select("*").order("created_at", { ascending: false });
  if (error || !data) return null;
  return data as Beat[];
};

export const uploadRemoteFile = async (path: string, file: File) => {
  if (!beatVault) return null;
  const { error } = await beatVault.storage.from(separateBackendConfig.bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return null;
  const { data } = beatVault.storage.from(separateBackendConfig.bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const insertRemoteBeat = async (beat: Beat) => {
  if (!beatVault) return false;
  const { error } = await beatVault.from("beats").insert(beat);
  return !error;
};
