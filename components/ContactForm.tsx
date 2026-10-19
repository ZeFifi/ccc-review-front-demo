"use client";

import { useState, type FormEvent } from "react";
import { validateContact, type ContactErrors } from "@/lib/contact";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "error"; message: string };

export function ContactForm() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // On garde une référence au formulaire : event.currentTarget vaut null après le await.
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const found = validateContact(data);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setStatus({ kind: "ok" });
      form.reset();
    } catch {
      setStatus({ kind: "error", message: "L'envoi a échoué. Réessayez dans un instant." });
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Nom</label>
        <input id="name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
        {errors.name && <p id="name-error" className="error">{errors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
        {errors.email && <p id="email-error" className="error">{errors.email}</p>}
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={5} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
        {errors.message && <p id="message-error" className="error">{errors.message}</p>}
      </div>
      <button type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Envoi…" : "Envoyer"}
      </button>
      <p className="status" role="status" data-kind={status.kind}>
        {status.kind === "ok" && "Message envoyé (démo : rien n'est stocké)."}
        {status.kind === "error" && status.message}
      </p>
    </form>
  );
}
