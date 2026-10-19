import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact | Papeterie Démo" };

export default function ContactPage() {
  return (
    <>
      <h1>Contact</h1>
      <p>Tous les champs sont obligatoires.</p>
      <ContactForm />
    </>
  );
}
