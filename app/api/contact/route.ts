import { NextResponse } from "next/server";
import { validateContact, type ContactInput } from "@/lib/contact";

// Route serveur : classée "haut" dans RISK.md (app/api/**).
export async function POST(request: Request) {
  let body: Partial<ContactInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const errors = validateContact(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // Démo : rien n'est envoyé ni stocké.
  return NextResponse.json({ ok: true });
}
