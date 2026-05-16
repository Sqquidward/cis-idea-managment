import { useState } from "react";
import type { Idea } from "../types";

const TEAM = [
  { name: "Тимошенко Д. М.", key: "taskTimoshenko", placeholder: "Укажите задачу (например, Системная аналитика и UI/UX макеты)" },
  { name: "Мухаяров В. А.", key: "taskMukhayarov", placeholder: "Укажите задачу (например, Разработка архитектуры бэкенда на FastAPI)" },
];

interface PlanScreenProps {
  projects: Idea[];
  onSave: (ideaId: number, deadline: string, tasks: Record<string, string>) => Promise<void>;
}

export function PlanScreen({ projects, onSave }: PlanScreenProps) {
  const [selectedId, setSelectedId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tasks, setTasks] = useState<Record<string, string>>({});

  const showForm = Boolean(selectedId);

  async function handleSave() {
    if (!deadline) {
      alert("Укажите плановую дату реализации!");
      return;
    }
    await onSave(Number(selectedId), deadline, tasks);
    alert("Календарный план успешно сохранен. Проект запущен в разработку и каскадно завершен!");
    setDeadline("");
    setTasks({});
    setSelectedId("");
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Дорожная карта реализации проектов</h2>
      <p className="text-sm text-gray-500 mb-6">
        Поскольку автор идеи теперь выступает и ответственным лицом, сформируйте проектную команду.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Выберите утвержденный проект для планирования:
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 rounded-lg p-3 bg-white"
          >
            <option value="">-- Выберите проект --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="border-t border-gray-100 pt-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Плановый дедлайн внедрения:</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-48 border border-gray-300 rounded-lg p-2.5 bg-gray-50"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Распределение задач рабочей группы:
              </label>
              <div className="space-y-4">
                {TEAM.map((member) => (
                  <div
                    key={member.key}
                    className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-medium text-gray-700 py-2 min-w-[150px]">{member.name}</span>
                    <input
                      type="text"
                      value={tasks[member.key] ?? ""}
                      onChange={(e) => setTasks((prev) => ({ ...prev, [member.key]: e.target.value }))}
                      placeholder={member.placeholder}
                      className="flex-1 border border-gray-300 rounded p-2 bg-white text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow transition"
            >
              Зафиксировать дорожную карту и запустить проект
            </button>
          </div>
        )}

        {projects.length === 0 && (
          <p className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            Нет доступных проектов со статусом «Реализация» для составления дорожной карты.
          </p>
        )}
      </div>
    </div>
  );
}
