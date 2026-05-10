import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const accessories = [
  { name: "Hat", image: `${process.env.PUBLIC_URL}/hat.png`, cost: 10 },
  { name: "Flower", image: `${process.env.PUBLIC_URL}/flower.png`, cost: 8 },
  { name: "Scarf", image: `${process.env.PUBLIC_URL}/scarf.png`, cost: 12 },
  { name: "Bow Tie", image: `${process.env.PUBLIC_URL}/tie.png`, cost: 9 },
];

const accessoryStyles = {
  Hat: "top-0 left-24 w-32",
  Flower: "top-0 left-28 w-32",
  Scarf: "top-[148px] left-[66px] w-[200px]",
  "Bow Tie": "top-[127px] left-[66px] w-[200px]",
};

const Customize = () => {
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const lastVisit = data.lastCustomizeVisit || null;
        const today = new Date().toDateString();

        let updatedCoins = data.glucocoins || 0;
        if (lastVisit !== today) {
          updatedCoins += 1;
          await updateDoc(userRef, {
            glucocoins: updatedCoins,
            lastCustomizeVisit: today,
          });
        }

        setCoins(updatedCoins);
        setSelectedAccessories(data.avatarAccessories || []);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSelectAccessory = async (accessory) => {
    if (selectedAccessories.includes(accessory.name)) return;
    if (coins < accessory.cost) return alert("Not enough Glucocoins!");

    const updatedAccessories = [...selectedAccessories, accessory.name];
    const newCoinBalance = coins - accessory.cost;
    setSelectedAccessories(updatedAccessories);
    setCoins(newCoinBalance);

    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      avatarAccessories: updatedAccessories,
      glucocoins: newCoinBalance,
    });
  };

  const handleRemoveAccessory = async (accessory) => {
    const updatedAccessories = selectedAccessories.filter((a) => a !== accessory.name);
    const newCoinBalance = coins + accessory.cost;
    setSelectedAccessories(updatedAccessories);
    setCoins(newCoinBalance);

    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      avatarAccessories: updatedAccessories,
      glucocoins: newCoinBalance,
    });
  };

  const handleSave = async () => {
    // Optional: save anything else needed
    navigate("/dashboard");
  };

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Customize Your Avatar</h1>

      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Avatar Preview */}
        <div className="relative w-96 h-96 mb-4 md:mb-0">
          <img src={`${process.env.PUBLIC_URL}/duck.png`} alt="Avatar Base" className="w-full h-full" />
          {selectedAccessories.map((accName) => {
            const acc = accessories.find((a) => a.name === accName);
            return (
              <div key={accName} className="absolute top-0 left-0 w-full h-full">
                <img
                  src={acc.image}
                  alt={accName}
                  className={`absolute ${accessoryStyles[accName]}`}
                />
                <button
                  onClick={() => handleRemoveAccessory(acc)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                >
                  X
                </button>
              </div>
            );
          })}
        </div>

        {/* Accessories Shop */}
        <div className="flex-1 ml-6">
          <p className="mb-2 font-semibold">Glucocoins: {coins}</p>
          <div className="grid grid-cols-2 gap-4">
            {accessories.map((item) => (
              <div key={item.name} className="border p-2 rounded shadow text-center">
                <img src={item.image} alt={item.name} className="w-16 h-16 mx-auto" />
                <p>{item.name}</p>
                <p className="text-sm text-gray-500">{item.cost} Glucocoins</p>
                <button
                  onClick={() => handleSelectAccessory(item)}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Buy
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;


