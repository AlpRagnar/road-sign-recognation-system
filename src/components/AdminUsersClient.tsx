"use client";

import { useCallback, useEffect, useState } from "react";
import { CredentialDialog, type CredentialInfo } from "@/components/CredentialDialog";
import { PaginationBar } from "@/components/PaginationBar";
import type { Profile } from "@/lib/types/database";

interface CreateForm {
  full_name: string;
  email: string;
  role: "user" | "admin";
  autoPassword: boolean;
  password: string;
}

const EMPTY_CREATE: CreateForm = {
  full_name: "",
  email: "",
  role: "user",
  autoPassword: true,
  password: "",
};

export function AdminUsersClient({ currentProfileId }: { currentProfileId: string }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Query controls
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Create user
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({ ...EMPTY_CREATE });
  const [creating, setCreating] = useState(false);

  // Reset password
  const [resettingId, setResettingId] = useState<string | null>(null);

  // One-time credential dialog
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
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email or name…"
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as "all" | "user" | "admin");
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="all">All roles</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button
          onClick={() => {
            setShowCreate((s) => !s);
            setCreateForm({ ...EMPTY_CREATE });
          }}
          className="ml-auto rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          {showCreate ? "Cancel" : "Create user"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={submitCreate} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">Create a Supabase Auth user</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600">Full name</label>
              <input
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Email *</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Role *</label>
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({ ...createForm, role: e.target.value as "user" | "admin" })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
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
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              )}
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-400">Loading users…</p>
        ) : profiles.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No users match your filters.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Full name</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((p) => {
                const isSelf = p.id === currentProfileId;
                return (
                  <tr key={p.id} className={savingId === p.id ? "opacity-50" : ""}>
                    <td className="px-3 py-2">
                      <input
                        defaultValue={p.full_name ?? ""}
                        key={p.full_name ?? ""}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v !== (p.full_name ?? "")) patch(p.id, { full_name: v });
                        }}
                        className="w-44 rounded border border-transparent px-1 py-0.5 hover:border-slate-300 focus:border-brand focus:outline-none"
                        placeholder="—"
                      />
                    </td>
                    <td className="px-3 py-2 text-slate-600">{p.email ?? "—"}</td>
                    <td className="px-3 py-2">
                      <select
                        value={p.role}
                        disabled={isSelf}
                        title={isSelf ? "You cannot change your own role" : undefined}
                        onChange={(e) => patch(p.id, { role: e.target.value })}
                        className="rounded border border-slate-300 px-1 py-0.5 text-xs disabled:opacity-50"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => resetPassword(p)}
                        disabled={resettingId === p.id}
                        className="text-xs text-brand underline hover:text-brand-dark disabled:opacity-50"
                      >
                        {resettingId === p.id ? "Resetting…" : "Reset password"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

      {credential && (
        <CredentialDialog info={credential} onClose={() => setCredential(null)} />
      )}
    </div>
  );
}
