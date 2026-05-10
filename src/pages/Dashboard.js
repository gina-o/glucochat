import { useEffect, useState } from "react";
import { fetchLogs, db } from "../firebase";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAuth, onAuthStateChanged, updateProfile, signInWithPopup, signOut } from "firebase/auth";
import { googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";


// Avatar accessory data
const accessories = [
  { name: "Hat", image: `${process.env.PUBLIC_URL}/hat.png`, cost: 10 },
  { name: "Flower", image: `${process.env.PUBLIC_URL}/flower.png`, cost: 8 },
  { name: "Scarf", image: `${process.env.PUBLIC_URL}/scarf.png`, cost: 12 },
  { name: "Bow Tie", image: `${process.env.PUBLIC_URL}/tie.png`, cost: 9 },
];

const accessoryStyles = {
  Hat: "absolute top-0 left-2 w-6 h-6",
  Flower: "absolute top-0 left-4 w-6 h-6",
  Scarf: "absolute bottom-0 left-1 w-6 h-6",
  "Bow Tie": "absolute bottom-0 left-4 w-6 h-6",
};


const sendFriendRequest = async (friendCode) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return { error: "Not logged in" };

  // Query user by friendCode
  const usersCollection = doc(db, "users");
  const snapshot = await getDoc(usersCollection); // Simplified: for now you can query manually by friendCode

  // Here you would normally query where friendCode === input
  // For simplicity, assume code exists and is valid
  const friendUid = friendCode; // placeholder

  const userRef = doc(db, "users", user.uid);
  const friendRef = doc(db, "users", friendUid);

  await updateDoc(userRef, { outgoingRequests: arrayUnion(friendUid) });
  await updateDoc(friendRef, { incomingRequests: arrayUnion(user.uid) });

  return { success: true, friendUid };
};

const acceptFriendRequest = async (friendUid) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const friendRef = doc(db, "users", friendUid);

  // Add each other as friends
  await updateDoc(userRef, {
    friends: arrayUnion(friendUid),
    incomingRequests: arrayRemove(friendUid),
  });
  await updateDoc(friendRef, {
    friends: arrayUnion(user.uid),
    outgoingRequests: arrayRemove(user.uid),
  });
};

const declineFriendRequest = async (friendUid) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const friendRef = doc(db, "users", friendUid);

  await updateDoc(userRef, { incomingRequests: arrayRemove(friendUid) });
  await updateDoc(friendRef, { outgoingRequests: arrayRemove(user.uid) });
};

const fetchFriendsData = async (userUid) => {
  const userRef = doc(db, "users", userUid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return { friends: [], incomingRequests: [], outgoingRequests: [] };
  const data = userSnap.data();
  return {
    friends: data.friends || [],
    incomingRequests: data.incomingRequests || [],
    outgoingRequests: data.outgoingRequests || [],
  };
};

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [avatarAccessories, setAvatarAccessories] = useState([]);
  const [coins, setCoins] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  const [friendsData, setFriendsData] = useState({ friends: [], incomingRequests: [], outgoingRequests: [] });

  const navigate = useNavigate();

  // Load logs
  useEffect(() => {
    const load = async () => {
      const data = await fetchLogs();
      setLogs(data || []);
    };
    load();
  }, []);

  // Auth listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
      if (currentUser) {
        if (!currentUser.displayName) setShowUsernamePrompt(true);

        // Fetch avatar accessories and coins
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setAvatarAccessories(data.avatarAccessories || []);
          setCoins(data.glucocoins || 0);

          // Fetch friends
          const fData = await fetchFriendsData(currentUser.uid);
          setFriendsData(fData);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Login with Google
  const handleLogin = async () => {
    try {
      const auth = getAuth();
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  // Update username
  const updateUsername = async () => {
    if (!usernameInput) return;
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await updateProfile(currentUser, { displayName: usernameInput });
        setUser({ ...currentUser, displayName: usernameInput });
        setShowUsernamePrompt(false);
      } catch (error) {
        console.error("Error updating username:", error);
      }
    }
  };

  // Stats
  const recentLogs = logs.slice(-7);
  const avgGlucose =
    logs.length > 0
      ? Math.round(
          logs.reduce((sum, l) => sum + Number(l.bloodSugar), 0) / logs.length
        )
      : "--";
  const lastEntry = logs[logs.length - 1];

  // Friendly challenge: 7-day streak
  const streak7Days = () => {
    if (logs.length < 7) return false;
    const last7 = logs.slice(-7);
    return last7.every((l) => l.bloodSugar); // any value means logged
  };

  const claimStreakReward = async () => {
    if (!user) return;
    if (!streak7Days()) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { glucocoins: coins + 10 });
    setCoins(coins + 10);
    alert("🎉 Streak reward claimed! +10 Glucocoins");
  };

  if (!authChecked) return <div className="text-center text-white text-xl">Loading...</div>;
  if (!user)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Sign in with Google
        </button>
      </div>
    );

  return (
    <div className="space-y-8 relative p-4">
      {/* USERNAME PROMPT */}
      {showUsernamePrompt && (
        <div className="p-4 bg-white rounded-xl shadow-md">
          <p className="mb-2 text-gray-700">Please set your username:</p>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Enter your name"
            className="border p-2 rounded w-1/2"
          />
          <button
            onClick={updateUsername}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      )}

      {/* PROFILE AVATAR ICON */}
      <button
        onClick={() => setShowProfileModal(true)}
        className="absolute top-4 right-4 w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-400 z-50"
      >
        <img src={`${process.env.PUBLIC_URL}/duck.png`} alt="Avatar" className="w-full h-full" />
        {avatarAccessories.map((accName) => {
          const acc = accessories.find((a) => a.name === accName);
          if (!acc) return null;
          return <img key={accName} src={acc.image} alt={accName} className={accessoryStyles[accName]} />;
        })}
      </button>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img src={`${process.env.PUBLIC_URL}/duck.png`} alt="Avatar Base" className="w-full h-full" />
              {avatarAccessories.map((accName) => {
                const acc = accessories.find((a) => a.name === accName);
                if (!acc) return null;
                return <img key={accName} src={acc.image} alt={accName} className={accessoryStyles[accName].replace("w-6 h-6", "w-12 h-12")} />;
              })}
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-1">Display Name:</p>
              <input
                type="text"
                value={usernameInput || user.displayName || ""}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>

            <p className="mb-4 font-semibold">Glucocoins: {coins}</p>

            <div className="flex flex-wrap gap-2 justify-between">
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
              <button onClick={updateUsername} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Name</button>
              <button onClick={() => navigate("/customize")} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Customize Avatar</button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Logout</button>
              {streak7Days() && <button onClick={claimStreakReward} className="px-4 py-2 bg-yellow-400 rounded hover:bg-yellow-500">Claim 7-Day Streak +10 Coins</button>}
              <button onClick={() => setShowFriendsModal(true)} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Friends</button>
            </div>
          </div>
        </div>
      )}

      {/* FRIENDS MODAL */}
      {showFriendsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md overflow-y-auto max-h-[80vh]">
            <h2 className="text-lg font-semibold mb-4">Friends</h2>

            {/* Add Friend */}
            <AddFriendForm refreshFriends={() => fetchFriendsData(user.uid).then(setFriendsData)} />

            <div className="mb-4">
              <p className="font-semibold mb-2">Incoming Requests:</p>
              {friendsData.incomingRequests.length > 0 ? friendsData.incomingRequests.map((uid) => (
                <FriendRequestItem key={uid} uid={uid} refreshFriends={() => fetchFriendsData(user.uid).then(setFriendsData)} />
              )) : <p className="text-gray-500">No incoming requests</p>}
            </div>

            <div>
              <p className="font-semibold mb-2">Friends:</p>
              {friendsData.friends.length > 0 ? friendsData.friends.map((uid) => <FriendItem key={uid} uid={uid} />) : <p className="text-gray-500">No friends yet</p>}
            </div>

            <button onClick={() => setShowFriendsModal(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-transparent rounded-2xl p-8 text-white shadow-sm relative flex items-center">
        <h1 className="text-6xl font-bold flex-1">Welcome back, {user?.displayName || "Guest"}! 👋</h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Average Glucose" value={`${avgGlucose} mg/dL`} />
        <StatCard title="Last Reading" value={lastEntry ? `${lastEntry.bloodSugar} mg/dL` : "No data"} />
        <StatCard title="Last Insulin Dose" value={lastEntry ? `${lastEntry.insulinDose} units` : "--"} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Recent Glucose</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentLogs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bloodSugar" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Glucose Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bloodSugar" stroke="#3B82F6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* QUICK ACTION */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center">
        <p className="text-lg">Need to calculate insulin or review insights?</p>
        <a href="/log" className="px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition">Go to Logs →</a>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

// --- FRIEND COMPONENTS ---
function AddFriendForm({ refreshFriends }) {
  const [friendCode, setFriendCode] = useState("");
  const [message, setMessage] = useState("");

  const handleAddFriend = async () => {
    const res = await sendFriendRequest(friendCode);
    if (res.error) setMessage(res.error);
    else setMessage(`Request sent!`);
    refreshFriends();
    setFriendCode("");
  };

  return (
    <div className="mb-4">
      <input
        value={friendCode}
        onChange={(e) => setFriendCode(e.target.value)}
        placeholder="Enter friend code"
        className="border p-2 rounded w-full mb-2"
      />
      <button onClick={handleAddFriend} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Send Request</button>
      {message && <p className="text-sm text-green-600 mt-1">{message}</p>}
    </div>
  );
}

function FriendRequestItem({ uid, refreshFriends }) {
  const handleAccept = async () => {
    await acceptFriendRequest(uid);
    refreshFriends();
  };

  const handleDecline = async () => {
    await declineFriendRequest(uid);
    refreshFriends();
  };

  return (
    <div className="flex justify-between items-center mb-2">
      <span>{uid}</span> {/* Later fetch displayName */}
      <div className="flex gap-2">
        <button onClick={handleAccept} className="px-2 py-1 bg-green-500 text-white rounded">Accept</button>
        <button onClick={handleDecline} className="px-2 py-1 bg-red-500 text-white rounded">Decline</button>
      </div>
    </div>
  );
}

function FriendItem({ uid }) {
  return <div className="mb-2">{uid}</div>; // Later replace with displayName
}



