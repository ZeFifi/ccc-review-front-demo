import { describe, expect, it } from "vitest";
import { validateContact } from "./contact";

describe("validateContact", () => {
  it("accepte un formulaire complet", () => {
    expect(validateContact({ name: "Ada", email: "ada@example.com", message: "Bonjour, une question." })).toEqual({});
  });

  it("signale chaque champ invalide", () => {
    const errors = validateContact({ name: "", email: "pas-un-email", message: "court" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
  });
});
