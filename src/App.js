import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { auth } from "./firebase";

import Layout from "./components/Layout";

import LandingPage from "./pages/LandingPage";
import Social from "./pages/Social";
import Shop from "./pages/Shop";
import Log from "./pages/Log";
import CheckIn from "./pages/CheckIn";
import Customize from "./pages/Customize";
import Dashboard from "./pages/Dashboard";


import "./index.css";

function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FBFF] text-xl">
        Loading GlucoChat…
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing / marketing page */}
      <Route path="/glucochat" element={<LandingPage />} />

      {/* App shell */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/social" element={<Social />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/log" element={<Log />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/customize" element={<Customize />} />
      </Route>
    </Routes>
  );
}

export default App;

