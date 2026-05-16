import type { Idea } from "../types";

interface CommitteePanelProps {
  ideas: Idea[];
  onStatusChange: (ideaId: number, status: string) => Promise<void>;
}

export function CommitteePanel({ ideas, onStatusChange }: CommitteePanelProps) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Панель модерации Комитета</h2>
      <p className="text-sm text-gray-500 mb-6">
        Рассмотрение идей экспертной группой, утверждение проектов в реализацию или вынос в архив.
      </p>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase border-b border-gray-200 font-semibold">
              <th className="p-4">ID</th>
              <th className="p-4">Название идеи</th>
              <th className="p-4">Автор</th>
              <th className="p-4">Рейтинг</th>
              <th className="p-4">Статус</th>
              <th className="p-4 text-center">Решение экспертов</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-100">
            {ideas.map((idea) => (
              <tr key={idea.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-mono font-bold text-gray-400">#{idea.id}</td>
                <td className="p-4 font-medium text-gray-900">{idea.title}</td>
                <td className="p-4 text-gray-500">{idea.author}</td>
                <td className="p-4">
                  <span className={idea.rating >= 0 ? "text-green-600" : "text-red-500"}>
                    {idea.rating >= 0 ? `+${idea.rating}` : idea.rating}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-gray-50">
                    {idea.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {idea.status === "Голосование" ? (
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onStatusChange(idea.id, "Реализация")}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 transition"
                      >
                        Утвердить
                      </button>
                      <button
                        type="button"
                        onClick={() => onStatusChange(idea.id, "Архив")}
                        className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-600 transition"
                      >
                        В архив
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Решение вынесено</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
