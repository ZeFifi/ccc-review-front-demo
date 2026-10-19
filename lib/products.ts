export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
};

// Données de démonstration : boutique fictive.
export const PRODUCTS: Product[] = [
  { id: "carnet", name: "Carnet pointillé A5", description: "96 pages, papier 100 g, couverture lin.", priceCents: 1490 },
  { id: "stylo", name: "Stylo plume acier", description: "Plume fine, cartouches standard.", priceCents: 2900 },
  { id: "trousse", name: "Trousse en toile", description: "Fermeture éclair, coton épais.", priceCents: 1990 },
];
