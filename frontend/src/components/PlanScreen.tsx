import { useEffect, useState } from "react";
import type { Idea, PlanTeamMember, UserSession } from "../types";
import { getInitials } from "../lib/utils";
import { isAdmin } from "../lib/roles";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";

function stripAuthorSuffix(name: string): string {
  return name.replace(" (Вы)", "").trim();
}

function buildInitialTeam(idea: Idea): PlanTeamMember[] {
  const authorName = stripAuthorSuffix(idea.author);
  const fromPlan = idea.plan?.team ?? [];
  const authorRow = fromPlan.find((m) => m.is_author);
  const extras = fromPlan.filter((m) => !m.is_author);

  return [
    {
      display_name: authorName,
      task: authorRow?.task ?? "",
      is_author: true,
    },
    ...extras,
  ];
}

interface PlanScreenProps {
  projects: Idea[];
  currentUser: UserSession;
  onSave: (ideaId: number, deadline: string, team: PlanTeamMember[]) => Promise<void>;
}

export function PlanScreen({ projects, currentUser, onSave }: PlanScreenProps) {
  const [selectedId, setSelectedId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [team, setTeam] = useState<PlanTeamMember[]>([]);

  const selectedProject = projects.find((p) => String(p.id) === selectedId);
  const showForm = Boolean(selectedId && selectedProject);
  const hasDraftPlan = Boolean(selectedProject?.plan);
  const canManageTeam = selectedProject?.is_owner ?? false;

  useEffect(() => {
    if (!selectedProject) {
      setDeadline("");
      setTeam([]);
      return;
    }
    setDeadline(selectedProject.plan?.deadline ?? "");
    setTeam(buildInitialTeam(selectedProject));
  }, [selectedProject]);

  function updateAuthorTask(task: string) {
    setTeam((prev) =>
      prev.map((m) => (m.is_author ? { ...m, task } : m)),
    );
  }

  function updateMemberTask(index: number, task: string) {
    setTeam((prev) =>
      prev.map((m, i) => {
        const extraIndex = i - 1;
        if (m.is_author || extraIndex !== index) return m;
        return { ...m, task };
      }),
    );
  }

  function updateMemberName(index: number, display_name: string) {
    setTeam((prev) =>
      prev.map((m, i) => {
        const extraIndex = i - 1;
        if (m.is_author || extraIndex !== index) return m;
        return { ...m, display_name };
      }),
    );
  }

  function addMember() {
    setTeam((prev) => [...prev, { display_name: "", task: "", is_author: false }]);
  }

  function removeMember(index: number) {
    setTeam((prev) => prev.filter((m, i) => m.is_author || i - 1 !== index));
  }

  async function handleSave() {
    if (!deadline) {
      alert("Укажите плановую дату реализации!");
      return;
    }
    const extras = team.filter((m) => !m.is_author);
    const emptyName = extras.find((m) => !m.display_name.trim());
    if (emptyName) {
      alert("Укажите ФИО для каждого добавленного участника рабочей группы.");
      return;
    }
    await onSave(Number(selectedId), deadline, team);
    alert("Календарный план сохранён. Проект переведён в статус «Реализована».");
    setDeadline("");
    setTeam([]);
    setSelectedId("");
  }

  const authorMember = team.find((m) => m.is_author);
  const extraMembers = team.filter((m) => !m.is_author);

  return (
    <section>
      <PageHeader
        title="Дорожная карта"
        description="Автор идеи формирует рабочую группу: он всегда входит в неё как ответственный и может добавить других участников."
        badge="Шаг 4"
      />

      {projects.length === 0 ? (
        <EmptyState
          title="Нет ваших проектов для планирования"
          description={
            isAdmin(currentUser.role)
              ? "Нет идей в статусе «Реализация», где вы указаны автором."
              : "Здесь отображаются только ваши идеи после утверждения комитетом. Подайте инициативу и дождитесь статуса «Реализация»."
          }
        />
      ) : (
        <div className="card space-y-6">
          <div>
            <label htmlFor="plan-project" className="label-field">
              Ваша идея на этапе реализации
            </label>
            <select
              id="plan-project"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="input-field max-w-xl"
            >
              <option value="">Выберите проект…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                  {p.plan ? " · черновик" : ""}
                </option>
              ))}
            </select>
          </div>

          {showForm && selectedProject && (
            <div className="animate-slide-up space-y-6 border-t border-slate-100 pt-6">
              {hasDraftPlan && (
                <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
                  Загружен сохранённый план. Отредактируйте команду и зафиксируйте дорожную карту.
                </p>
              )}

              <div className="rounded-xl bg-indigo-50 px-4 py-3 ring-1 ring-indigo-100">
                <p className="text-sm font-medium text-indigo-900">{selectedProject.title}</p>
                <p className="mt-0.5 text-xs text-indigo-700">
                  Автор и ответственный за группу: {stripAuthorSuffix(selectedProject.author)}
                </p>
              </div>

              {!canManageTeam && (
                <p className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-800 ring-1 ring-rose-200">
                  Редактировать рабочую группу может только автор этой идеи.
                </p>
              )}

              <div>
                <label htmlFor="plan-deadline" className="label-field">
                  Плановый дедлайн внедрения
                </label>
                <input
                  id="plan-deadline"
                  type="date"
                  value={deadline}
                  disabled={!canManageTeam}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-field max-w-xs"
                />
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="label-field mb-0">Рабочая группа</p>
                  {canManageTeam && (
                    <button type="button" onClick={addMember} className="btn-secondary !py-2 !text-xs">
                      + Добавить участника
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {authorMember && (
                    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                          {getInitials(authorMember.display_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">{authorMember.display_name}</p>
                            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                              Автор идеи
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Ответственный за инициативу — всегда в рабочей группе
                          </p>
                          <input
                            type="text"
                            value={authorMember.task}
                            disabled={!canManageTeam}
                            onChange={(e) => updateAuthorTask(e.target.value)}
                            placeholder="Ваша задача в проекте…"
                            className="input-field mt-3"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {extraMembers.map((member, index) => (
                    <div
                      key={`extra-${index}`}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={member.display_name}
                            disabled={!canManageTeam}
                            onChange={(e) => updateMemberName(index, e.target.value)}
                            placeholder="ФИО участника"
                            className="input-field"
                          />
                          <input
                            type="text"
                            value={member.task}
                            disabled={!canManageTeam}
                            onChange={(e) => updateMemberTask(index, e.target.value)}
                            placeholder="Задача в проекте…"
                            className="input-field"
                          />
                        </div>
                        {canManageTeam && (
                          <button
                            type="button"
                            onClick={() => removeMember(index)}
                            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {extraMembers.length === 0 && canManageTeam && (
                    <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-center text-sm text-slate-500">
                      При необходимости добавьте коллег в рабочую группу. Только вы как автор можете
                      это сделать.
                    </p>
                  )}
                </div>
              </div>

              {canManageTeam && (
                <button type="button" onClick={handleSave} className="btn-success w-full py-3 sm:w-auto">
                  Зафиксировать дорожную карту
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
