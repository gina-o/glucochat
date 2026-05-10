import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const has7DayStreak = (logs) => {
  const dates = [...new Set(logs.map(l => l.date))].sort();
  if (dates.length < 7) return false;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
      if (streak === 7) return true;
    } else {
      streak = 1;
    }
  }
  return false;
};

export const checkAndRewardStreak = async (uid) => {
  const logsSnap = await getDocs(collection(db, "users", uid, "logs"));
  const logs = logsSnap.docs.map(d => d.data());

  if (!has7DayStreak(logs)) return;

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  const today = new Date().toISOString().split("T")[0];
  const lastClaim = userSnap.data()?.lastStreakRewardDate;

  if (lastClaim === today) return;

  await updateDoc(userRef, {
    glucocoins: (userSnap.data().glucocoins || 0) + 10,
    lastStreakRewardDate: today,
  });
};
