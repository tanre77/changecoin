export type CrashRecord = {
  id: string;
  message: string;
  stack: string;
  fatal: boolean;
  at: string;
};

const KEY = "cc-crashes";

export function firebaseConfigured() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID,
  );
}

export function readCrashes(): CrashRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]") as CrashRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordCrash(error: unknown, fatal = false): CrashRecord {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? (error.stack ?? "") : "";
  const row: CrashRecord = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    message: message.slice(0, 500),
    stack: stack.slice(0, 2000),
    fatal,
    at: new Date().toISOString(),
  };
  try {
    if (typeof window !== "undefined") {
      const next = [row, ...readCrashes()].slice(0, 20);
      localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("cc-crash"));
    }
  } catch {
    // Storage can be blocked. The call still returns the record.
  }
  void forwardAnalytics(row);
  return row;
}

async function forwardAnalytics(row: CrashRecord) {
  if (!firebaseConfigured() || typeof window === "undefined") return;
  try {
    const { getApps, initializeApp } = await import("firebase/app");
    const { getAnalytics, isSupported, logEvent } = await import("firebase/analytics");
    const app =
      getApps()[0] ??
      initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
      });
    if (!(await isSupported())) return;
    logEvent(getAnalytics(app), "exception", {
      description: row.message.slice(0, 100),
      fatal: row.fatal,
    });
  } catch {
    // Firebase is optional until store config is injected.
  }
}

let installed = false;

export function installCrashHandlers() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (event) => {
    recordCrash(event.error ?? event.message, true);
  });
  window.addEventListener("unhandledrejection", (event) => {
    recordCrash(event.reason ?? "Unhandled rejection", true);
  });
}
