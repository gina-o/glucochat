import { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ReplyForm = ({ postId }) => {
  const [comment, setComment] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleComment = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to comment!");
      return;
    }

    if (!comment.trim()) {
      alert("Reply cannot be empty!");
      return;
    }

    try {
      setUploading(true);
      const { uid, email, displayName, photoURL } = auth.currentUser;

      await addDoc(collection(db, "posts", postId, "comments"), {
        text: comment,
        userId: uid,
        userEmail: email, // backend reference only
        userName: displayName || "Anonymous", // ✅ always use displayName
        userPhoto: photoURL,
        timestamp: serverTimestamp(),
      });

      console.log("Reply successfully added to Firestore!");
      setComment("");
    } catch (error) {
      console.error("Error commenting:", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <textarea
        onChange={(e) => setComment(e.target.value)}
        value={comment}
        placeholder="Write a reply..."
        className="w-full p-3 border rounded-lg mb-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />
      <button
        onClick={handleComment}
        disabled={uploading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
      >
        {uploading ? "Posting..." : "Post Reply"}
      </button>
    </div>
  );
};

export default ReplyForm;


