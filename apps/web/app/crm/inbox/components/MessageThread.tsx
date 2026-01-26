"use client";

import { IconCheck, IconChecks } from "@tabler/icons-react";

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

interface MessageThreadProps {
  messages: Message[];
}

function getStatusIcon(status: string) {
  switch (status) {
    case "sent":
      return <IconCheck className="w-4 h-4" />;
    case "delivered":
      return <IconChecks className="w-4 h-4" />;
    case "read":
      return <IconChecks className="w-4 h-4 text-blue-600" />;
    default:
      return null;
  }
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageThread({ messages }: MessageThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Нет сообщений в этом разговоре</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.direction === "outbound" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
              message.direction === "outbound"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-900 border border-slate-200"
            }`}
          >
            {/* Message Content */}
            {message.content && (
              <p className="text-sm break-words whitespace-pre-wrap">
                {message.content}
              </p>
            )}

            {/* Media File */}
            {message.mediaFile && (
              <div className="mt-2">
                {message.mediaFile.mimeType?.startsWith("image/") ? (
                  <img
                    src={message.mediaFile.url}
                    alt="Attached media"
                    className="max-w-full rounded"
                  />
                ) : message.mediaFile.mimeType?.startsWith("video/") ? (
                  <video
                    src={message.mediaFile.url}
                    controls
                    className="max-w-full rounded"
                  />
                ) : (
                  <a
                    href={message.mediaFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm underline ${
                      message.direction === "outbound"
                        ? "text-blue-100"
                        : "text-blue-600"
                    }`}
                  >
                    Загрузить файл
                  </a>
                )}
              </div>
            )}

            {/* Message Footer */}
            <div
              className={`flex items-center gap-1 mt-1 text-xs ${
                message.direction === "outbound"
                  ? "text-blue-100"
                  : "text-slate-500"
              }`}
            >
              <span>{formatTime(message.createdAt)}</span>
              {message.direction === "outbound" && (
                <span>{getStatusIcon(message.status)}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
