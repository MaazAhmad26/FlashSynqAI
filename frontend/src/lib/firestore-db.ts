import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { MockDB } from "./mock-db";

const TIMEOUT_MS = 4000; // 4 seconds timeout for Firestore operations

async function runWithTimeout<T>(promise: Promise<T>): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("FIRESTORE_TIMEOUT"));
    }, TIMEOUT_MS);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

// A smart, resilient database class that wraps Firestore with a seamless Local Storage fallback.
// This prevents the application from hanging if firestore.googleapis.com is blocked by adblockers,
// Brave Shields, or privacy extensions (net::ERR_BLOCKED_BY_CLIENT).
//
// STRATEGY: Always write to LocalStorage as the guaranteed source of truth.
// Additionally attempt to write to Firestore for cloud persistence.
// On reads, merge both sources and deduplicate by ID.
export class FirestoreDB {

  static async add(collectionName: string, data: any): Promise<string> {
    // Always save to LocalStorage first — guaranteed to succeed
    const localId = await MockDB.add(collectionName, data);

    // Then try Firestore in the background (best-effort)
    try {
      const ref = await runWithTimeout(
        addDoc(collection(db, collectionName), {
          ...data,
          _localId: localId, // track the local ID for dedup
          createdAt: data.createdAt || new Date().toISOString(),
        })
      );
      // Update local record with the Firestore ID for future dedup
      MockDB.update(collectionName, localId, { _firestoreId: ref.id });
      return localId;
    } catch (error) {
      console.warn(
        `[FirestoreDB] Firestore 'add' failed for '${collectionName}'. Data is safely stored locally.`,
        error
      );
      return localId;
    }
  }

  static async get(collectionName: string, id: string): Promise<any | null> {
    // Check local first
    const localResult = await MockDB.get(collectionName, id);
    if (localResult) return localResult;

    // Fallback to Firestore
    try {
      const ref = doc(db, collectionName, id);
      const snap = await runWithTimeout(getDoc(ref));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
      console.warn(`[FirestoreDB] Firestore 'get' failed.`, error);
      return null;
    }
  }

  static async list(
    collectionName: string,
    filter?: { field: string; value: any }
  ): Promise<any[]> {
    // Always get local data (guaranteed source of truth)
    const localDocs = await MockDB.list(collectionName, filter);

    // Try to also get Firestore data
    let firebaseDocs: any[] = [];
    try {
      let q;
      if (filter) {
        q = query(
          collection(db, collectionName),
          where(filter.field, "==", filter.value)
        );
      } else {
        q = collection(db, collectionName);
      }
      const snap = await runWithTimeout(getDocs(q));
      firebaseDocs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, any>) }));
    } catch (error) {
      console.warn(
        `[FirestoreDB] Firestore 'list' failed for '${collectionName}'. Using local data only.`,
        error
      );
    }

    // Merge and deduplicate: local data takes priority
    const allDocs = [...localDocs, ...firebaseDocs];
    return Array.from(new Map(allDocs.map(item => [item.id, item])).values());
  }

  static async delete(collectionName: string, id: string): Promise<void> {
    // Always delete locally
    await MockDB.delete(collectionName, id);

    // Try Firestore too
    try {
      await runWithTimeout(deleteDoc(doc(db, collectionName, id)));
    } catch (error) {
      console.warn(`[FirestoreDB] Firestore 'delete' failed.`, error);
    }
  }

  static async update(
    collectionName: string,
    id: string,
    data: any
  ): Promise<void> {
    // Always update locally
    await MockDB.update(collectionName, id, data);

    // Try Firestore too
    try {
      await runWithTimeout(updateDoc(doc(db, collectionName, id), data));
    } catch (error) {
      console.warn(`[FirestoreDB] Firestore 'update' failed.`, error);
    }
  }
}
