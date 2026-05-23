import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { ROLES } from "../lib/roles";
import { cn } from "../lib/utils";
import type { AdminUser, UserCreatePayload } from "../types";
import { UserAvatar } from "./UserAvatar";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";

const ROLE_OPTIONS = [
  { value: ROLES.USER, label: "Пользователь" },
  { value: ROLES.COMMITTEE, label: "Комитет" },
  { value: ROLES.ADMIN, label: "Админ" },
] as const;

function roleBadgeClass(role: string): string {
  if (role === ROLES.ADMIN) return "bg-violet-50 text-violet-800 ring-violet-200";
  if (role === ROLES.COMMITTEE) return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

const EMPTY_FORM: UserCreatePayload = {
  username: "",
  display_name: "",
  password: "",
  role: ROLES.USER,
};

export function UsersAdminScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UserCreatePayload>(EMPTY_FORM);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await api.createUser({
        username: form.username.trim(),
        display_name: form.display_name.trim(),
        password: form.password,
        role: form.role,
      });
      setUsers((prev) =>
        [...prev, created].sort((a, b) => a.username.localeCompare(b.username, "ru")),
      );
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSuccess(`Пользователь «${created.username}» создан`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать пользователя");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Управление пользователями"
        description="Просмотр учётных записей и создание новых сотрудников, экспертов комитета и администраторов."
        badge="Администрирование"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Всего пользователей: <span className="font-semibold text-slate-900">{users.length}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setSuccess(null);
            setError(null);
          }}
          className="btn-primary !py-2 !text-sm"
        >
          {showForm ? "Скрыть форму" : "+ Создать пользователя"}
        </button>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6"
        >
          <h3 className="text-lg font-bold text-slate-900">Новый пользователь</h3>
          <p className="mt-1 text-sm text-slate-500">
            Укажите логин для входа, отображаемое имя, пароль и роль в системе.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Логин</span>
              <input
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="input-field mt-1"
                placeholder="ivanov"
                autoComplete="off"
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Отображаемое имя
              </span>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={form.display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                className="input-field mt-1"
                placeholder="Иванов И. И."
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Пароль</span>
              <input
                type="password"
                required
                minLength={4}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="input-field mt-1"
                placeholder="Минимум 4 символа"
                autoComplete="new-password"
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Роль</span>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="input-field mt-1"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && showForm && (
            <p className="mt-3 text-sm text-rose-600">{error}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Создание…" : "Создать"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setForm(EMPTY_FORM);
                setShowForm(false);
              }}
              className="btn-secondary"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center text-sm text-slate-500 py-12">Загрузка…</p>
      ) : error && !showForm ? (
        <EmptyState title="Ошибка загрузки" description={error} />
      ) : users.length === 0 ? (
        <EmptyState title="Пользователей нет" description="Создайте первого пользователя с помощью формы выше." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Пользователь</th>
                  <th className="px-5 py-4">Логин</th>
                  <th className="px-5 py-4">Роль</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.user_id} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar emoji={u.avatar_emoji} name={u.display_name} size="sm" />
                        <span className="font-medium text-slate-900">{u.display_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">{u.username}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                          roleBadgeClass(u.role),
                        )}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
