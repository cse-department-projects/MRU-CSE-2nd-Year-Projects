import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCartItems, insertCartItem, deleteCartItem, updateCartItemQty } from "./db";
import { supabase } from "./supabaseClient";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "az_cart_v1";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  });

  const userEmail = localStorage.getItem("az_user_email");

  useEffect(() => {
    if (userEmail) {
      // Sync from DB
      const loadDB = async () => {
        const dbItems = await fetchCartItems(userEmail);
        if (dbItems.length > 0) {
          const mapped = dbItems.map(d => ({
            id: d.product_id,
            name: d.product_name,
            price: d.price,
            qty: d.quantity
          }));
          setItems(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
      };
      loadDB();
    }
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue["addItem"] = async (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        if (userEmail) updateCartItemQty(item.id, userEmail, existing.qty + qty);
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p));
      }
      if (userEmail) {
        insertCartItem({
          user_email: userEmail,
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: qty
        });
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = async (id) => {
    if (userEmail) deleteCartItem(id, userEmail);
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQty: CartContextValue["updateQty"] = async (id, qty) => {
    const safeQty = Math.max(1, qty);
    if (userEmail) updateCartItemQty(id, userEmail, safeQty);
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: safeQty } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const clear = async () => {
    // Optional: clear all DB items for user. For now, just clearing local.
    setItems([]);
  };

  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQty, clear, count }),
    [items, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
};
