import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Papeterie Démo",
  description: "Projet de démonstration CodeCodeCoders : la revue de diffs IA quand on est seul.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <header className="site-header">
          <Link href="/" className="brand">
            Papeterie Démo
          </Link>
          <nav aria-label="Navigation principale">
            <ul>
              <li>
                <Link href="/">Produits</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/connexion">Connexion</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main id="contenu">{children}</main>
        <footer className="site-footer">
          <p>Boutique fictive, projet de démonstration de la newsletter CodeCodeCoders.</p>
        </footer>
      </body>
    </html>
  );
}
