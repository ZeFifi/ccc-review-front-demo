export type ContactInput = { name: string; email: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valide le formulaire de contact. Utilisé côté client et côté serveur. */
export function validateContact(input: Partial<ContactInput>): ContactErrors {
  const errors: ContactErrors = {};
  if (!input.name || input.name.trim().length < 2) errors.name = "Indiquez votre nom (2 caractères minimum).";
  if (!input.email || !EMAIL.test(input.email)) errors.email = "Indiquez une adresse e-mail valide.";
  if (!input.message || input.message.trim().length < 10) errors.message = "Votre message doit faire au moins 10 caractères.";
  return errors;
}
