"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/price";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [fav, setFav] = useState(false);
  console.log("render ProductCard", product.id);

  return (
    <li className="card">
      <h3>{product.name}</h3>
      {/* @ts-ignore */}
      <div className="fav" onClick={() => setFav(!fav)}>
        {fav ? "♥" : "♡"}
      </div>
      <p>{product.description}</p>
      <p className="price">{formatPrice(product.priceCents)}</p>
      <button type="button" aria-pressed={added} onClick={() => setAdded((v) => !v)}>
        {added ? "Retirer du panier" : "Ajouter au panier"}
      </button>
    </li>
  );
}
