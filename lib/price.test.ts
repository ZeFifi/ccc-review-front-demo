import { describe, expect, it } from "vitest";
import { formatPrice } from "./price";

// Intl insère des espaces insécables : on les normalise pour comparer.
const clean = (s: string) => s.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("convertit des centimes en euros", () => {
    expect(clean(formatPrice(1990))).toBe("19,90 €");
  });

  it("gère zéro", () => {
    expect(clean(formatPrice(0))).toBe("0,00 €");
  });

  it("refuse un prix négatif", () => {
    expect(() => formatPrice(-1)).toThrow(RangeError);
  });
});
