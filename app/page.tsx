import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";

export default function HomePage() {
  return (
    <>
      <h1>Nos produits</h1>
      <p>Une boutique fictive, juste assez réelle pour tester la CI et la skill review-front.</p>
      <h2>Catalogue</h2>
      <ul className="grid">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </>
  );
}
