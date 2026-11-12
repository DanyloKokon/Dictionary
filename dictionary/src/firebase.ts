import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYF5sWO94e-WsdeerVvQjSlBJEWkAVqK4",
  authDomain: "dictionary-eb06e.firebaseapp.com",
  projectId: "dictionary-eb06e",
  storageBucket: "dictionary-eb06e.firebasestorage.app",
  messagingSenderId: "675988405268",
  appId: "1:675988405268:web:edd845f23cebd5dd157b01",
  measurementId: "G-3FH4ZWRE5P",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
