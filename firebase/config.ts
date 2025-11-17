import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration from your Firebase project console.
const firebaseConfig = {
  apiKey: "AIzaSyBkfHIzTBBJoSUWuIHeAF5frSZsQD1VAfM",
  authDomain: "resilios-5a5f3.firebaseapp.com",
  projectId: "resilios-5a5f3",
  storageBucket: "resilios-5a5f3.appspot.com",
  messagingSenderId: "984048426314",
  appId: "1:984048426314:web:3080a5b262031c3eb975b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };