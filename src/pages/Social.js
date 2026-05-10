import { useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  collectionGroup,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import PostForm from "../components/PostForm";
import PostList from "../components/PostList";

export default function Social() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);

  /* ───────── AUTH ───────── */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  /* ───────── DATA ───────── */
  useEffect(() => {
    if (!user) return;

    const postQuery = query(
      collection(db, "posts"),
      orderBy("timestamp", "desc")
    );

    const unsubPosts = onSnapshot(postQuery, (snap) => {
      setPosts(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    const unsubComments = onSnapshot(
      collectionGroup(db, "comments"),
      (snap) => {
        setComments(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            postId: doc.ref.parent.parent.id,
          }))
        );
      }
    );

    return () => {
      unsubPosts();
      unsubComments();
    };
  }, [user]);

  /* ───────── ACTIONS ───────── */
  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (!authChecked) {
    return <div className="text-lg">Loading community…</div>;
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-400 to-sky-300 rounded-2xl p-8 flex justify-between items-center text-white shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">Socials</h1>
          <p className="opacity-90">
            Share wins, vent lows, support each other 💙
          </p>
        </div>

        {user && (
          <button
            onClick={logout}
            className="bg-white/20 px-5 py-2 rounded-xl hover:bg-white/30 transition"
          >
            Log out
          </button>
        )}
      </div>

      {/* AUTH GATE */}
      {!user ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <p className="text-lg mb-4">
            Join the GlucoChat community
          </p>
          <button
            onClick={login}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
          >
            Log in with Google
          </button>
        </div>
      ) : (
        <>
          {/* POST CREATOR */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <PostForm />
          </div>

          {/* FEED */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <PostList posts={posts} comments={comments} />
          </div>
        </>
      )}
    </div>
  );
}


