"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconHome } from "@tabler/icons-react";

export default function CrmError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("CRM Error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <IconAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-900 mb-2">
          Что-то пошло не так
        </h1>

        <p className="text-center text-slate-600 mb-6">
          Произошла ошибка при загрузке страницы CRM. Пожалуйста, попробуйте снова.
        </p>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-mono text-red-800 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition"
          >
            Попробовать снова
          </button>
          <Link
            href="/crm"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
          >
            <IconHome className="w-4 h-4" />
            На главную
          </Link>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Если проблема сохраняется, обратитесь в поддержку
        </p>
      </div>
    </div>
  );
}
