"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/price";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  return (
    <li className="card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className="price">{formatPrice(product.priceCents)}</p>
      <button type="button" aria-pressed={added} onClick={() => setAdded((v) => !v)}>
        {added ? "Retirer du panier" : "Ajouter au panier"}
      </button>
    </li>
  );
}
