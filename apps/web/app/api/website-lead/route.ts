import { NextResponse } from "next/server";
import { apiBaseUrl } from "@/app/lib/api";

export async function POST(request: Request) {
  const payload = await request.json();
  const response = await fetch(`${apiBaseUrl}/crm/integrations/website/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return NextResponse.json(await response.json(), { status: response.status });
}
