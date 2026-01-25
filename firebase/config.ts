
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARCQjRoKSJp4-mNwjvUFwvoDBzEHARYkQ",
  authDomain: "theresiliosmind4co-64511-7393c.firebaseapp.com",
  projectId: "theresiliosmind4co-64511-7393c",
  storageBucket: "theresiliosmind4co-64511-7393c.firebasestorage.app",
  messagingSenderId: "277773159140",
  appId: "1:277773159140:web:b841289b420d910c953af1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
