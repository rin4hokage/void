import { useEffect, useState } from "react";
import { addSharedCartItem, readSharedCart, removeSharedCartItem, type CartItem } from "@/lib/cart";

export const useSharedCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readSharedCart());
  }, []);

  const addItem = (item: CartItem) => {
    setItems(addSharedCartItem(item));
  };

  const removeItem = (id: string) => {
    setItems(removeSharedCartItem(id));
  };

  return {
    items,
    addItem,
    removeItem,
    total: items.reduce((sum, item) => sum + item.price, 0),
  };
};
