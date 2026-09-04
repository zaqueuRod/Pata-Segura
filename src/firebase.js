// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// ✅ COLE AQUI O SEU CÓDIGO QUE COPIOU NO PASSO 2!
const firebaseConfig = {
  apiKey: "AIzaSyAlWMxmVrIyZTE9zGvGFDLxakC8ISuDRh4",
  authDomain: "pata-segura-62590.firebaseapp.com",
  databaseURL: "https://pata-segura-62590-default-rtdb.firebaseio.com/",
  projectId: "pata-segura-62590",
  storageBucket: "pata-segura-62590.firebasestorage.app",
  messagingSenderId: "838908568150",
  appId: "1:838908568150:web:ee287068346b83ba9151f7"
};

// ✅ Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// ✅ Conecta ao Banco de Dados em TEMPO REAL
const db = getDatabase(app);

export { db };