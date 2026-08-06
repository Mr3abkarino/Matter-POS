import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBon8v_7LmhdsXyfWViaavAiLBDV96lhO8",
  authDomain: "dream-corner-pos.firebaseapp.com",
  projectId: "dream-corner-pos",
  storageBucket: "dream-corner-pos.firebasestorage.app",
  messagingSenderId: "591340960109",
  appId: "1:591340960109:web:ae0272e3e0a447970dc264",
  measurementId: "G-LJ82P6PFWR"
};

const app = initializeApp(firebaseConfig);
export const dbCloud = getFirestore(app);
