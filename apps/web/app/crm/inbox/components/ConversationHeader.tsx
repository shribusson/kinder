"use client";

import { useState } from "react";
import { IconBrandTelegram, IconBrandWhatsapp, IconPhone, IconMessage, IconUserPlus } from "@tabler/icons-react";
import { fetchJson } from "@/app/lib/api";

interface ConversationHeaderProps {
  conversation: {
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
  };
  accountId: string;
}

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "telegram":
      return <IconBrandTelegram className="w-5 h-5 text-orange-500" />;
    case "whatsapp":
      return <IconBrandWhatsapp className="w-5 h-5 text-green-500" />;
    case "telephony":
      return <IconPhone className="w-5 h-5 text-purple-500" />;
    default:
      return <IconMessage className="w-5 h-5 text-slate-500" />;
  }
};

const getChannelLabel = (channel: string): string => {
  const labels: Record<string, string> = {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    telephony: "Телефон",
    website: "Веб-сайт",
    email: "Email",
    instagram: "Instagram",
    facebook: "Facebook",
    vk: "ВКонтакте",
  };
  return labels[channel] || channel;
};

export default function ConversationHeader({
  conversation,
  accountId,
}: ConversationHeaderProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  const handleAssign = async () => {
    // TODO: Implement assignment UI with user list
    setIsAssigning(true);
    setAssignmentError("");

    try {
      // This would be replaced with actual assignment logic
      // const response = await fetchJson(
      //   `/conversations/${conversation.id}/assign`,
      //   {
      //     method: "PATCH",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ accountId, userId: selectedUserId }),
      //   },
      //   null
      // );
    } catch (err) {
      setAssignmentError("Ошибка при назначении");
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-6">
        {/* Contact Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
              {getChannelIcon(conversation.channel)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {conversation.lead?.name || "Без контакта"}
              </h2>
              <p className="text-sm text-slate-500">
                {getChannelLabel(conversation.channel)}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          {conversation.lead && (
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              {conversation.lead.phone && (
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    Телефон
                  </p>
                  <p className="text-slate-900 mt-1">{conversation.lead.phone}</p>
                </div>
              )}
              {conversation.lead.email && (
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-slate-900 mt-1 truncate">
                    {conversation.lead.email}
                  </p>
                </div>
              )}
              {conversation.lead.source && (
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    Источник
                  </p>
                  <p className="text-slate-900 mt-1">{conversation.lead.source}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  Статус
                </p>
                <p className="text-slate-900 mt-1 capitalize">
                  {conversation.status === "open" ? "Открыт" : "Закрыт"}
                </p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="mt-4 text-xs text-slate-500">
            <p>Создан: {formatDate(conversation.createdAt)}</p>
          </div>
        </div>

        {/* Assignment */}
        <div className="w-64 p-4 bg-slate-50 rounded-lg">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Назначение
          </p>

          {conversation.assignedTo ? (
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-600"></div>
              <span className="text-sm font-medium text-slate-900">
                {conversation.assignedTo.email}
              </span>
            </div>
          ) : (
            <button
              onClick={handleAssign}
              disabled={isAssigning}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <IconUserPlus className="w-4 h-4" />
              Назначить
            </button>
          )}

          {assignmentError && (
            <p className="mt-2 text-xs text-red-600">{assignmentError}</p>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Назначьте этот разговор менеджеру для быстрого ответа
          </p>
        </div>
      </div>
    </div>
  );
}
