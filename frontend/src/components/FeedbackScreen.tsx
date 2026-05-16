import { useState } from "react";
import type { Idea } from "../types";

interface FeedbackScreenProps {
  projects: Idea[];
  onSubmit: (ideaId: number, rating: number, text: string) => Promise<void>;
}

export function FeedbackScreen({ projects, onSubmit }: FeedbackScreenProps) {
  const [selectedId, setSelectedId] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  async function handleSubmit() {
    if (!selectedId) {
      alert("Выберите проект для оценки!");
      return;
    }
    if (rating === 0) {
      alert("Поставьте оценку в звездах!");
      return;
    }
    if (!text.trim()) {
      alert("Напишите текст отзыва!");
      return;
    }
    await onSubmit(Number(selectedId), rating, text.trim());
    setText("");
    setRating(0);
    setSelectedId("");
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-blue-600 p-5 text-white">
        <h3 className="text-lg font-bold">Модуль сбора отзывов (Feedback)</h3>
      </div>
      <div className="p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Выберите завершенный проект для оценки:
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 bg-white mb-6"
        >
          <option value="">-- Выберите проект --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <div className="mb-6 text-center">
          <label className="block text-sm font-semibold text-gray-700 mb-3 text-left">
            Оценка удовлетворенности результатом:
          </label>
          <div className="flex justify-center gap-2 text-3xl text-gray-300">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`cursor-pointer transition hover:text-yellow-400 ${
                  star <= rating ? "text-yellow-400" : ""
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Текст отзыва:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишите ваше мнение об эффектах от внедрения инновации..."
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 shadow transition"
        >
          Сохранить отзыв в базу данных
        </button>
      </div>
    </div>
  );
}
