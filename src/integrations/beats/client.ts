import { createClient } from "@supabase/supabase-js";
import { separateBackendConfig } from "@/lib/voidSupply";

export const beatVault =
  separateBackendConfig.url && separateBackendConfig.key
    ? createClient(separateBackendConfig.url, separateBackendConfig.key, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
