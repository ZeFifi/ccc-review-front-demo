"use client";

import { useState, type FormEvent } from "react";

// Démo : ce formulaire ne connecte personne et n'envoie rien.
export function LoginForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Démo : aucune connexion réelle n'est effectuée.");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="login-email">E-mail</label>
        <input id="login-email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="login-password">Mot de passe</label>
        <input id="login-password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button type="submit">Se connecter</button>
      <p className="status" role="status">
        {message}
      </p>
    </form>
  );
}
