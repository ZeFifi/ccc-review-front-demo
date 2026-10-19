import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Quelques en-têtes de sécurité de base : un diff qui touche ce fichier est classé "haut" dans RISK.md.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
