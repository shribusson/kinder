"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { fetchJson } from "@/app/lib/api";
import { IconMessage, IconBrandTelegram, IconBrandWhatsapp, IconPhone, IconSearch, IconX } from "@tabler/icons-react";

interface Conversation {
  id: string;
  leadId?: string;
  channel: string;
  status: string;
  assignedToUserId?: string;
  lastMessageAt?: string;
  createdAt: string;
  metadata?: {
    chatId?: string;
    businessConnectionId?: string;
    conversationType?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  assignedTo?: {
    id: string;
    email: string;
  };
  messages?: Array<{
    id: string;
    content?: string;
    direction: string;
    createdAt: string;
    status: string;
  }>;
}

interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StatsResponse {
  total: number;
  unread: number;
  byChannel: Record<string, number>;
}

const CHANNELS = [
  { id: "all", label: "Все", icon: null },
  { id: "telegram", label: "Telegram", icon: IconBrandTelegram },
  { id: "whatsapp", label: "WhatsApp", icon: IconBrandWhatsapp },
  { id: "telephony", label: "Телефон", icon: IconPhone },
];

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "telegram":
      return <IconBrandTelegram className="w-4 h-4" />;
    case "whatsapp":
      return <IconBrandWhatsapp className="w-4 h-4" />;
    case "telephony":
      return <IconPhone className="w-4 h-4" />;
    default:
      return <IconMessage className="w-4 h-4" />;
  }
};

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState<string>("");

  // Get account ID from localStorage (set during login)
  useEffect(() => {
    const storedAccountId = localStorage.getItem("accountId");
    if (storedAccountId) {
      setAccountId(storedAccountId);
    }
  }, []);

  // Fetch conversations and stats
  useEffect(() => {
    if (!accountId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          accountId,
          ...(selectedChannel !== "all" && { channel: selectedChannel }),
          ...(search && { search }),
          ...(unreadOnly && { unreadOnly: "true" }),
        });

        const [convData, statsData] = await Promise.all([
          fetchJson<ConversationsResponse>(
            `/conversations?${params.toString()}`,
            undefined,
            { conversations: [], total: 0, page: 1, limit: 20, totalPages: 0 }
          ),
          fetchJson<StatsResponse>(
            `/conversations/stats?accountId=${accountId}`,
            undefined,
            { total: 0, unread: 0, byChannel: {} }
          ),
        ]);

        setConversations(convData.conversations);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [accountId, selectedChannel, search, unreadOnly]);

  const handleClearSearch = () => {
    setSearch("");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Входящие"
        subtitle="Все сообщения и обращения в одном месте"
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Всего разговоров
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Непрочитанные
            </p>
            <p className="mt-2 text-2xl font-bold text-brand-600">{stats.unread}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              По каналам
            </p>
            <div className="mt-2 flex gap-3 text-xs">
              {Object.entries(stats.byChannel).map(([channel, count]) => (
                <div key={channel}>
                  <p className="text-slate-600">{channel}: {count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        {/* Channel Filter */}
        <div className="flex gap-2 mb-4 pb-4 border-b border-slate-200">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedChannel === channel.id
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {channel.icon && <span className="inline mr-1">{channel.label}</span>}
              {!channel.icon && channel.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по имени, телефону, сообщению..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            {search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <IconX className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              unreadOnly
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Непрочитанные
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-slate-500">Загружаем разговоры...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-slate-500">Нет разговоров</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/crm/inbox/${conversation.id}?accountId=${accountId}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition"
              >
                {/* Channel Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  {getChannelIcon(conversation.channel)}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-900 truncate">
                      {conversation.lead?.name
                        || (conversation.metadata?.firstName
                          ? `${conversation.metadata.firstName} ${conversation.metadata.lastName || ''}`.trim()
                          : "Без контакта")}
                    </p>
                    {conversation.metadata?.conversationType === "business" && (
                      <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Business
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 truncate">
                    {conversation.messages?.[0]?.content || "Нет сообщений"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {conversation.lead?.phone || conversation.lead?.email || "—"}
                  </p>
                </div>

                {/* Time and Status */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-slate-400">
                    {conversation.lastMessageAt
                      ? new Date(conversation.lastMessageAt).toLocaleDateString("ru-RU")
                      : new Date(conversation.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                  <div className="mt-2 flex items-center gap-2 justify-end">
                    {conversation.status === "open" && (
                      <span className="inline-block w-2 h-2 rounded-full bg-brand-600"></span>
                    )}
                    <span className="text-xs font-medium text-slate-500">
                      {conversation.channel}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
