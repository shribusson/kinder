"use client";

import { useState } from "react";
import { IconSend, IconPaperclip, IconX } from "@tabler/icons-react";
import { fetchJson } from "@/app/lib/api";

interface Message {
  id: string;
  content?: string;
  direction: "inbound" | "outbound";
  status: string;
  createdAt: string;
}

interface MessageInputProps {
  conversationId: string;
  accountId: string;
  onMessageSent: (message: Message) => void;
}

export default function MessageInput({
  conversationId,
  accountId,
  onMessageSent,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !attachedFile) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO: Implement media upload if attachedFile exists
      const response = await fetchJson<Message>(
        `/conversations/${conversationId}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId,
            text: content.trim(),
            // mediaFileId would go here after upload
          }),
        },
        undefined
      );

      if (!response) {
        setError("Не удалось отправить сообщение");
        return;
      }

      onMessageSent(response);
      setContent("");
      setAttachedFile(null);
    } catch (err) {
      setError("Ошибка при отправке сообщения");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {attachedFile && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <IconPaperclip className="w-4 h-4 text-orange-600" />
          <span className="flex-1 text-sm text-orange-900">{attachedFile.name}</span>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="text-orange-600 hover:text-orange-700"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Введите сообщение..."
            rows={3}
            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            title="Прикрепить файл"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition text-slate-600"
          >
            <IconPaperclip className="w-5 h-5" />
            <input
              type="file"
              onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
              disabled={isLoading}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading || (!content.trim() && !attachedFile)}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white transition"
            title="Отправить (Shift+Enter)"
          >
            <IconSend className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Нажмите Shift+Enter для переноса строки
      </p>
    </form>
  );
}
