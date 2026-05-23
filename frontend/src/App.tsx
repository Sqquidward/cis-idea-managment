import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatedTabContent } from "./components/AnimatedTabContent";
import { AppTabNav } from "./components/AppTabNav";
import { api, setAccessToken } from "./api/client";
import { CommitteePanel } from "./components/CommitteePanel";
import { FeedbackScreen } from "./components/FeedbackScreen";
import { IdeaSubmitScreen } from "./components/IdeaSubmitScreen";
import { IdeasFeed } from "./components/IdeasFeed";
import { LoginPage } from "./components/LoginPage";
import { MyIdeasScreen } from "./components/MyIdeasScreen";
import { UserProfileMenu } from "./components/UserProfileMenu";
import { UsersAdminScreen } from "./components/UsersAdminScreen";
import { PlanScreen } from "./components/PlanScreen";
import {
  IconCalendar,
  IconChat,
  IconFeed,
  IconLightbulb,
  IconPlus,
  IconShield,
  IconUser,
  IconUsers,
} from "./components/ui/Icons";
import { DEFAULT_AVATAR_EMOJI } from "./lib/avatars";
import type { Idea, PlanTeamMember, TabId, UserProfile, UserSession, VoteValue } from "./types";
import { canAccessTab, canVote, getDefaultTab, getRoleSubtitle, isAdmin } from "./lib/roles";

const ALL_TABS: {
  id: TabId;
  label: string;
  icon: typeof IconPlus;
}[] = [
  { id: "screen1", label: "Новая идея", icon: IconPlus },
  { id: "screen6", label: "Мои идеи", icon: IconUser },
  { id: "screen2", label: "Лента идей", icon: IconFeed },
  { id: "screen3", label: "Панель комитета", icon: IconUsers },
  { id: "screen7", label: "Пользователи", icon: IconShield },
  { id: "screen4", label: "План реализации", icon: IconCalendar },
  { id: "screen5", label: "Оставить отзыв", icon: IconChat },
];

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("screen1");
  const [tabDirection, setTabDirection] = useState<"left" | "right">("right");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const tabIndexRef = useRef(0);

  const visibleTabs = useMemo(() => {
    if (!user) return ALL_TABS;
    return ALL_TABS.filter((tab) => canAccessTab(user.role, tab.id));
  }, [user]);

  const selectTab = useCallback(
    (id: TabId) => {
      const nextIndex = visibleTabs.findIndex((t) => t.id === id);
      if (nextIndex >= 0 && nextIndex !== tabIndexRef.current) {
        setTabDirection(nextIndex > tabIndexRef.current ? "right" : "left");
        tabIndexRef.current = nextIndex;
      }
      setActiveTab(id);
    },
    [visibleTabs],
  );

  const loadIdeas = useCallback(async () => {
    const data = await api.getIdeas();
    setIdeas(data);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!canAccessTab(user.role, activeTab)) {
      const defaultTab = getDefaultTab(user.role);
      const idx = visibleTabs.findIndex((t) => t.id === defaultTab);
      tabIndexRef.current = idx >= 0 ? idx : 0;
      setActiveTab(defaultTab);
    }
  }, [user, activeTab, visibleTabs]);

  async function handleLogin(username: string, password: string) {
    const session = await api.login(username, password);
    setAccessToken(session.access_token);
    const sessionUser: UserSession = {
      userId: session.user_id,
      username: session.username,
      displayName: session.display_name,
      avatarEmoji: session.avatar_emoji || DEFAULT_AVATAR_EMOJI,
      role: session.role,
    };
    setUser(sessionUser);
    const defaultTab = getDefaultTab(session.role);
    const tabsForRole = ALL_TABS.filter((tab) => canAccessTab(session.role, tab.id));
    const idx = tabsForRole.findIndex((t) => t.id === defaultTab);
    tabIndexRef.current = idx >= 0 ? idx : 0;
    setActiveTab(defaultTab);
    await loadIdeas();
  }

  function handleProfileUpdate(profile: UserProfile) {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            displayName: profile.display_name,
            avatarEmoji: profile.avatar_emoji,
          }
        : null,
    );
  }

  function handleLogout() {
    setAccessToken(null);
    setUser(null);
    setIdeas([]);
    setActiveTab("screen1");
  }

  async function handleCreateIdea(data: { title: string; type: string; description: string }) {
    await api.createIdea(data);
    await loadIdeas();
    selectTab("screen6");
  }

  async function handleVote(ideaId: number, value: VoteValue) {
    await api.vote(ideaId, value);
    await loadIdeas();
  }

  async function handleStatusChange(ideaId: number, status: string) {
    await api.updateStatus(ideaId, status);
    await loadIdeas();
  }

  async function handleSavePlan(ideaId: number, deadline: string, team: PlanTeamMember[]) {
    await api.savePlan(ideaId, deadline, team);
    await loadIdeas();
    selectTab("screen5");
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const myIdeas = ideas.filter((i) => i.is_owner);
  const implementationProjects = ideas.filter(
    (i) => i.status === "Реализация" && (i.is_owner || isAdmin(user.role)),
  );
  const doneProjects = ideas.filter((i) => i.status === "Реализована");
  const votingCount = ideas.filter((i) => i.status === "Голосование").length;
  const userCanVote = canVote(user.role);
  const currentTabIndex = visibleTabs.findIndex((t) => t.id === activeTab);
  const currentTab = visibleTabs[currentTabIndex >= 0 ? currentTabIndex : 0];

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <IconLightbulb className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">КИС «Управление идеями»</p>
              <p className="text-xs text-slate-500">
                {getRoleSubtitle(user.role)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Идей: {ideas.length}
              </span>
              {votingCount > 0 && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                  На голосовании: {votingCount}
                </span>
              )}
            </div>
            <UserProfileMenu
              user={user}
              myIdeasCount={myIdeas.length}
              ideasCount={ideas.length}
              votingCount={votingCount}
              onNavigate={selectTab}
              onProfileUpdate={handleProfileUpdate}
              onLogout={handleLogout}
            />
          </div>
        </div>

        <nav className="mx-auto max-w-6xl border-t border-slate-100 px-2 pb-2 pt-1 sm:px-4">
          <div className="rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/60">
            <AppTabNav tabs={visibleTabs} activeId={activeTab} onChange={selectTab} />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div
          key={activeTab}
          className="mb-6 animate-slide-up rounded-xl border border-indigo-100 bg-white px-5 py-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Раздел {currentTabIndex + 1} из {visibleTabs.length}
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{currentTab.label}</h1>
        </div>

        <AnimatedTabContent tabKey={activeTab} direction={tabDirection}>
          {activeTab === "screen1" && <IdeaSubmitScreen onSubmit={handleCreateIdea} />}
          {activeTab === "screen6" && (
            <MyIdeasScreen
              ideas={myIdeas}
              onGoToFeed={() => selectTab("screen2")}
              onGoToPlan={() => selectTab("screen4")}
              onGoToFeedback={() => selectTab("screen5")}
            />
          )}
          {activeTab === "screen2" && (
            <IdeasFeed ideas={ideas} onVote={handleVote} canVote={userCanVote} />
          )}
          {activeTab === "screen3" && (
            <CommitteePanel ideas={ideas} onStatusChange={handleStatusChange} />
          )}
          {activeTab === "screen7" && <UsersAdminScreen />}
          {activeTab === "screen4" && (
            <PlanScreen
              projects={implementationProjects}
              currentUser={user}
              onSave={handleSavePlan}
            />
          )}
          {activeTab === "screen5" && (
            <FeedbackScreen projects={doneProjects} currentUserId={user.userId} />
          )}
        </AnimatedTabContent>
      </main>
    </div>
  );
}
