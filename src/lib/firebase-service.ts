import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    getDoc
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "./firebase";
import { PromptItem, AppSettings } from "./types";

const COLLECTION_NAME = "prompts";

// Helper to get the correct document path based on syncId or anonymous UID
const getUserDocRef = (userId: string, syncId?: string) => {
    if (!db) return null;
    if (syncId && syncId.trim()) {
        return doc(db, "sync_groups", syncId.trim());
    }
    return doc(db, "users", userId);
};

export const FirebaseService = {
    // Auth
    async signIn() {
        if (!auth?.currentUser && auth) {
            await signInAnonymously(auth);
        }
        return auth?.currentUser;
    },

    // Prompts
    subscribeToPrompts(callback: (items: PromptItem[]) => void, syncId?: string) {
        const userId = auth?.currentUser?.uid;
        if (!userId || !db) return () => { };

        const userDocRef = getUserDocRef(userId, syncId);
        if (!userDocRef) return () => { };

        const q = query(
            collection(userDocRef, COLLECTION_NAME),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as PromptItem));
            callback(items);
        });
    },

    async savePrompt(item: PromptItem, syncId?: string) {
        const userId = auth?.currentUser?.uid;
        if (!userId || !db) throw new Error("User not authenticated or Firebase not configured");

        const userDocRef = getUserDocRef(userId, syncId);
        if (!userDocRef) throw new Error("Could not determine storage path");

        const userPromptsRef = collection(userDocRef, COLLECTION_NAME);

        if (item.id) {
            const docRef = doc(userDocRef, COLLECTION_NAME, item.id);
            await setDoc(docRef, item, { merge: true });
            return item.id;
        } else {
            const docRef = await addDoc(userPromptsRef, {
                ...item,
                createdAt: Date.now()
            });
            return docRef.id;
        }
    },

    async deletePrompt(id: string, syncId?: string) {
        const userId = auth?.currentUser?.uid;
        if (!userId || !db) throw new Error("User not authenticated");

        const userDocRef = getUserDocRef(userId, syncId);
        if (!userDocRef) throw new Error("Could not determine storage path");

        await deleteDoc(doc(userDocRef, COLLECTION_NAME, id));
    },

    // Settings
    async saveSettings(settings: AppSettings, variable: string) {
        const userId = auth?.currentUser?.uid;
        if (!userId || !db) return;

        // Individual settings (theme, etc) are ALWAYS stored per-user (anonymous UID)
        // because we don't want cross-device theme sync to be forced, or syncId itself is in settings
        await setDoc(doc(db, "users", userId), {
            settings,
            variable
        }, { merge: true });
    },

    async getInitialState(callback: (variable: string, settings: AppSettings) => void) {
        const userId = auth?.currentUser?.uid;
        if (!userId || !db) return;

        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            callback(data.variable || "", data.settings || {
                autoInsertPosition: 'start',
                theme: 'light'
            });
        }
    }
};
