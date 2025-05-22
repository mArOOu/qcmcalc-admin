// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import exams from "../public/data/exams.json";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDh-_0h35V7Kz9Fi5TjDN7KnTjclkNKqZw",
  authDomain: "qcmcalcbyhealthit.firebaseapp.com",
  projectId: "qcmcalcbyhealthit",
  storageBucket: "qcmcalcbyhealthit.firebasestorage.app",
  messagingSenderId: "695183400619",
  appId: "1:695183400619:web:c5ab737ad0f92d32a861ee",
  measurementId: "G-411BFGX3V6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function migrateData() {
  for (const exam of exams) {
    await addDoc(collection(db, "exams"), exam);
    console.log(`Added exam for module ${exam.subject}`);
  }
}

migrateData();
