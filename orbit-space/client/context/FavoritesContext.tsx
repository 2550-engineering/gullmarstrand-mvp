import { createContext, useContext, useEffect, useMemo, useState } from "react";

type FavoritesContextType = {
  favorites: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favIds, setFavIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("favorites.ids");
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("favorites.ids", JSON.stringify(favIds));
    } catch {}
  }, [favIds]);

  const favorites = useMemo(() => new Set(favIds), [favIds]);

  const isFavorite = (id: string) => favorites.has(id);

  const toggleFavorite = (id: string) => {
    setFavIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearFavorites = () => setFavIds([]);

  const value: FavoritesContextType = { favorites, isFavorite, toggleFavorite, clearFavorites };
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
