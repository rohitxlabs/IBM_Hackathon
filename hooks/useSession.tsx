"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout as logoutRequest } from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

/**
 * Client-side session state.
 *
 * The session itself lives in an httpOnly cookie the browser manages, so this
 * hook never holds a token. It asks the backend who the user is once per app
 * load and caches the answer in React state. `status` separates "still
 * checking" from "definitely signed out", which is what lets screens show a
 * loading state instead of flashing the signed-out UI.
 */

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  user: User | null;
  status: SessionStatus;
  /** Set when the check failed for a reason other than being signed out. */
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [status, setStatus] = useState<SessionStatus>(
    initialUser ? "authenticated" : "loading",
  );
  const [error, setError] = useState<string | null>(null);

  /** Asks the backend who the caller is and folds the answer into state. */
  const load = useCallback(async (isCurrent: () => boolean) => {
    try {
      const current = await getCurrentUser();
      if (!isCurrent()) return;
      setUser(current);
      setStatus("authenticated");
      setError(null);
    } catch (err) {
      if (!isCurrent()) return;
      setUser(null);
      setStatus("unauthenticated");

      // A 401 is the normal "not signed in" answer, not a failure worth
      // showing. Anything else is a real problem the user should hear about.
      if (err instanceof ApiRequestError && err.status !== 401) {
        setError(err.message);
      } else {
        setError(null);
      }
    }
  }, []);

  const refresh = useCallback(() => load(() => true), [load]);

  useEffect(() => {
    let active = true;
    // Reading the session is a subscription to an external system (the
    // backend's cookie), which is what effects are for. The lint rule cannot
    // tell that apart from derived state, so it is silenced here only.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(() => active);
    return () => {
      active = false;
    };
  }, [load]);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Clearing the cookie may fail; the user still leaves the app.
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, status, error, refresh, signOut }),
    [user, status, error, refresh, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside a SessionProvider");
  }

  return context;
}
