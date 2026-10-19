import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Connexion | Papeterie Démo" };

export default function LoginPage() {
  return (
    <>
      <h1>Connexion</h1>
      <p>Page de démonstration, aucune donnée n&apos;est envoyée.</p>
      <LoginForm />
    </>
  );
}
