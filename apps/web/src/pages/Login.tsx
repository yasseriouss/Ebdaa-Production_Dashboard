import React, { useCallback, useState } from "react";
import { BrandLogo } from "../components/brand/BrandLogo";
import { writeStoredAccessToken } from "../lib/api/client";
import { useTranslation } from "../context/I18nContext";

export default function Login() {
  const { t, locale } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setPending(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = (await res.json()) as { accessToken?: string; error?: string; hint?: string };
        if (!res.ok) {
          setError(data?.hint ?? data?.error ?? res.statusText);
          setPending(false);
          return;
        }
        if (!data.accessToken) {
          setError(t("login.missingToken"));
          setPending(false);
          return;
        }
        writeStoredAccessToken(data.accessToken);
        window.location.assign("/");
      } catch {
        setError(t("login.networkError"));
        setPending(false);
      }
    },
    [email, password, t],
  );

  return (
    <div className="max-w-md mx-auto glass-panel p-10 border border-brand-border space-y-8">
      <div className="text-center space-y-2">
        <BrandLogo className="h-14 w-auto mx-auto object-contain" />
        <h1 className="text-xl font-bold tracking-tight text-brand-luxury">{t("login.title")}</h1>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-metal">{t("login.email")}</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-metal">{t("login.password")}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm"
            required
          />
        </label>
        {error ? (
          <p className="text-xs text-brand-error" dir="ltr">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="industrial-btn w-full justify-center">
          {pending ? "…" : t("login.continue")}
        </button>
      </form>
      <p
        className="text-[10px] text-brand-metal text-center leading-relaxed"
        dir={locale === "ar" ? "rtl" : "ltr"}
        lang={locale === "ar" ? "ar" : "en"}
      >
        {t("login.devHintAr")}
      </p>
      <p className="text-[10px] text-brand-metal text-center leading-relaxed" dir="ltr" lang="en">
        {t("login.devHintEn")}
      </p>
    </div>
  );
}
