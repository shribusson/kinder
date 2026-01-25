"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SearchFormProps {
  placeholder: string;
}

export default function SearchForm({ placeholder }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  return (
    <form
      className="flex flex-1 items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }
        router.push(`/crm/leads?${params.toString()}`);
      }}
    >
      <input
        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        type="submit"
        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Найти
      </button>
    </form>
  );
}
