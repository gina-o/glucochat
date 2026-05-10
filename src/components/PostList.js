import React, { useState } from "react";
import { db, auth } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";

const PostList = ({ posts, comments }) => {
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingToPostId, setReplyingToPostId] = useState(null);
  const [showOptions, setShowOptions] = useState(null);

  const refreshPosts = () => {}; // optional if you use onSnapshot

  const handleDelete = async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
    setShowOptions(null);
  };

  const handleEdit = (postId, currentText) => {
    setEditingPostId(postId);
    setEditedText(currentText);
    setShowOptions(null);
  };

  const handleSave = async (postId) => {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { text: editedText });
    setEditingPostId(null);
  };

  const handleReply = async (postId, postReplies) => {
    const postRef = doc(db, "posts", postId);
    const newReply = {
      userId: auth.currentUser?.uid,
      userName: auth.currentUser?.displayName || "Anonymous",
      userPhoto: auth.currentUser?.photoURL || null,
      text: replyText,
      timestamp: new Date().toISOString(),
    };
    await updateDoc(postRef, { replies: [...(postReplies || []), newReply] });
    setReplyText("");
    setReplyingToPostId(null);
  };

  return (
    <div className="mt-6 space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="p-4 bg-white rounded-lg shadow border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-2">
<img
  src={post.userPhoto || process.env.PUBLIC_URL + "/default-avatar.png"}
  alt="User Avatar"
  className="w-10 h-10 rounded-full"
/>

            <div>
              <p className="font-semibold">{post.userName || "Anonymous"}</p>
            </div>

            {auth.currentUser?.uid === post.userId && (
              <div className="relative ml-auto">
                <button
                  onClick={() =>
                    setShowOptions(showOptions === post.id ? null : post.id)
                  }
                  className="text-gray-500"
                >
                  <span className="text-xl">⋮</span>
                </button>
                {showOptions === post.id && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-40 p-2 z-10">
                    <button
                      onClick={() => handleEdit(post.id, post.text)}
                      className="w-full text-left text-yellow-600 px-2 py-1 rounded mb-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="w-full text-left text-red-600 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editingPostId === post.id ? (
            <>
              <textarea
                className="w-full border rounded p-2 mb-2"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
              <button
                onClick={() => handleSave(post.id)}
                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPostId(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap mb-2">{post.text}</p>
          )}

          <div className="mt-2">
            <button
              onClick={() => setReplyingToPostId(post.id)}
              className="text-blue-500 hover:underline text-sm"
            >
              Reply
            </button>
          </div>

          {replyingToPostId === post.id && (
            <div className="mt-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full border rounded p-2 mb-2"
                placeholder="Write a reply..."
              />
              <button
                onClick={() => handleReply(post.id, post.replies)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Post Reply
              </button>
            </div>
          )}

          {post.replies &&
            post.replies.map((reply, index) => (
              <div
                key={index}
                className="mt-3 pl-6 border-l-2 border-gray-300"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={
                      reply.userPhoto ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        reply.userName || "Anonymous"
                      )}&background=random`
                    }
                    alt="User Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <p className="text-sm font-semibold text-gray-700">
                    {reply.userName || "Anonymous"} replied:
                  </p>
                </div>
                <p className="text-gray-700 ml-8">{reply.text}</p>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default PostList;


