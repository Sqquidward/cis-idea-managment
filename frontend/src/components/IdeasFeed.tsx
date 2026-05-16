import type { Idea } from "../types";

function statusBadgeClass(status: string): string {
  switch (status) {
    case "Реализация":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Реализована":
      return "bg-green-100 text-green-800 border-green-200";
    case "Архив":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
}

interface IdeasFeedProps {
  ideas: Idea[];
  onVote: (ideaId: number, delta: 1 | -1) => Promise<void>;
}

export function IdeasFeed({ ideas, onVote }: IdeasFeedProps) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Лента корпоративных предложений</h2>
      <div className="space-y-6">
        {ideas.map((idea) => {
          const voted = idea.voted;
          const btnClass = voted
            ? "flex-1 bg-gray-100 text-gray-400 font-semibold py-2.5 rounded-lg cursor-not-allowed text-sm text-center"
            : "flex-1 bg-blue-50 text-blue-600 font-semibold py-2.5 rounded-lg hover:bg-blue-100 text-sm text-center transition";

          return (
            <article
              key={idea.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{idea.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Автор: <span className="font-medium text-gray-600">{idea.author}</span> • Категория:{" "}
                    {idea.type}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 border rounded-full text-xs font-bold ${statusBadgeClass(idea.status)}`}
                  >
                    {idea.status}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-full">
                    Рейтинг: {idea.rating >= 0 ? `+${idea.rating}` : idea.rating}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{idea.description}</p>
              {idea.status === "Голосование" && (
                <>
                  <div className="pt-4 border-t border-gray-100 flex gap-4">
                    <button
                      type="button"
                      disabled={voted}
                      onClick={() => !voted && onVote(idea.id, 1)}
                      className={btnClass}
                    >
                      👍 За (+1)
                    </button>
                    <button
                      type="button"
                      disabled={voted}
                      onClick={() => !voted && onVote(idea.id, -1)}
                      className={btnClass}
                    >
                      👎 Против (-1)
                    </button>
                  </div>
                  {voted && (
                    <p className="text-xs text-blue-600 italic mt-2">
                      Ваш голос зафиксирован в PostgreSQL через API.
                    </p>
                  )}
                </>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
