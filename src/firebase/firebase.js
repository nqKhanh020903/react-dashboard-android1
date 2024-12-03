import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Khởi tạo Firebase App
const firebaseApp = initializeApp(firebaseConfig);

// Truy cập các dịch vụ Firebase
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, auth, database, storage };
