import { FormEvent, useState } from "react";
import { PageHeader } from "./ui/PageHeader";

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
    <section>
      <PageHeader
        title="Новая инициатива"
        description="Заполните форму, чтобы отправить предложение на этап сбора голосов коллег."
        badge="Шаг 1"
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="idea-title" className="label-field">
                Название идеи
              </label>
              <input
                id="idea-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Автоматизация сбора заявок в IT"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="idea-type" className="label-field">
                Тип идеи
              </label>
              <select
                id="idea-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-field"
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
            <label htmlFor="idea-description" className="label-field">
              Подробное описание
            </label>
            <textarea
              id="idea-description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите текущую проблему и предложенное инженерное или организационное решение…"
              className="input-field min-h-[140px] resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Публикация…" : "Опубликовать и запустить голосование"}
            </button>
            <p className="text-xs text-slate-400">После публикации идея появится в общей ленте</p>
          </div>
        </form>
      </div>
    </section>
  );
}
