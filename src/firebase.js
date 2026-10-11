import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {firebaseConfig,ADMIN_UID as adminId} from './firebase-config.js';
export const ADMIN_UID=adminId;
export const configured=Boolean(firebaseConfig.apiKey&&!firebaseConfig.apiKey.startsWith('REPLACE_')&&firebaseConfig.projectId&&!firebaseConfig.projectId.startsWith('REPLACE_')&&ADMIN_UID&&!ADMIN_UID.startsWith('REPLACE_'));
const app=configured?initializeApp(firebaseConfig):null;
export const auth=app?getAuth(app):null;
export const db=app?getFirestore(app):null;
