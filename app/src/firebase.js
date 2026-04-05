import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAZBUVckG1zhgXoWq8PxafuXGvtscPIryY",
  authDomain: "lunar-gift.firebaseapp.com",
  databaseURL: "https://lunar-gift-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lunar-gift",
  storageBucket: "lunar-gift.firebasestorage.app",
  messagingSenderId: "827045936084",
  appId: "1:827045936084:web:4e48a7b8984f224624b441"
};

const app = initializeApp(firebaseConfig);

// We only need Realtime Database for analytics
export const rtdb = getDatabase(app);
export default app;
