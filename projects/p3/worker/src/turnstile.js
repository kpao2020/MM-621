// The secret is supplied as a Worker secret, never in browser configuration.
export async function verifyTurnstile(request, env) {
  if (env.TURNSTILE_ENABLED === "false") return true;
  if (env.TURNSTILE_ENABLED !== "true" || !env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_HOSTNAME) return false;
  const token = request.headers.get("X-Turnstile-Token");
  if (!token || token.length > 2048) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true && result.hostname === env.TURNSTILE_HOSTNAME && result.action === "forecast_recipe";
  } catch { return false; }
  finally { clearTimeout(timeout); }
}
