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

export const FirebaseService = {
    // Auth
    async signIn() {
        if (!auth?.currentUser && auth) {
            await signInAnonymously(auth);
        }
        return auth?.currentUser;
    },

    // Prompts
    subscribeToPrompts(callback: (items: PromptItem[]) => void) {
        const userId = auth?.currentUser?.uid;
        if (!userId || !db) return () => { };

        const q = query(
            collection(db, "users", userId, COLLECTION_NAME),
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

    async savePrompt(item: PromptItem) {
        const userId = auth?.currentUser?.uid;
        if (!userId || !db) throw new Error("User not authenticated or Firebase not configured");

        const userPromptsRef = collection(db, "users", userId, COLLECTION_NAME);

        if (item.id) {
            const docRef = doc(db, "users", userId, COLLECTION_NAME, item.id);
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

    async deletePrompt(id: string) {
        const userId = auth?.currentUser?.uid;
        if (!userId || !db) throw new Error("User not authenticated");

        await deleteDoc(doc(db, "users", userId, COLLECTION_NAME, id));
    },

    // Settings
    async saveSettings(settings: AppSettings, variable: string) {
        const userId = auth?.currentUser?.uid;
        if (!userId || !db) return;

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
