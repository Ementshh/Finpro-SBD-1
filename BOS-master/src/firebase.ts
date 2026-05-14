import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeHST9UAsioj9TBqyeSB7bXJI0hxplAyE",
  authDomain: "bos-fund.firebaseapp.com",
  projectId: "bos-fund",
  storageBucket: "bos-fund.firebasestorage.app",
  messagingSenderId: "718463229375",
  appId: "1:718463229375:web:c7b5b28d9f48a5b790550a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;