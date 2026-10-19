/** Formate un prix en centimes vers un affichage en euros, à la française. */
export function formatPrice(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) {
    throw new RangeError("Le prix doit être un nombre positif de centimes.");
  }
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}
