import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { rewardGlucocoins } from "../utils/rewardUser";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { checkAndRewardStreak } from "../utils/streaks";


export default function CheckIn() {
  const [bloodSugar, setBloodSugar] = useState(0);
  const [characterMessage, setCharacterMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [activity, setActivity] = useState("");
  const [meditationStep, setMeditationStep] = useState("Breathe in...");
  const [selectedYoga, setSelectedYoga] = useState("beginner");
  const [selectedExercise, setSelectedExercise] = useState("walking");
  const [meditationIntervalId, setMeditationIntervalId] = useState(null);
  const [timer, setTimer] = useState(15 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [rewardPopup, setRewardPopup] = useState(false);

  const [showJournal, setShowJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [savedEntries, setSavedEntries] = useState(() => {
    

    const entries = localStorage.getItem("journalEntries");
    return entries ? JSON.parse(entries) : [];
  });
  const [openEntryOptions, setOpenEntryOptions] = useState(null);

  // Function to save journal entry
  const handleSaveJournal = () => {
    if (journalEntry.trim()) {
      const newEntry = {
        entry: journalEntry,
        date: new Date().toLocaleString(),
        bloodSugarLevel: bloodSugar,
      };
      const updatedEntries = [...savedEntries, newEntry];
      setSavedEntries(updatedEntries);
      localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));
      setJournalEntry("");
      setShowJournal(false);
    }
  };
const handleDeleteEntry = (index) => {
  const updatedEntries = savedEntries.filter((_, i) => i !== index);
  setSavedEntries(updatedEntries);
  localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));
  setOpenEntryOptions(null);
};

const handleEditEntry = (index) => {
  const entryToEdit = savedEntries[index];
  setJournalEntry(entryToEdit.entry);
  setBloodSugar(entryToEdit.bloodSugarLevel);
  setShowJournal(true);

  // Optional: remove the old entry while editing so saving replaces it
  const updatedEntries = savedEntries.filter((_, i) => i !== index);
  setSavedEntries(updatedEntries);
  localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));

  setOpenEntryOptions(null);
};
const saveBloodSugarLog = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user || !bloodSugar) return;

  await addDoc(collection(db, "users", user.uid, "logs"), {
    bloodSugar,
    timestamp: serverTimestamp(),
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  });

  await checkAndRewardStreak(user.uid);
};


  const yogaVideos = {
    beginner: { label: "Beginner Yoga", url: "https://www.youtube.com/embed/v7AYKMP6rOE" },
    stretch: { label: "Morning Stretch Yoga", url: "https://www.youtube.com/embed/4pKly2JojMw" },
    relaxing: { label: "Relaxing Yoga Before Bed", url: "https://www.youtube.com/embed/--jhKVdZOJM" },
  };

  const lightExerciseVideos = {
    walking: { label: "Indoor Walking Workout", url: "https://www.youtube.com/embed/enYITYwvPAQ" },
    seated: { label: "Seated Exercise for Beginners", url: "https://www.youtube.com/embed/laOeyc2Rh2Y" },
    lowImpact: { label: "Low Impact Cardio", url: "https://www.youtube.com/embed/PV1t9W1nSxI" },
  };

  // Blood sugar feedback + reward
 useEffect(() => {
  if (bloodSugar <= 0) return;

  saveBloodSugarLog();

  if (bloodSugar > 180) {
    setCharacterMessage("Your blood sugar is high! Let's do something active! 🏃‍♂️");
  } else if (bloodSugar < 70) {
    setCharacterMessage("Your blood sugar is low! Eat a snack and rest! 🍎");
  } else {
    setCharacterMessage("You're doing great! Keep monitoring your levels.");
  }
}, [bloodSugar]);


  // Timer for low blood sugar
  useEffect(() => {
    let interval = null;
    if (timerRunning && activity === "low") {
      interval = setInterval(() => {
        setTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setTimerRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, activity]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleActivitySelect = (selectedActivity) => {
    setActivity(selectedActivity.toLowerCase());
    setShowPopup(true);
    if (selectedActivity.toLowerCase() === "meditation") {
      const id = startMeditation();
      setMeditationIntervalId(id);
    }
  };

  const startMeditation = () => {
    const steps = ["Breathe in...", "Hold...", "Breathe out..."];
    let index = 0;
    const interval = setInterval(() => {
      setMeditationStep(steps[index]);
      index = (index + 1) % steps.length;
    }, 4000);
    return interval;
  };

  const handleLowTimerStart = () => {
    setActivity("low");
    setTimer(15 * 60);
    setTimerRunning(true);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    if (meditationIntervalId) {
      clearInterval(meditationIntervalId);
      setMeditationIntervalId(null);
    }
    setShowPopup(false);
    setActivity("");
    setTimerRunning(false);
    setRewardPopup(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gradient-to-r from-rose-100 to-violet-300 shadow-lg rounded-xl text-center">
      <h2 className="text-xl font-bold mb-4">Blood Sugar Check-In</h2>

      <div className="text-6xl mb-4">{bloodSugar > 180 ? "🔥" : bloodSugar < 70 ? "😓" : "😊"}</div>
      <p className="font-semibold text-lg mb-4">{characterMessage}</p>

      <label className="block font-medium">Enter Blood Sugar Level</label>
      <input
        type="number"
        value={bloodSugar}
        onChange={(e) => setBloodSugar(Number(e.target.value))}
        className="w-full p-2 border rounded my-2 text-center"
      />

 

      {/* Activity Selection */}
      {bloodSugar > 180 && (
        <div className="mt-4">
          <p className="font-semibold">Choose an activity to help lower your blood sugar:</p>
          <button onClick={() => handleActivitySelect("exercise")} className="m-2 px-4 py-2 bg-blue-500 text-white rounded">Light Exercise 🚶‍♂️</button>
          <button onClick={() => handleActivitySelect("yoga")} className="m-2 px-4 py-2 bg-green-500 text-white rounded">Do Yoga 🧘‍♀️</button>
          <button onClick={() => handleActivitySelect("meditation")} className="m-2 px-4 py-2 bg-purple-500 text-white rounded">Meditate 🧘</button>
        </div>
      )}

      {bloodSugar < 70 && (
        <div className="mt-4">
          <p className="font-semibold">Eat fast-acting carbs and rest for 15 minutes!</p>
          <button onClick={handleLowTimerStart} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">Start Timer ⏳</button>
        </div>
      )}

      {/* Popup Overlay */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full relative">
            {rewardPopup ? (
              <p className="text-lg font-semibold">{popupMessage}</p>
            ) : (
              <>
                {activity !== "low" && (
                  <>
                    <h3 className="text-lg font-bold mb-2">
                      {activity === "walk" ? "Let's go for a walk!" :
                       activity === "yoga" ? "Time for some yoga!" :
                       activity === "exercise" ? "Light Exercise Time!" :
                       activity === "meditation" ? "Relax and Meditate" : "Rest and Recharge"}
                    </h3>
                    <p className="mb-4">Follow along for 10 minutes to feel better. 😊</p>
                  </>
                )}

                {activity === "yoga" && (
                  <>
                    <label className="block text-left mb-2 font-medium">Choose a Yoga Video:</label>
                    <select value={selectedYoga} onChange={(e) => setSelectedYoga(e.target.value)} className="w-full mb-4 p-2 border rounded">
                      {Object.entries(yogaVideos).map(([key, video]) => (<option key={key} value={key}>{video.label}</option>))}
                    </select>
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <iframe className="w-full h-64 rounded-lg" src={yogaVideos[selectedYoga].url} title={yogaVideos[selectedYoga].label} frameBorder="0" allowFullScreen></iframe>
                    </div>
                  </>
                )}

                {activity === "exercise" && (
                  <>
                    <label className="block text-left mb-2 font-medium">Choose a Light Exercise Video:</label>
                    <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="w-full mb-4 p-2 border rounded">
                      {Object.entries(lightExerciseVideos).map(([key, video]) => (<option key={key} value={key}>{video.label}</option>))}
                    </select>
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <iframe className="w-full h-64 rounded-lg" src={lightExerciseVideos[selectedExercise].url} title={lightExerciseVideos[selectedExercise].label} frameBorder="0" allowFullScreen></iframe>
                    </div>
                  </>
                )}

                {activity === "meditation" && (
                  <>
                    <p className="mb-2 text-lg font-medium">{meditationStep}</p>
                    <motion.div className="w-24 h-24 bg-purple-300 rounded-full mx-auto" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }}/>
                  </>
                )}

                {activity === "low" && (
                  <>
                    <p className="text-lg mb-2 font-medium">Resting Timer: {formatTime(timer)} ⏳</p>
                    <p className="text-gray-600">You can rest here or keep track on your phone. ❤️</p>
                  </>
                )}

                <button onClick={handleClosePopup} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">Close</button>
              </>
            )}
          </div>
        </div>
      )}
     {/* Journal Button */}
      <div className="mt-4">
        <button
          onClick={() => setShowJournal(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded shadow hover:bg-pink-600"
        >
          Journal Entry ✍️
        </button>
        {savedEntries.length > 0 && (
          <div className="mt-6 text-left">
            <h4 className="font-bold mb-2">Past Journal Entries:</h4>
            <ul className="space-y-2">
             {savedEntries.map((item, index) => (
  <li key={index} className="bg-white p-3 rounded shadow relative">
    <p className="text-sm text-gray-600">{item.date}</p>
    <p>Blood Sugar: {item.bloodSugarLevel}</p>
    <p>{item.entry}</p>

    {/* More options button */}
    <button
      onClick={() => setOpenEntryOptions(openEntryOptions === index ? null : index)}
      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
    >
      ...
    </button>

    {/* Edit/Delete menu */}
    {openEntryOptions === index && (
      <div className="absolute top-6 right-2 bg-white border rounded shadow p-2 flex flex-col space-y-1">
        <button
          onClick={() => handleEditEntry(index)}
          className="text-blue-500 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteEntry(index)}
          className="text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    )}
  </li>
))}

            </ul>
          </div>
        )}
      </div>
      {/* Journal Modal */}
      {showJournal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Journal Your Experience</h3>
            <p className="text-sm text-gray-500 mb-2">Blood Sugar: {bloodSugar} mg/dL</p>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="w-full p-3 border rounded mb-3"
              placeholder="How are you feeling? Any symptoms?"
              rows="4"
            />
            <div className="flex justify-between">
              <button onClick={handleSaveJournal} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save Entry 💾</button>
              <button onClick={() => setShowJournal(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
