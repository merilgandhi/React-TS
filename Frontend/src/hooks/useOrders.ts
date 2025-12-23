import { useEffect, useState } from "react";
import type { Seller, Product } from "../types/order.types";
import { OrderService } from "../Services/order.service";
import { mapProducts } from "../utils/order.mapper";

export const useOrders = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sellerRes, productRes] = await Promise.all([
          OrderService.getSellers(),
          OrderService.getProducts(),
        ]);
        setSellers(sellerRes);
        setProducts(mapProducts(productRes));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { sellers, products, loading };
};