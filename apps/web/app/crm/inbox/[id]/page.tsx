"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { fetchJson } from "@/app/lib/api";
import MessageThread from "../components/MessageThread";
import MessageInput from "../components/MessageInput";
import ConversationHeader from "../components/ConversationHeader";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

interface Message {
  id: string;
  content?: string;
  direction: "inbound" | "outbound";
  status: string;
  createdAt: string;
  mediaFile?: {
    id: string;
    url: string;
    mimeType?: string;
  };
}

interface Conversation {
  id: string;
  channel: string;
  status: string;
  createdAt: string;
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    source?: string;
  };
  assignedTo?: {
    id: string;
    email: string;
  };
  messages: Message[];
}

export default function ConversationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const conversationId = params.id as string;
  const accountId = searchParams.get("accountId") || "";

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation
  useEffect(() => {
    if (!accountId || !conversationId) return;

    const fetchConversation = async () => {
      setLoading(true);
      try {
        const data = await fetchJson<Conversation>(
          `/conversations/${conversationId}?accountId=${accountId}`,
          undefined,
          undefined
        );

        if (!data) {
          setError("Разговор не найден");
          return;
        }

        setConversation(data);

        // Mark as read
        try {
          await fetchJson(
            `/conversations/${conversationId}/read`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accountId }),
            },
            undefined
          );
        } catch (err) {
          console.error("Failed to mark as read:", err);
        }
      } catch (err) {
        setError("Ошибка при загрузке разговора");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, accountId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleMessageSent = (newMessage: Message) => {
    if (conversation) {
      setConversation({
        ...conversation,
        messages: [...conversation.messages, newMessage],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Загружаем разговор...</p>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/crm/inbox" className="flex items-center gap-2 text-brand-600 hover:text-brand-700">
          <IconArrowLeft className="w-4 h-4" />
          Вернуться в входящие
        </Link>
        <div className="card p-8 text-center">
          <p className="text-red-600">{error || "Разговор не найден"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
        <Link href="/crm/inbox" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <IconArrowLeft className="w-4 h-4" />
          Входящие
        </Link>
      </div>

      {/* Conversation Header */}
      <ConversationHeader conversation={conversation} accountId={accountId} />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto card p-6 bg-slate-50">
        <MessageThread messages={conversation.messages} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="card p-6">
        <MessageInput
          conversationId={conversationId}
          accountId={accountId}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
}
