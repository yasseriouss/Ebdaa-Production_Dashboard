import { useCallback } from "react";
import { Link } from "wouter";
import { readStoredAccessToken, writeStoredAccessToken } from "../../lib/api/client";
import { useDirection } from "../../lib/useDirection";
import { useTranslation } from "../../context/I18nContext";

export function AuthHeaderLinks() {
  const token = readStoredAccessToken();
  const { direction } = useDirection();
  const { t } = useTranslation();
  const rtl = direction === "rtl";

  const logout = useCallback(() => {
    writeStoredAccessToken(null);
    window.location.assign("/");
  }, []);

  return (
    <div
      className={`flex items-center gap-2 text-[10px] font-bold ${
        rtl ? "tracking-normal normal-case" : "uppercase tracking-widest"
      }`}
    >
      {token ? (
        <button type="button" onClick={logout} className="industrial-btn py-1.5 px-2 text-[10px]">
          {t("auth.signOut")}
        </button>
      ) : (
        <Link href="/login" className="industrial-btn py-1.5 px-2 text-[10px]">
          {t("auth.signIn")}
        </Link>
      )}
    </div>
  );
}
