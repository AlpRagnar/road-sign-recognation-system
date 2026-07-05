"use client";

import { useCallback, useEffect, useState } from "react";
import { CredentialDialog, type CredentialInfo } from "@/components/CredentialDialog";
import { PaginationBar } from "@/components/PaginationBar";
import { Drawer } from "@/components/ui/Drawer";
import { OverflowMenu } from "@/components/ui/OverflowMenu";
import { Icon } from "@/components/ui/Icon";
import { ErrorBanner, EmptyState, SkeletonRows, btnPrimary } from "@/components/ui/primitives";
import type { Profile } from "@/lib/types/database";

interface CreateForm {
  full_name: string;
  email: string;
  role: "user" | "admin";
  autoPassword: boolean;
  password: string;
}

const EMPTY_CREATE: CreateForm = { full_name: "", email: "", role: "user", autoPassword: true, password: "" };
const inputCls =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function RoleBadge({ role }: { role: string }) {
  const admin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-badge px-2 py-0.5 text-xs font-medium ${
        admin ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${admin ? "bg-primary" : "bg-slate-400"}`} />
      {admin ? "Admin" : "User"}
    </span>
  );
}

export function AdminUsersClient({ currentProfileId }: { currentProfileId: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({ ...EMPTY_CREATE });
  const [creating, setCreating] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [credential, setCredential] = useState<CredentialInfo | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (debouncedSearch) qs.set("search", debouncedSearch);
      if (roleFilter !== "all") qs.set("role", roleFilter);
      const json = await fetch(`/api/admin/users?${qs}`).then((r) => r.json());
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setProfiles(json.data.items);
      setTotal(json.data.total);
      setTotalPages(json.data.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, roleFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, body: Record<string, unknown>) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Update failed");
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...json.data.profile } : p)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: createForm.full_name,
          email: createForm.email,
          role: createForm.role,
          ...(createForm.autoPassword ? {} : { password: createForm.password }),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Create failed");
      setCredential({
        title: "User created",
        rows: [
          { label: "Email", value: json.data.profile.email ?? createForm.email },
          { label: "Full name", value: json.data.profile.full_name ?? "—" },
          { label: "Role", value: json.data.profile.role },
        ],
        password: json.data.tempPassword,
      });
      setShowCreate(false);
      setCreateForm({ ...EMPTY_CREATE });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function resetPassword(p: Profile) {
    const self = p.id === currentProfileId;
    const msg = self
      ? "Reset YOUR OWN password? You will need the new password to log in next time."
      : `Reset password for ${p.email ?? "this user"}?`;
    if (!confirm(msg)) return;
    setResettingId(p.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${p.id}/reset-password`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Reset failed");
      setCredential({
        title: "Password reset",
        rows: [{ label: "Email", value: json.data.email ?? p.email ?? "—" }],
        password: json.data.tempPassword,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResettingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name="search" size={16} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name…"
            className="w-64 rounded-md border border-slate-300 py-2 pl-8 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as "all" | "user" | "admin");
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={() => {
            setCreateForm({ ...EMPTY_CREATE });
            setShowCreate(true);
          }}
          className={`${btnPrimary} ml-auto`}
        >
          <Icon name="plus" size={16} />
          Create user
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-md border border-line bg-white md:block">
        {loading ? (
          <SkeletonRows rows={5} cols={5} />
        ) : profiles.length === 0 ? (
          <EmptyState icon="users" title="No users match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-panel/60 text-left">
                <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:font-mono [&>th]:text-[11px] [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-slate-500">
                  <th>Full name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {profiles.map((p) => {
                  const isSelf = p.id === currentProfileId;
                  return (
                    <tr key={p.id} className={`hover:bg-panel/40 ${savingId === p.id ? "opacity-50" : ""}`}>
                      <td className="px-3 py-2">
                        <input
                          defaultValue={p.full_name ?? ""}
                          key={p.full_name ?? ""}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v !== (p.full_name ?? "")) patch(p.id, { full_name: v });
                          }}
                          className="w-44 rounded border border-transparent px-1 py-0.5 hover:border-slate-300 focus:border-primary focus:outline-none"
                          placeholder="—"
                        />
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">{p.email ?? "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <RoleBadge role={p.role} />
                          <select
                            value={p.role}
                            disabled={isSelf}
                            title={isSelf ? "You cannot change your own role" : "Change role"}
                            onChange={(e) => patch(p.id, { role: e.target.value })}
                            className="rounded border border-slate-300 px-1 py-0.5 text-xs disabled:opacity-40"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs tabular text-slate-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <OverflowMenu
                          items={[
                            {
                              label: resettingId === p.id ? "Resetting…" : "Reset password",
                              onClick: () => resetPassword(p),
                              disabled: resettingId === p.id,
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-md border border-line bg-white"><SkeletonRows rows={3} cols={2} /></div>
        ) : profiles.length === 0 ? (
          <div className="rounded-md border border-line bg-white">
            <EmptyState icon="users" title="No users match your filters." />
          </div>
        ) : (
          profiles.map((p) => {
            const isSelf = p.id === currentProfileId;
            return (
              <div key={p.id} className="rounded-md border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{p.full_name || "—"}</p>
                    <p className="truncate font-mono text-xs text-slate-500">{p.email}</p>
                  </div>
                  <RoleBadge role={p.role} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {!isSelf && (
                    <select
                      value={p.role}
                      onChange={(e) => patch(p.id, { role: e.target.value })}
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                  <button
                    onClick={() => resetPassword(p)}
                    disabled={resettingId === p.id}
                    className="ml-auto text-xs font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    {resettingId === p.id ? "Resetting…" : "Reset password"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />

      {/* Create-user drawer */}
      <Drawer
        open={showCreate}
        title="Create a Supabase Auth user"
        onClose={() => setShowCreate(false)}
        footer={
          <button type="submit" form="create-user-form" disabled={creating} className={`${btnPrimary} w-full`}>
            {creating ? "Creating…" : "Create user"}
          </button>
        }
      >
        <form id="create-user-form" onSubmit={submitCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">Full name</label>
            <input
              value={createForm.full_name}
              onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Email *</label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Role *</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as "user" | "admin" })}
              className={inputCls}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={createForm.autoPassword}
                onChange={(e) => setCreateForm({ ...createForm, autoPassword: e.target.checked })}
              />
              Auto-generate temporary password
            </label>
            {!createForm.autoPassword && (
              <input
                type="text"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Min 8 characters"
                className={inputCls}
              />
            )}
          </div>
        </form>
      </Drawer>

      {credential && <CredentialDialog info={credential} onClose={() => setCredential(null)} />}
    </div>
  );
}
