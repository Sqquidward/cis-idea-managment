import { FormEvent, useState } from "react";

const IDEA_TYPES = ["Технологическая", "Организационная", "Бережливое производство"];

interface IdeaSubmitScreenProps {
  onSubmit: (data: { title: string; type: string; description: string }) => Promise<void>;
}

export function IdeaSubmitScreen({ onSubmit }: IdeaSubmitScreenProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState(IDEA_TYPES[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), type, description: description.trim() });
      setTitle("");
      setDescription("");
      alert("Идея зафиксирована в системе и отправлена в общую ленту!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Новая инициатива</h2>
      <p className="text-sm text-gray-500 mb-6">
        Заполните форму для отправки предложения на этап сбора голосов.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название идеи</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Автоматизация сбора заявок в IT"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип идеи</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              {IDEA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Подробное описание</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите текущую проблему и предложенное вами инженерное/организационное решение..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 bg-gray-50 h-32"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 shadow transition duration-200 disabled:opacity-60"
        >
          Опубликовать и запустить голосование
        </button>
      </form>
    </div>
  );
}
