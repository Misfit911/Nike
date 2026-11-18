"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { BagLine, Department, FilterState, Gender, KidsChoice, KnownOrder, OrderReceipt, PriceBand, StorefrontPayload } from "@/lib/types";
import { emptyFilters } from "@/lib/types";

export type OverlayInput =
  | { type: "menu" }
  | { type: "product"; productId: string }
  | { type: "added"; productId: string; size: string | null; color: string | null }
  | { type: "bag" }
  | { type: "checkout" }
  | { type: "success"; receipt: OrderReceipt }
  | { type: "orders" }
  | { type: "favourites" }
  | { type: "filters" }
  | { type: "filter"; chip: "gender" | "kids" | "price" | "sale" | "size" | "color" };

export type Overlay = OverlayInput & { id: string };

type StoreValue = {
  data: StorefrontPayload;
  department: Department;
  chooseDepartment: (department: Department) => void;
  searchOpen: boolean;
  searchQuery: string;
  toggleSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (value: string) => void;
  filters: FilterState;
  setCategory: (category: string | null) => void;
  toggleGender: (gender: Gender) => void;
  toggleKids: (choice: KidsChoice) => void;
  togglePrice: (band: PriceBand) => void;
  toggleSale: () => void;
  toggleSize: (size: string) => void;
  toggleColor: (color: string) => void;
  clearFilters: () => void;
  online: boolean;
  toggleOnline: () => void;
  bag: BagLine[];
  bagCount: number;
  addToBag: (input: { productId: string; size: string | null; color: string | null }) => void;
  setQty: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clearBag: () => void;
  favourites: string[];
  toggleFavourite: (productId: string) => void;
  knownOrders: KnownOrder[];
  rememberOrder: (order: KnownOrder) => void;
  overlays: Overlay[];
  push: (overlay: OverlayInput) => void;
  back: () => void;
  toggleBag: () => void;
  showSuccess: (receipt: OrderReceipt) => void;
  goHome: () => void;
  scrollToCatalog: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function withId(overlay: OverlayInput): Overlay {
  return { ...overlay, id: crypto.randomUUID() };
}

function toggleItem<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function StoreProvider({ data, children }: { data: StorefrontPayload; children: React.ReactNode }) {
  const [department, setDepartment] = useState<Department>("new");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [online, setOnline] = useState(false);
  const [bag, setBag] = useState<BagLine[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [knownOrders, setKnownOrders] = useState<KnownOrder[]>([]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [ready, setReady] = useState(false);
  const pushedRef = useRef(0);
  const suppressPopRef = useRef(0);

  useEffect(() => {
    const onPop = () => {
      if (suppressPopRef.current > 0) {
        suppressPopRef.current -= 1;
        return;
      }
      pushedRef.current = Math.max(0, pushedRef.current - 1);
      setOverlays((current) => current.slice(0, -1));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    try {
      setBag(JSON.parse(localStorage.getItem("nn-bag") || "[]"));
      setFavourites(JSON.parse(localStorage.getItem("nn-favourites") || "[]"));
      setKnownOrders(JSON.parse(localStorage.getItem("nn-orders") || "[]"));
      setOnline(localStorage.getItem("nn-online") === "1");
    } catch {
      setBag([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("nn-bag", JSON.stringify(bag));
  }, [bag, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("nn-favourites", JSON.stringify(favourites));
  }, [favourites, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("nn-orders", JSON.stringify(knownOrders));
  }, [knownOrders, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("nn-online", online ? "1" : "0");
  }, [online, ready]);

  useEffect(() => {
    if (overlays.length === 0) return;
    const html = document.documentElement;
    const previousHtml = html.style.overflow;
    const previousBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtml;
      document.body.style.overflow = previousBody;
    };
  }, [overlays.length]);

  const value = useMemo<StoreValue>(() => {
    const scrollToCatalog = () => {
      window.setTimeout(() => {
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 40);
    };
    const pushHistory = () => {
      window.history.pushState({ nn: true }, "");
      pushedRef.current += 1;
    };
    const backHistory = () => {
      if (pushedRef.current > 0) {
        window.history.back();
        return;
      }
      setOverlays((current) => current.slice(0, -1));
    };
    const openOverlay = (overlay: OverlayInput) => {
      setOverlays((current) => [...current, withId(overlay)]);
      pushHistory();
    };
    return {
      data,
      department,
      chooseDepartment: (next) => {
        setDepartment(next);
        setFilters(emptyFilters);
        backHistory();
        scrollToCatalog();
      },
      searchOpen,
      searchQuery,
      toggleSearch: () => {
        if (searchOpen) setSearchQuery("");
        else scrollToCatalog();
        setSearchOpen((open) => !open);
      },
      closeSearch: () => {
        setSearchOpen(false);
        setSearchQuery("");
      },
      setSearchQuery,
      filters,
      setCategory: (category) => setFilters((current) => ({ ...current, category: current.category === category ? null : category })),
      toggleGender: (gender) => setFilters((current) => ({ ...current, genders: toggleItem(current.genders, gender) })),
      toggleKids: (choice) => setFilters((current) => ({ ...current, kids: toggleItem(current.kids, choice) })),
      togglePrice: (band) => setFilters((current) => ({ ...current, prices: toggleItem(current.prices, band) })),
      toggleSale: () => setFilters((current) => ({ ...current, sale: !current.sale })),
      toggleSize: (size) => setFilters((current) => ({ ...current, sizes: toggleItem(current.sizes, size) })),
      toggleColor: (color) => setFilters((current) => ({ ...current, colors: toggleItem(current.colors, color) })),
      clearFilters: () => setFilters(emptyFilters),
      online,
      toggleOnline: () => setOnline((current) => !current),
      bag,
      bagCount: bag.reduce((sum, line) => sum + line.quantity, 0),
      addToBag: ({ productId, size, color }) => {
        const key = `${productId}|${size ?? ""}|${color ?? ""}`;
        setBag((current) => {
          const existing = current.find((line) => line.key === key);
          if (!existing) return [...current, { key, productId, size, color, quantity: 1 }];
          return current.map((line) => (line.key === key ? { ...line, quantity: Math.min(10, line.quantity + 1) } : line));
        });
        openOverlay({ type: "added", productId, size, color });
      },
      setQty: (key, quantity) => {
        setBag((current) =>
          quantity <= 0 ? current.filter((line) => line.key !== key) : current.map((line) => (line.key === key ? { ...line, quantity } : line)),
        );
      },
      removeLine: (key) => setBag((current) => current.filter((line) => line.key !== key)),
      clearBag: () => setBag([]),
      favourites,
      toggleFavourite: (productId) =>
        setFavourites((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId])),
      knownOrders,
      rememberOrder: (order) =>
        setKnownOrders((current) => [order, ...current.filter((item) => item.orderId !== order.orderId)].slice(0, 20)),
      overlays,
      push: openOverlay,
      back: backHistory,
      toggleBag: () => {
        if (overlays.at(-1)?.type === "bag") {
          backHistory();
          return;
        }
        if (overlays.some((item) => item.type === "bag")) return;
        openOverlay({ type: "bag" });
      },
      showSuccess: (receipt) => {
        const extra = Math.max(0, pushedRef.current - 1);
        if (pushedRef.current === 0) pushHistory();
        else if (extra > 0) {
          suppressPopRef.current = extra;
          pushedRef.current = 1;
          window.history.go(-extra);
        }
        setOverlays([withId({ type: "success", receipt })]);
      },
      goHome: () => {
        const steps = pushedRef.current;
        if (steps > 0) {
          suppressPopRef.current = steps;
          pushedRef.current = 0;
          window.history.go(-steps);
          window.setTimeout(() => {
            suppressPopRef.current = 0;
          }, 0);
        }
        setOverlays([]);
        setSearchOpen(false);
        setSearchQuery("");
        window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
      },
      scrollToCatalog,
    };
  }, [bag, data, department, favourites, filters, knownOrders, online, overlays, searchOpen, searchQuery]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Store is unavailable");
  return value;
}
