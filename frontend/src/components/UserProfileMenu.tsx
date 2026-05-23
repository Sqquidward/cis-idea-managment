import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { AVATAR_EMOJIS } from "../lib/avatars";
import type { TabId, UserProfile, UserSession } from "../types";
import { canAccessTab } from "../lib/roles";
import { cn } from "../lib/utils";
import { UserAvatar } from "./UserAvatar";
import { IconChevronDown, IconLogout, IconUser } from "./ui/Icons";

interface UserProfileMenuProps {
  user: UserSession;
  myIdeasCount: number;
  ideasCount: number;
  votingCount: number;
  onNavigate: (tab: TabId) => void;
  onProfileUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
}

export function UserProfileMenu({
  user,
  myIdeasCount,
  ideasCount,
  votingCount,
  onNavigate,
  onProfileUpdate,
  onLogout,
}: UserProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(user.displayName);
  const [draftEmoji, setDraftEmoji] = useState(user.avatarEmoji);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const showMyIdeas = canAccessTab(user.role, "screen6");

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setDraftName(user.displayName);
      setDraftEmoji(user.avatarEmoji);
      setError(null);
    }
  }, [open, user.displayName, user.avatarEmoji]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleSave() {
    const name = draftName.trim();
    if (name.length < 2) {
      setError("Имя должно содержать не менее 2 символов");
      return;
    }
    const unchanged = name === user.displayName && draftEmoji === user.avatarEmoji;
    if (unchanged) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const profile = await api.updateProfile({
        display_name: name !== user.displayName ? name : undefined,
        avatar_emoji: draftEmoji !== user.avatarEmoji ? draftEmoji : undefined,
      });
      onProfileUpdate(profile);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition sm:px-3",
          open
            ? "border-indigo-200 bg-indigo-50 ring-2 ring-indigo-100"
            : "border-transparent hover:border-slate-200 hover:bg-slate-50",
        )}
      >
        <UserAvatar emoji={user.avatarEmoji} name={user.displayName} size="sm" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-medium text-slate-800">{user.displayName}</p>
          <p className="truncate text-xs text-slate-500">{user.role}</p>
        </div>
        <IconChevronDown
          className={cn(
            "hidden h-4 w-4 shrink-0 text-slate-400 transition sm:block",
            open && "rotate-180 text-indigo-600",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-xl border border-slate-200 bg-white py-2 shadow-lg shadow-slate-200/60 animate-fade-in"
        >
          <div className="border-b border-slate-100 px-4 pb-3 pt-1">
            <div className="flex items-start gap-3">
              <UserAvatar emoji={draftEmoji} name={draftName} size="md" />
              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Отображаемое имя
                      </span>
                      <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        maxLength={100}
                        className="input-field mt-1 !py-1.5 !text-sm"
                        placeholder="Ваше имя"
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <p className="truncate font-semibold text-slate-900">{user.displayName}</p>
                    <p className="text-xs text-slate-500">{user.role}</p>
                  </>
                )}
              </div>
            </div>

            {editing ? (
              <div className="mt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Аватар
                </p>
                <div className="grid max-h-32 grid-cols-6 gap-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 p-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setDraftEmoji(emoji)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-xl transition hover:bg-white",
                        draftEmoji === emoji && "bg-indigo-100 ring-2 ring-indigo-500",
                      )}
                      title="Выбрать аватар"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSave}
                    className="btn-primary flex-1 !py-1.5 !text-xs"
                  >
                    {saving ? "Сохранение…" : "Сохранить"}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setDraftName(user.displayName);
                      setDraftEmoji(user.avatarEmoji);
                      setEditing(false);
                      setError(null);
                    }}
                    className="btn-secondary !py-1.5 !text-xs"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-3 w-full rounded-lg border border-dashed border-indigo-200 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
              >
                Изменить имя и аватар
              </button>
            )}
          </div>

          {!editing && (
            <>
              <div className="space-y-2 px-4 py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Логин</span>
                  <span className="truncate font-medium text-slate-800">{user.username}</span>
                </div>
              </div>

              <div className="mx-4 mb-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
                  <p className="text-lg font-bold text-slate-900">{ideasCount}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    Всего идей
                  </p>
                </div>
                {showMyIdeas ? (
                  <div className="rounded-lg bg-indigo-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-indigo-700">{myIdeasCount}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-indigo-600">
                      Мои идеи
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-amber-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-amber-800">{votingCount}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-amber-700">
                      На голосовании
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 px-2 pt-1">
                {showMyIdeas && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onNavigate("screen6");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <IconUser className="h-4 w-4 text-slate-400" />
                    Мои идеи
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <IconLogout className="h-4 w-4" />
                  Выйти из системы
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
