import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout: if onAuthStateChanged never fires (e.g. Firebase not configured),
    // unblock loading after 4 seconds so the rest of the app renders.
    const fallback = setTimeout(() => setLoading(false), 4000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(fallback);
        setUser(user);
        setLoading(false);
      },
      () => {
        // Auth error (bad config) — treat as unauthenticated
        clearTimeout(fallback);
        setUser(null);
        setLoading(false);
      }
    );

    return () => { unsubscribe(); clearTimeout(fallback); };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
