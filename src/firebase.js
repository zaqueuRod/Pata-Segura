// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth'


const firebaseConfig = {
  apiKey: "AIzaSyAlWMxmVrIyZTE9zGvGFDLxakC8ISuDRh4",
  authDomain: "pata-segura-62590.firebaseapp.com",
  databaseURL: "https://pata-segura-62590-default-rtdb.firebaseio.com/",
  projectId: "pata-segura-62590",
  storageBucket: "pata-segura-62590.firebasestorage.app",
  messagingSenderId: "838908568150",
  appId: "1:838908568150:web:ee287068346b83ba9151f7"
};


const app = initializeApp(firebaseConfig);


const db = getDatabase(app);
export const auth = getAuth(app)

export { db };