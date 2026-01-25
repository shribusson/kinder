import { apiBaseUrl } from "@/app/lib/api";

interface ExportLinkProps {
  path: string;
  label: string;
}

export default function ExportLink({ path, label }: ExportLinkProps) {
  return (
    <a
      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
      href={`${apiBaseUrl}${path}`}
    >
      {label}
    </a>
  );
}
