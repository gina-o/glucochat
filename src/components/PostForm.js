import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const PostForm = () => {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);

  const user = auth.currentUser;
  const userPhoto = user?.photoURL;
  const userName = user?.displayName || "Anonymous"; 
  const userEmail = user?.email || "User"; // kept for backend 

  const handlePost = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to post!");
      return;
    }

    if (!text.trim()) {
      alert("Posts cannot be empty!");
      return;
    }

    try {
      setUploading(true);
      const { uid, email, displayName, photoURL } = auth.currentUser;

      await addDoc(collection(db, "posts"), {
        text,
        userId: uid,
        userEmail: email, // ✅ backend reference only
        userName: displayName || "Anonymous", // ✅ shown publicly
        userPhoto: photoURL,
        timestamp: serverTimestamp(),
        replies: [],
        likes: 0,
      });

      setText("");
    } catch (error) {
      console.error("Error adding post:", error.message);
      alert("Error posting. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow mt-4 bg-white">
      <div className="flex items-start gap-3">
        {/* ✅ Avatar with fallback */}
        <img
          src={
            userPhoto ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              userName || userEmail
            )}&background=random`
          }
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />

        <div className="flex flex-col w-full gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience..."
            className="bg-blue-100 w-full border p-2 rounded"
            rows={3}
          />

          <div className="flex justify-between items-center">
            {/* ✅ Show the name next to input */}
            <span className="text-sm text-gray-600">
              Posting as <strong>{userName}</strong>
            </span>

            <button
              onClick={handlePost}
              disabled={uploading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              {uploading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
