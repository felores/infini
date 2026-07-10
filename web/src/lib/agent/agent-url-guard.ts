const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function normalizeLoopbackUrl(value: string): string | null {
    const trimmed = value.trim().replace(/\/+$/, "");
    if (!trimmed) return null;
    let parsed: URL;
    try {
        parsed = new URL(trimmed);
    } catch {
        return null;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!LOOPBACK_HOSTS.has(parsed.hostname.toLowerCase())) return null;
    return parsed.origin;
}
