import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import type { Invoice } from "@/lib/invoice-utils";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const COLLECTION = "invoices";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Invoice[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { invoices, loading, error, refetch };
}

export function useInvoiceByToken(token?: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let alive = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, COLLECTION), where("verificationToken", "==", token));
        const snap = await getDocs(q);
        if (alive) setInvoice(snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Invoice));
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Unable to verify invoice");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, [token]);

  return { invoice, loading, error };
}

export function useInvoiceActions(refetch: () => Promise<void>) {
  return useMemo(() => ({
    async create(invoice: Omit<Invoice, "id">) {
      await addDoc(collection(db, COLLECTION), {
        ...invoice,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await refetch();
    },
    async update(id: string, invoice: Omit<Invoice, "id" | "createdAt">) {
      await updateDoc(doc(db, COLLECTION, id), {
        ...invoice,
        updatedAt: serverTimestamp(),
      });
      await refetch();
    },
    async remove(id: string) {
      await deleteDoc(doc(db, COLLECTION, id));
      await refetch();
    },
  }), [refetch]);
}
