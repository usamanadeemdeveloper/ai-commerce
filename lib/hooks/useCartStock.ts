"use client";

import type { CartItem } from "@/lib/store/cart-store";
import type { PRODUCTS_BY_IDS_QUERYResult } from "@/sanity.types";
import { PRODUCTS_BY_IDS_QUERY } from "@/sanity/queries/products";
import { useQuery } from "@sanity/sdk-react";
import { useCallback, useEffect, useState } from "react";

export interface StockInfo {
  productId: string;
  currentStock: number;
  isOutOfStock: boolean;
  exceedsStock: boolean;
  availableQuantity: number;
}

export type StockMap = Map<string, StockInfo>;

interface UseCartStockReturn {
  stockMap: StockMap;
  isLoading: boolean;
  hasStockIssues: boolean;
  refetch: () => void;
}

/**
 * Fetches current stock levels for cart items
 * Returns stock info map and loading state
 */
export function useCartStock(items: CartItem[]): UseCartStockReturn {
  const [stockMap, setStockMap] = useState<StockMap>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { data: products }: { data: PRODUCTS_BY_IDS_QUERYResult } = useQuery({
    query: PRODUCTS_BY_IDS_QUERY,
    params: {
      ids: items.map((item: CartItem) => item.productId),
    },
    
  });

  const fetchStock = useCallback(async () => {
    if (items.length === 0) {
      setStockMap(new Map());
      return;
    }

    setIsLoading(true);

    try {
      const newStockMap = new Map<string, StockInfo>();

      for (const item of items) {
        const product = products.find(
          (p: { _id: string }) => p._id === item.productId,
        );
        const currentStock = product?.stock ?? 0;

        newStockMap.set(item.productId, {
          productId: item.productId,
          currentStock,
          isOutOfStock: currentStock === 0,
          exceedsStock: item.quantity > currentStock,
          availableQuantity: Math.min(item.quantity, currentStock),
        });
      }

      setStockMap(newStockMap);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setIsLoading(false);
    }
  }, [items, products]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const hasStockIssues = Array.from(stockMap.values()).some(
    (info) => info.isOutOfStock || info.exceedsStock,
  );

  return {
    stockMap,
    isLoading,
    hasStockIssues,
    refetch: fetchStock,
  };
}
