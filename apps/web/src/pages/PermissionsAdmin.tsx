import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Save, Shield } from "lucide-react";
import { apiJson } from "../lib/api/client";
import { cn } from "../lib/cn";
import { useTranslation } from "../context/I18nContext";

type CatalogEntry = {
  key: string;
  module: string;
  moduleLabelAr: string;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
};

type RoleRow = {
  id: string;
  slug: string;
  labelAr: string | null;
  labelEn: string | null;
  permissionKeys: string[];
};

type UserRow = {
  id: string;
  email: string;
  isActive: boolean;
  roles: { roleId: string; slug: string; labelAr: string | null }[];
  effectivePermissionKeys: string[];
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PermissionsAdmin() {
  const { t, locale } = useTranslation();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, Set<string>> | null>(null);

  const catalogQuery = useQuery({
    queryKey: ["auth-catalog"],
    queryFn: () => apiJson<{ catalog: CatalogEntry[] }>("/api/auth/catalog"),
  });

  const matrixQuery = useQuery({
    queryKey: ["auth-matrix"],
    queryFn: () => apiJson<RoleRow[]>("/api/auth/roles-matrix"),
  });

  const usersQuery = useQuery({
    queryKey: ["auth-users"],
    queryFn: () => apiJson<UserRow[]>("/api/auth/users"),
  });

  React.useEffect(() => {
    if (!matrixQuery.data || draft !== null) return;
    const next: Record<string, Set<string>> = {};
    for (const r of matrixQuery.data) {
      next[r.slug] = new Set(r.permissionKeys);
    }
    setDraft(next);
  }, [matrixQuery.data, matrixQuery.dataUpdatedAt, draft]);

  const saveMutation = useMutation({
    mutationFn: async (roles: Record<string, string[]>) => {
      await apiJson<{ ok: boolean }>("/api/auth/matrix", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles }),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["auth-matrix"] });
      await qc.invalidateQueries({ queryKey: ["auth-users"] });
      setDraft(null);
    },
  });

  const roles = matrixQuery.data ?? [];
  const catalog = catalogQuery.data?.catalog ?? [];

  const modulesOrdered = useMemo(() => {
    const map = new Map<string, CatalogEntry[]>();
    for (const e of catalog) {
      const arr = map.get(e.module) ?? [];
      arr.push(e);
      map.set(e.module, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [catalog]);

  const togglePerm = (slug: string, key: string, checked: boolean) => {
    setDraft((prev) => {
      const base = prev ?? {};
      const clone: Record<string, Set<string>> = {};
      for (const [k, v] of Object.entries(base)) {
        clone[k] = new Set(v);
      }
      if (!clone[slug]) clone[slug] = new Set();
      const set = new Set(clone[slug]);
      if (checked) set.add(key);
      else set.delete(key);
      clone[slug] = set;
      return clone;
    });
  };

  const handleSaveMatrix = () => {
    if (!draft) return;
    const rolesPayload: Record<string, string[]> = {};
    for (const [slug, set] of Object.entries(draft)) {
      rolesPayload[slug] = [...set].sort();
    }
    saveMutation.mutate(rolesPayload);
  };

  const exportBundle = () => {
    downloadJson("permissions-bundle.json", {
      catalog,
      roles: roles.map((r) => ({
        ...r,
        permissionKeys: draft?.[r.slug] ? [...draft[r.slug]!] : r.permissionKeys,
      })),
      users: usersQuery.data ?? [],
      exportedAt: new Date().toISOString(),
    });
  };

  if (catalogQuery.isError || matrixQuery.isError) {
    return (
      <div className="glass-panel p-8 border border-brand-error/40 text-brand-error">
        <p className="leading-relaxed">{t("pages.permissions.loadError")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-brand-border pb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-border border border-brand-metal/30">
            <Shield className="w-8 h-8 text-brand-wood" />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tighter text-brand-luxury">
              {t("pages.permissions.title")}
            </h1>
            <p className="text-brand-metal mt-1 leading-relaxed">{t("pages.permissions.subtitle")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="industrial-btn py-2 gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("pages.permissions.dashboard")}
          </Link>
          <a
            href="/permissions-reference.json"
            download
            className="industrial-btn py-2 gap-2 border-brand-metal/40"
          >
            <Download className="w-4 h-4" />
            {t("pages.permissions.refJson")}
          </a>
          <button
            type="button"
            className="industrial-btn py-2 gap-2 bg-brand-wood/15 border-brand-wood/50 text-brand-wood"
            onClick={exportBundle}
          >
            <Download className="w-4 h-4" />
            {t("pages.permissions.exportBundle")}
          </button>
          <button
            type="button"
            disabled={!draft || saveMutation.isPending}
            className="industrial-btn py-2 gap-2 bg-brand-success/10 border-brand-success/40 text-brand-success disabled:opacity-40"
            onClick={handleSaveMatrix}
          >
            <Save className="w-4 h-4" />
            {t("pages.permissions.saveMatrix")}
          </button>
        </div>
      </header>

      <section className="glass-panel p-4 sm:p-6 md:p-8 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-luxury">
          {t("pages.permissions.matrixTitle")}
        </h2>
        <p className="text-[11px] text-brand-metal leading-relaxed">
          {t("pages.permissions.matrixHint")}
        </p>
        <div className="overflow-x-auto border border-brand-border">
          <table className="w-full text-start text-[10px] uppercase tracking-wider min-w-[960px]">
            <thead className="bg-brand-elevated border-b border-brand-border sticky top-0 z-10">
              <tr>
                <th className="p-3 text-brand-metal w-[220px] normal-case">
                  {t("pages.permissions.colPermission")}
                </th>
                <th className="p-3 text-brand-metal w-[140px] normal-case">
                  {t("pages.permissions.colKey")}
                </th>
                {roles.map((r) => (
                  <th key={r.slug} className="p-2 text-center text-brand-luxury align-bottom">
                    <span className="block normal-case text-[9px] leading-tight">
                      {(locale === "en" ? r.labelEn ?? r.slug : r.labelAr ?? r.slug) as string}
                    </span>
                    <span className="block text-[8px] text-brand-metal mt-1">{r.slug}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulesOrdered.map(([module, entries]) => (
                <React.Fragment key={module}>
                  <tr className="bg-brand-black/80 border-t border-brand-border">
                    <td
                      colSpan={2 + roles.length}
                      className={cn(
                        "p-2 ps-3 font-bold text-brand-wood normal-case text-[11px]",
                        locale === "ar" && "font-arabic",
                      )}
                    >
                      {locale === "en" ? module : (entries[0]?.moduleLabelAr ?? module)}
                    </td>
                  </tr>
                  {entries.map((e) => (
                    <tr key={e.key} className="border-t border-brand-border/80 hover:bg-brand-elevated/40">
                      <td className="p-2 ps-3 normal-case text-brand-luxury text-[11px]">
                        {locale === "en" ? e.labelEn : e.labelAr}
                      </td>
                      <td className="p-2 font-mono text-[9px] text-brand-metal">{e.key}</td>
                      {roles.map((r) => {
                        const set = draft?.[r.slug];
                        const checked = set ? set.has(e.key) : r.permissionKeys.includes(e.key);
                        return (
                          <td key={`${r.slug}-${e.key}`} className="p-1 text-center align-middle">
                            <input
                              type="checkbox"
                              className="accent-brand-wood w-4 h-4 cursor-pointer"
                              checked={checked}
                              onChange={(ev) => togglePerm(r.slug, e.key, ev.target.checked)}
                              aria-label={`${r.slug} ${e.key}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <UsersRolesSection roles={roles} users={usersQuery.data} />

      <footer className="text-[10px] text-brand-metal border-t border-brand-border pt-6">
        {t("pages.permissions.footerDoc")}
      </footer>
    </div>
  );
}

function UsersRolesSection({
  roles,
  users,
}: {
  roles: RoleRow[];
  users: UserRow[] | undefined;
}) {
  const { t, locale } = useTranslation();
  const qc = useQueryClient();
  const [newEmail, setNewEmail] = useState("");

  const createMutation = useMutation({
    mutationFn: (email: string) =>
      apiJson<{ id: string; email: string }>("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
    onSuccess: async () => {
      setNewEmail("");
      await qc.invalidateQueries({ queryKey: ["auth-users"] });
    },
  });

  const saveRolesMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      apiJson<{ ok: boolean }>(`/api/auth/users/${encodeURIComponent(userId)}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["auth-users"] });
    },
  });

  return (
    <section className="glass-panel p-4 sm:p-6 md:p-8 space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-brand-luxury">
        {t("pages.permissions.usersTitle")}
      </h2>
      <p className="text-[11px] text-brand-metal block mb-2 leading-relaxed">{t("pages.permissions.usersHint")}</p>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="email"
          dir="ltr"
          placeholder={t("pages.permissions.emailPlaceholder")}
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-brand-black border border-brand-border text-brand-luxury text-xs font-mono"
        />
        <button
          type="button"
          className="industrial-btn text-[10px]"
          disabled={!newEmail.includes("@") || createMutation.isPending}
          onClick={() => createMutation.mutate(newEmail.trim())}
        >
          {t("pages.permissions.addUser")}
        </button>
      </div>

      <div className="overflow-x-auto border border-brand-border">
        <table className="w-full text-[11px] min-w-[640px]">
          <thead className="bg-brand-elevated border-b border-brand-border">
            <tr>
              <th className="p-2 text-start text-brand-metal">{t("pages.permissions.colEmail")}</th>
              {roles.map((r) => (
                <th key={r.id} className="p-2 text-center text-brand-luxury">
                  {(locale === "en" ? r.labelEn ?? r.slug : r.labelAr ?? r.slug) as string}
                </th>
              ))}
              <th className="p-2 w-[100px]" />
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <UserRoleRow
                key={u.id}
                user={u}
                roles={roles}
                onSave={(roleIds) => saveRolesMutation.mutate({ userId: u.id, roleIds })}
                saving={saveRolesMutation.isPending}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function UserRoleRow({
  user,
  roles,
  onSave,
  saving,
}: {
  user: UserRow;
  roles: RoleRow[];
  onSave: (roleIds: string[]) => void;
  saving: boolean;
}) {
  const { t } = useTranslation();
  const assigned = useMemo(() => new Set(user.roles.map((r) => r.roleId)), [user.roles]);
  const [local, setLocal] = useState<Set<string>>(() => assigned);

  React.useEffect(() => {
    setLocal(new Set(user.roles.map((r) => r.roleId)));
  }, [user.roles]);

  const toggle = (roleId: string, v: boolean) => {
    setLocal((prev) => {
      const n = new Set(prev);
      if (v) n.add(roleId);
      else n.delete(roleId);
      return n;
    });
  };

  const dirty =
    local.size !== assigned.size || [...local].some((id) => !assigned.has(id));

  return (
    <tr className="border-t border-brand-border">
      <td className="p-2 font-mono text-brand-luxury">{user.email}</td>
      {roles.map((r) => (
        <td key={r.id} className="p-2 text-center">
          <input
            type="checkbox"
            className="accent-brand-wood w-4 h-4 cursor-pointer"
            checked={local.has(r.id)}
            onChange={(ev) => toggle(r.id, ev.target.checked)}
          />
        </td>
      ))}
      <td className="p-2 text-center">
        <button
          type="button"
          disabled={!dirty || saving}
          className={cn(
            "text-[9px] font-bold uppercase tracking-wider px-2 py-1 border",
            dirty ? "border-brand-success text-brand-success" : "border-brand-border text-brand-metal opacity-40",
          )}
          onClick={() => onSave([...local])}
        >
          {t("pages.permissions.saveRow")}
        </button>
      </td>
    </tr>
  );
}
