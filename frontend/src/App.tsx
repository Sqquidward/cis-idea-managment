import { useCallback, useState } from "react";
import { api, setAccessToken } from "./api/client";
import { CommitteePanel } from "./components/CommitteePanel";
import { FeedbackScreen } from "./components/FeedbackScreen";
import { IdeaSubmitScreen } from "./components/IdeaSubmitScreen";
import { IdeasFeed } from "./components/IdeasFeed";
import { LoginPage } from "./components/LoginPage";
import { PlanScreen } from "./components/PlanScreen";
import type { Idea, TabId, UserSession } from "./types";

const TABS: { id: TabId; label: string }[] = [
  { id: "screen1", label: "1. Подача идеи" },
  { id: "screen2", label: "2. Лента и голосование" },
  { id: "screen3", label: "3. Панель Комитета" },
  { id: "screen4", label: "4. Календарный план" },
  { id: "screen5", label: "5. Обратная связь" },
];

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("screen1");
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const loadIdeas = useCallback(async () => {
    const data = await api.getIdeas();
    setIdeas(data);
  }, []);

  async function handleLogin(username: string, password: string) {
    const session = await api.login(username, password);
    setAccessToken(session.access_token);
    setUser({
      username: session.username,
      displayName: session.display_name,
      role: session.role,
    });
    await loadIdeas();
  }

  async function handleCreateIdea(data: { title: string; type: string; description: string }) {
    await api.createIdea(data);
    await loadIdeas();
    setActiveTab("screen2");
  }

  async function handleVote(ideaId: number, delta: 1 | -1) {
    await api.vote(ideaId, delta);
    await loadIdeas();
  }

  async function handleStatusChange(ideaId: number, status: string) {
    await api.updateStatus(ideaId, status);
    await loadIdeas();
  }

  async function handleSavePlan(ideaId: number, deadline: string, tasks: Record<string, string>) {
    await api.savePlan(ideaId, deadline, tasks);
    await loadIdeas();
    setActiveTab("screen5");
  }

  async function handleFeedback(ideaId: number, rating: number, text: string) {
    const res = await api.submitFeedback(ideaId, rating, text);
    alert(res.message);
    await loadIdeas();
    setActiveTab("screen2");
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const implementationProjects = ideas.filter((i) => i.status === "Реализация");
  const doneProjects = ideas.filter((i) => i.status === "Реализована");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-2xl">💡</div>
          <h1 className="text-xl font-bold text-slate-800">КИС Управление идеями</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            {user.displayName}
            <span className="text-gray-400 ml-1">({user.role})</span>
          </span>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            AD
          </div>
        </div>
      </header>

      <nav className="p-3 flex flex-wrap justify-center gap-2 bg-slate-800 text-white shadow-inner text-sm">
        <span className="py-2 font-bold text-yellow-400 mr-2">Панель навигации по КИС:</span>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 font-medium rounded transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto mt-8 p-4 mb-12">
        {activeTab === "screen1" && <IdeaSubmitScreen onSubmit={handleCreateIdea} />}
        {activeTab === "screen2" && <IdeasFeed ideas={ideas} onVote={handleVote} />}
        {activeTab === "screen3" && (
          <CommitteePanel ideas={ideas} onStatusChange={handleStatusChange} />
        )}
        {activeTab === "screen4" && (
          <PlanScreen projects={implementationProjects} onSave={handleSavePlan} />
        )}
        {activeTab === "screen5" && (
          <FeedbackScreen projects={doneProjects} onSubmit={handleFeedback} />
        )}
      </main>
    </div>
  );
}
