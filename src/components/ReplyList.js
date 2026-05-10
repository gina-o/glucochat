import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, deleteDoc, collection, query, orderBy, onSnapshot, updateDoc } from "firebase/firestore";

const ReplyList = ({ postId }) => {
  const [replies, setReplies] = useState([]);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedText, setEditedText] = useState("");

  // Fetch replies from Firestore
  useEffect(() => {
    const commentsCollection = collection(db, "posts", postId, "comments");
    const q = query(commentsCollection, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReplies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReplies(fetchedReplies);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleDeleteReply = async (replyId) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      try {
        await deleteDoc(doc(db, "posts", postId, "comments", replyId));
        alert("Reply deleted!");
      } catch (error) {
        console.error("Error deleting reply:", error.message);
      }
    }
  };

  const handleEditClick = (reply) => {
    setEditingReplyId(reply.id);
    setEditedText(reply.text);
  };

  const handleSaveEdit = async (replyId) => {
    try {
      await updateDoc(doc(db, "posts", postId, "comments", replyId), {
        text: editedText,
      });
      setEditingReplyId(null);
      setEditedText("");
      alert("Reply updated!");
    } catch (error) {
      console.error("Error updating reply:", error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingReplyId(null);
    setEditedText("");
  };

  return (
    <div className="mt-4">
      {replies.length === 0 ? (
        <p className="text-center text-gray-600">No comments yet. Be the first to reply!</p>
      ) : (
        replies.map((reply) => (
          <div key={reply.id} className="flex flex-col mb-4 p-4 bg-white rounded-lg shadow-md">
            {editingReplyId === reply.id ? (
              <>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="border rounded p-2 w-full"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(reply.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800">{reply.text}</p>
                <p className="text-sm text-gray-500 mt-2">- {reply.userEmail}</p>
                {auth.currentUser?.uid === reply.userId && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleEditClick(reply)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReplyList;
