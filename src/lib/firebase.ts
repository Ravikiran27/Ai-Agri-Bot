import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCOuXlwI_HTo9vHLFXJ3FHbzYhKssd78oE",
  authDomain: "authenticate-4f223.firebaseapp.com",
  databaseURL: "https://authenticate-4f223-default-rtdb.firebaseio.com",
  projectId: "authenticate-4f223",
  storageBucket: "authenticate-4f223.appspot.com",
  messagingSenderId: "927792559739",
  appId: "1:927792559739:web:8bf06a9c73fbd8ab4594de",
  measurementId: "G-ZHWBF3KP1T"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };