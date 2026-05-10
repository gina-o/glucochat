import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyCUS2vGYk_zYdUu_vb6L0ak-cpSfpXoqsM",
  authDomain: "diabetes-app-f1b21.firebaseapp.com",
  projectId: "diabetes-app-f1b21",
  storageBucket: "diabetes-app-f1b21.appspot.com",
  messagingSenderId: "52938100391",
  appId: "1:52938100391:web:923277d9d716ae8c979582",
  measurementId: "G-5M4XX1Z3P9",
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const generateFriendCode = (displayName) => {
  const base = displayName
    ? displayName.split(" ")[0].toUpperCase()
    : "USER";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${rand}`;
};


// Ensure user exists
const ensureUserExists = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // First-time user
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      glucocoins: 0,
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
      friendCode: generateFriendCode(user.displayName),
    });
  } else {
    // Existing user → ensure missing fields
    const data = userSnap.data();

    await setDoc(
      userRef,
      {
        friends: data.friends || [],
        incomingRequests: data.incomingRequests || [],
        outgoingRequests: data.outgoingRequests || [],
        friendCode:
          data.friendCode || generateFriendCode(data.displayName),
      },
      { merge: true }
    );
  }
};



const savePost = async (postData) => {
  const user = auth.currentUser;
  if (user) {
    const postsRef = collection(db, "posts");
    await addDoc(postsRef, {
      userId: user.uid,
      userEmail: user.email,
      content: postData.content,
      timestamp: new Date(),
      userPhoto: user.photoURL || "",
    });
  }
};

// Fetch posts
const fetchPosts = async () => {
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Save log
const saveLog = async (logData) => {
  const user = auth.currentUser;
  if (user) {
    const userLogsRef = collection(db, "users", user.uid, "logs");
    await addDoc(userLogsRef, logData);
  }
};

// Fetch logs
const fetchLogs = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(collection(db, "users", user.uid, "logs"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};


export {
  auth,
  db,
  storage,
  googleProvider,
  ensureUserExists,
  savePost,
  fetchPosts,
  saveLog,
  fetchLogs,
};

