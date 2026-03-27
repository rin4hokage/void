export type LicenseTier = "Basic Lease" | "Premium Lease" | "Exclusive";

export type Beat = {
  id: string;
  title: string;
  bpm: number;
  key: string;
  price: number;
  mood: string;
  tags: string[];
  artwork: string;
  clipType: "uploaded" | "generated";
  snippetUrl?: string;
};

export const tagOptions = [
  "ken carson",
  "osamason",
  "alternative rock",
  "evil",
  "destroy lonely",
  "playboi carti",
  "bleood",
];

export const licenses: { name: LicenseTier; description: string; multiplier: number }[] = [
  { name: "Basic Lease", description: "Starter use, tagged MP3 delivery", multiplier: 1 },
  { name: "Premium Lease", description: "WAV + stems placeholder flow", multiplier: 2 },
  { name: "Exclusive", description: "Removed from catalog after purchase", multiplier: 4 },
];

export const defaultArtwork = [
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
];

export const seedBeats: Beat[] = [
  { id: "void-1", title: "Redroom Echo", bpm: 142, key: "F# Minor", price: 40, mood: "cold rage", tags: ["ken carson", "evil"], artwork: defaultArtwork[0], clipType: "generated" },
  { id: "void-2", title: "Ghoul Signal", bpm: 155, key: "D Minor", price: 45, mood: "chaotic", tags: ["osamason", "bleood"], artwork: defaultArtwork[1], clipType: "generated" },
  { id: "void-3", title: "Static Halo", bpm: 128, key: "A Minor", price: 35, mood: "melodic dark", tags: ["destroy lonely", "alternative rock"], artwork: defaultArtwork[2], clipType: "generated" },
  { id: "void-4", title: "Crypt Talk", bpm: 148, key: "G Minor", price: 50, mood: "mean", tags: ["playboi carti", "evil"], artwork: defaultArtwork[3], clipType: "generated" },
  { id: "void-5", title: "No Sleep Chapel", bpm: 140, key: "E Minor", price: 40, mood: "haunted", tags: ["ken carson", "destroy lonely"], artwork: defaultArtwork[0], clipType: "generated" },
  { id: "void-6", title: "Ruin Theory", bpm: 138, key: "C Minor", price: 30, mood: "grimy", tags: ["alternative rock", "bleood"], artwork: defaultArtwork[1], clipType: "generated" },
  { id: "void-7", title: "Ash Vein", bpm: 150, key: "B Minor", price: 60, mood: "urgent", tags: ["osamason", "evil"], artwork: defaultArtwork[2], clipType: "generated" },
  { id: "void-8", title: "Chrome Phantom", bpm: 132, key: "F Minor", price: 42, mood: "spacey", tags: ["destroy lonely", "playboi carti"], artwork: defaultArtwork[3], clipType: "generated" },
  { id: "void-9", title: "Witchwire", bpm: 146, key: "D# Minor", price: 44, mood: "distorted", tags: ["ken carson", "osamason"], artwork: defaultArtwork[0], clipType: "generated" },
  { id: "void-10", title: "Blackout Skin", bpm: 136, key: "A# Minor", price: 38, mood: "slow burn", tags: ["bleood", "evil"], artwork: defaultArtwork[1], clipType: "generated" },
  { id: "void-11", title: "Crowbar Love", bpm: 124, key: "G# Minor", price: 33, mood: "sad alt", tags: ["alternative rock", "destroy lonely"], artwork: defaultArtwork[2], clipType: "generated" },
  { id: "void-12", title: "Dagger Cloud", bpm: 158, key: "E Minor", price: 55, mood: "aggressive", tags: ["osamason", "playboi carti"], artwork: defaultArtwork[3], clipType: "generated" },
];

export const STORAGE_KEYS = {
  beats: "void-supply-beats",
  cart: "void-supply-cart",
  licenses: "void-supply-licenses",
};

export const paymentConfig = {
  stripe: import.meta.env.VITE_STRIPE_CHECKOUT_URL || "",
  cashApp: import.meta.env.VITE_CASHAPP_URL || "",
  paypal: import.meta.env.VITE_PAYPAL_URL || "",
  applePay: import.meta.env.VITE_APPLE_PAY_URL || "",
  googlePay: import.meta.env.VITE_GOOGLE_PAY_URL || "",
  bankTransfer: import.meta.env.VITE_BANK_TRANSFER_URL || "",
};

export const separateBackendConfig = {
  url: import.meta.env.VITE_BEATS_SUPABASE_URL || "",
  key: import.meta.env.VITE_BEATS_SUPABASE_PUBLISHABLE_KEY || "",
  bucket: import.meta.env.VITE_BEATS_STORAGE_BUCKET || "void-supply-media",
};

export const hasSeparateBackend = Boolean(separateBackendConfig.url && separateBackendConfig.key);

export const formatMoney = (value: number) => `$${value.toFixed(0)}`;

export const pickGeneratedFrequency = (beat: Beat) => {
  if (beat.tags.includes("alternative rock")) return 110;
  if (beat.tags.includes("osamason")) return 154;
  if (beat.tags.includes("ken carson")) return 138;
  if (beat.tags.includes("destroy lonely")) return 122;
  return 146;
};
