import { useCallback } from "react";
import { Link } from "wouter";
import { readStoredAccessToken, writeStoredAccessToken } from "../../lib/api/client";

export function AuthHeaderLinks() {
  const token = readStoredAccessToken();

  const logout = useCallback(() => {
    writeStoredAccessToken(null);
    window.location.assign("/");
  }, []);

  return (
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
      {token ? (
        <button type="button" onClick={logout} className="industrial-btn py-1.5 px-2 text-[10px]">
          Sign out
        </button>
      ) : (
        <Link href="/login">
          <a className="industrial-btn py-1.5 px-2 text-[10px]">Sign in</a>
        </Link>
      )}
    </div>
  );
}
