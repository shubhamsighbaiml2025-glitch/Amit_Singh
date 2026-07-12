import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  engineImageUrl?: string;
  profileImageUrl?: string;
  aboutText: string;
  servicesList: { title: string; description: string }[];
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  createdAt: Timestamp;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: Timestamp;
}

export interface Review {
  id: string;
  name: string;
  email?: string;
  rating: number;
  description: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export const DEFAULT_CONTENT: SiteContent = {
  heroTitle: "Precision Engineering. Unyielding Power.",
  heroSubtitle: "Expert service and repair for heavy earth-moving machinery, diesel engines, and complex electrical systems. We keep your fleet moving.",
  heroImageUrl: "/assets/hero.jpg",
  engineImageUrl: "/assets/services.jpg",
  profileImageUrl: "/assets/amit-singh.jpg",
  aboutText: "With over a decade of hands-on experience in the heavy machinery sector, Amit Singh has built a reputation for uncompromising quality and technical excellence. Specializing in Volvo, CAT, Komatsu, and JCB equipment, Singh Automobiles Engine Engineering brings industrial-grade precision to every repair. We understand that downtime costs money, which is why we deliver fast, reliable, and durable solutions for alternators, wiring harnesses, hydraulic pumps, and diesel engines.",
  servicesList: [
    { title: "Heavy Machinery Electrical Systems", description: "Complete diagnostics and repair for Alternators, Self Starters, Wiring Harnesses, Controllers, Displays, ECUs, and VCUs." },
    { title: "Diesel Engine Servicing", description: "Comprehensive diesel engine overhauls, maintenance, and repair for all major brands of heavy earth-moving machinery." },
    { title: "Hydraulic Systems", description: "Expert service for Hydraulic Pumps, Control Valves, and complex fluid power systems to ensure maximum operational efficiency." },
    { title: "Multi-Brand Expertise", description: "Authorized-level knowledge across Volvo, Hyundai, CAT, L&T, Komatsu, Sany, JCB, Tata Hitachi, Kobelco, and more." }
  ]
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timeoutId: ReturnType<typeof setTimeout>;

  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => resolve(null), ms);
    }),
  ]).finally(() => clearTimeout(timeoutId));
}

export function useSiteContent() {
  const [data, setData] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const docSnap = await withTimeout(getDoc(doc(db, 'content', 'site')), 2500);

      if (docSnap?.exists()) {
        setData({ ...DEFAULT_CONTENT, ...(docSnap.data() as Partial<SiteContent>) });
      }
    } catch {
      // Firebase not configured yet - keep default content.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { content: data, loading, refetch: fetch };
}

export function useGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setImages(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as GalleryImage[]);
    } catch {
      // Firebase not configured - keep empty list.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { images, loading, refetch: fetch };
}

export function useEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'enquiries'), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setEnquiries(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Enquiry[]);
    } catch {
      // Firebase not configured - keep empty list.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { enquiries, loading, refetch: fetch };
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setReviews(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Review[]);
    } catch {
      // Firebase not configured - keep empty list.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { reviews, loading, refetch: fetch };
}

export { addDoc, collection, serverTimestamp };
