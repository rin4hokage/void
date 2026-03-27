export type CartItem = {
  id: string;
  title: string;
  kind: "beat" | "artwork";
  price: number;
  image?: string;
  subtitle?: string;
};

const CART_KEY = "void-shared-cart";

export const readSharedCart = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const writeSharedCart = (items: CartItem[]) => {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const addSharedCartItem = (item: CartItem) => {
  const current = readSharedCart();
  if (current.some((entry) => entry.id === item.id)) return current;
  const next = [...current, item];
  writeSharedCart(next);
  return next;
};

export const removeSharedCartItem = (id: string) => {
  const next = readSharedCart().filter((entry) => entry.id !== id);
  writeSharedCart(next);
  return next;
};
