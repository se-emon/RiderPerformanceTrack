import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDgZqQs28BM3GujfhQ5LxGgBPO8Kj6ibY8',
  authDomain: 'fbds-sebd.firebaseapp.com',
  projectId: 'fbds-sebd',
  storageBucket: 'fbds-sebd.firebasestorage.appspot.com',
  messagingSenderId: '614561432072',
  appId: '1:614561432072:web:YOUR_APP_ID_HERE',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
