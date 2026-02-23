import { NextResponse } from "next/server";
import { apiBaseUrl } from "@/app/lib/api";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const accept = request.headers.get("accept") || "";
  const isFormPayload =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");
  const prefersHtmlResponse = accept.includes("text/html");
  let payload: Record<string, unknown>;

  try {
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else if (isFormPayload) {
      const formData = await request.formData();
      payload = Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [key, String(value)])
      );
    } else {
      payload = await request.json();
    }
  } catch {
    if (isFormPayload || prefersHtmlResponse) {
      return NextResponse.redirect(new URL("/contacts?lead=error", request.url), 303);
    }

    return NextResponse.json({ received: false, error: "Invalid request payload" }, { status: 400 });
  }

  const response = await fetch(`${apiBaseUrl}/crm/integrations/website/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();
  let responseData: unknown = { received: response.ok };

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { received: response.ok, message: responseText };
    }
  }

  if (isFormPayload || prefersHtmlResponse) {
    const referer = request.headers.get("referer");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const forwardedHost =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    const fallbackOrigin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : new URL(request.url).origin;
    const fallbackUrl = new URL("/contacts", fallbackOrigin);
    const redirectUrl = referer ? new URL(referer) : fallbackUrl;

    if (redirectUrl.origin !== fallbackUrl.origin) {
      redirectUrl.href = fallbackUrl.href;
    }

    redirectUrl.searchParams.set("lead", response.ok ? "success" : "error");
    if (redirectUrl.pathname === "/") {
      redirectUrl.hash = "contact";
    }

    return NextResponse.redirect(redirectUrl, 303);
  }

  return NextResponse.json(responseData, { status: response.status });
}
