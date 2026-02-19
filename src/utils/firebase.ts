import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyAc3X0hdVSQC01ZQ8ty3k8H3IwsThAXhN4',
    authDomain: 'scribble-math-prod.firebaseapp.com',
    projectId: 'scribble-math-prod',
    storageBucket: 'scribble-math-prod.firebasestorage.app',
    messagingSenderId: '60445191230',
    appId: '1:60445191230:web:c00230ef05f6bdd903356f',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with persistent cache (replaces deprecated enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
});
