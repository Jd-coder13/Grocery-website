// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzwiC2PwvuN5pjM56NyuzXPOObh9a6DH0",
  authDomain: "groceryweb-e0dba.firebaseapp.com",
  projectId: "groceryweb-e0dba",
  storageBucket: "groceryweb-e0dba.firebasestorage.app",
  messagingSenderId: "725997776699",
  appId: "1:725997776699:web:0cf6fcd8103a2ec812111e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

