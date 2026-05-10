import React from "react";
import { db, auth } from "../firebase"; // ✅ Import auth
import { doc, deleteDoc } from "firebase/firestore";

const PostItem = ({ post }) => {
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", post.id));
        alert("Post deleted!");
      } catch (error) {
        console.error("Error deleting post:", error.message);
      }
    }
  };

  return (
    <div>
      <h3>{post.text}</h3>
      <p>By: {post.userEmail}</p>
      
      {/* Only show delete button if the current user is the owner */}
      {auth.currentUser?.uid === post.userId && (
        <button onClick={handleDelete}>Delete Post</button>
      )}
    </div>
  );
};

export default PostItem;
