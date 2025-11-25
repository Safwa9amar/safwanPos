import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-yWUmbbSvYzLzFFBMHvy9Q93_c511Es8",
  authDomain: "prismapos-ee749.firebaseapp.com",
  projectId: "prismapos-ee749",
  storageBucket: "prismapos-ee749.firebasestorage.app",
  messagingSenderId: "175391562810",
  appId: "1:175391562810:web:12ccaa019a253b733e6903",
  measurementId: "G-8W813R99F1"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };
