// utils/rewardUser.js
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const rewardGlucocoins = async (amount = 5) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const currentCoins = userSnap.data().glucocoins || 0;
    await updateDoc(userRef, {
      glucocoins: currentCoins + amount,
    });
  } else {
    await setDoc(userRef, {
      glucocoins: amount,
      email: user.email,
      displayName: user.displayName,
    });
  }
};
