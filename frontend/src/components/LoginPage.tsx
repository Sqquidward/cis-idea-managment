import { FormEvent, useState } from "react";
import { IconLightbulb } from "./ui/Icons";

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await onLogin(username.trim(), password.trim());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg">
          <div className="border-b border-slate-100 bg-slate-50 px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
              <IconLightbulb className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              КИС «Управление идеями»
            </h1>
            <p className="mt-2 text-sm text-slate-500">Корпоративная система инноваций</p>
          </div>

          <div className="p-8">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                <span className="mt-0.5 shrink-0 font-bold text-rose-500">!</span>
                Неверный логин или пароль. Проверьте данные и попробуйте снова.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="label-field">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Admin, User или Committee"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="password" className="label-field">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "Вход в систему…" : "Войти"}
              </button>
            </form>

            <div className="mt-6 space-y-1 text-center text-xs text-slate-400">
              <p>Учётные записи (пароль 12345):</p>
              <p>
                <span className="font-medium text-slate-500">Admin</span> — администратор ·{" "}
                <span className="font-medium text-slate-500">User</span> — пользователь ·{" "}
                <span className="font-medium text-slate-500">Committee</span> — комитет
              </p>
              <p className="pt-2">Разработано студентами группы ИНБО-12-23</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
