export type LicenseTier = "Basic Lease" | "Exclusive";

export type Beat = {
  id: string;
  title: string;
  bpm: number;
  key?: string;
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
  { name: "Exclusive", description: "Removed from catalog after purchase", multiplier: 5 },
];

export const seedBeats: Beat[] = [
  { id: "void-vvv", title: "vvv", bpm: 146, price: 20, mood: "ejcertified", tags: [], artwork: "", clipType: "uploaded", snippetUrl: "/audio/vvv-146bpm-ejcertified.mp3" },
  { id: "void-fake-bih", title: "fake bih", bpm: 147, price: 20, mood: "ejcertified", tags: [], artwork: "", clipType: "uploaded", snippetUrl: "/audio/fake-bih-147-ejcertified.mp3" },
  { id: "void-die-4-u", title: "die 4 u", bpm: 140, price: 20, mood: "ejcertified", tags: [], artwork: "", clipType: "uploaded", snippetUrl: "/audio/die-4-u-140-ejcertified.mp3" },
  { id: "void-same-ole-shii", title: "same ole shii", bpm: 147, price: 20, mood: "ejcertified", tags: [], artwork: "", clipType: "uploaded", snippetUrl: "/audio/same-ole-shii-147-ejcertified.mp3" },
  { id: "void-sosa", title: "sosa", bpm: 144, price: 20, mood: "ejcertified", tags: [], artwork: "", clipType: "uploaded", snippetUrl: "/audio/sosa-144-ejcertified.mp3" },
  { id: "void-just-lost-100", title: "just lost $100", bpm: 149, price: 20, mood: "ejcertified", tags: [], artwork: "", clipType: "uploaded", snippetUrl: "/audio/just-lost-100-149bpm-ejcertified.mp3" },
  { id: "void-tats-on-my-arm", title: "tats on my arm", bpm: 152, price: 20, mood: "ejcertified", tags: [], artwork: "", clipType: "uploaded", snippetUrl: "/audio/tats-on-my-arm-152bpm-ejcertified.mp3" },
  { id: "void-6th-angel", title: "6th angel", bpm: 149, price: 20, mood: "ejcertified", tags: [], artwork: "", clipType: "uploaded", snippetUrl: "/audio/6th-angel-149-ejcertified.mp3" },
  { id: "void-brunson", title: "brunson is trash omg", bpm: 148, price: 20, mood: "ejcertified", tags: [], artwork: "", clipType: "uploaded", snippetUrl: "/audio/brunson-is-trash-omg-148-ejcertified.mp3" },
];

export const STORAGE_KEYS = {
  beats: "void-supply-beats-v2",
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
