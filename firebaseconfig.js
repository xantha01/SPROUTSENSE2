// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLGfknBGSEl6Fw21V0pq04BbfFCubyjaI",
  authDomain: "sproutsense-9536f.firebaseapp.com",
  databaseURL: "https://sproutsense-9536f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sproutsense-9536f",
  storageBucket: "sproutsense-9536f.firebasestorage.app",
  messagingSenderId: "870644685502",
  appId: "1:870644685502:web:1195a2b1baf455c57a9cef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the app so it can be used elsewhere
export default app;
