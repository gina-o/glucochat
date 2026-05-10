import { useState, useEffect } from "react";
import { saveLog, fetchLogs } from "../firebase"; // adjust path as needed
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function InsulinCalculator() {
  const [bloodSugar, setBloodSugar] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [ratio, setRatio] = useState(10);
  const [correctionFactor, setCorrectionFactor] = useState(50);
  const [targetBloodSugar, setTargetBloodSugar] = useState(100);
  const [insulinDose, setInsulinDose] = useState(0);

  const [logHistory, setLogHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadLogs = async () => {
      const logs = await fetchLogs();
      setLogHistory(logs);
    };
    loadLogs();
  }, []);

  const calculateInsulin = async () => {
    const carbInsulin = carbs / ratio;
    const correctionInsulin = (bloodSugar - targetBloodSugar) / correctionFactor;
    const totalInsulin = Math.max(0, carbInsulin + correctionInsulin);
    setInsulinDose(totalInsulin.toFixed(2));

    const timestamp = new Date().toLocaleString();
    const newEntry = {
      bloodSugar,
      carbs,
      ratio,
      correctionFactor,
      targetBloodSugar,
      insulinDose: totalInsulin.toFixed(2),
      timestamp,
    };

    setLogHistory((prevLogs) => [...prevLogs, newEntry]);
    await saveLog(newEntry);
  };

  const fetchRecommendations = async () => {
    if (logHistory.length === 0) return;
    setLoadingRecs(true);
    setRecommendations([]);
    setAiInsights([]);

    const data = logHistory.map((entry) => ({
      timestamp: new Date(entry.timestamp).toISOString(),
      glucose: entry.bloodSugar,
      event: entry.carbs > 0 ? "meal" : "",
    }));

    try {
      const response = await fetch("http://127.0.0.1:8000/get_recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Backend fetch failed");
      const result = await response.json();
      setRecommendations(result.recommendations || []);
      setAiInsights(result.ai_insights || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start justify-center gap-6 p-6">
      {/* Insulin Calculator */}
      <div className="w-full md:w-1/2 p-6 bg-purple-100/30 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Insulin Calculator</h2>
        <div className="space-y-3">
          <label>Blood Sugar (mg/dL)</label>
          <input
            type="number"
            value={bloodSugar}
            onChange={(e) => setBloodSugar(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
          <label>Carbs (g)</label>
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
          <label>Insulin-to-Carb Ratio</label>
          <input
            type="number"
            value={ratio}
            onChange={(e) => setRatio(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
          <label>Correction Factor</label>
          <input
            type="number"
            value={correctionFactor}
            onChange={(e) => setCorrectionFactor(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
          <label>Target Blood Sugar</label>
          <input
            type="number"
            value={targetBloodSugar}
            onChange={(e) => setTargetBloodSugar(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={calculateInsulin}
            className="w-full bg-blue-500 text-white py-2 rounded mt-2"
          >
            Calculate
          </button>
          <p className="text-lg font-semibold mt-2">
            Recommended Insulin Dose: {insulinDose} units
          </p>
        </div>
      </div>

      {/* Log History, AI Insights & Graph */}
<div className="w-full md:w-1/2 p-6 bg-purple-100/30 backdrop-blur-md border border-white/50 rounded-xl shadow-lg">
  <button
    onClick={() => setShowHistory(!showHistory)}
    className="w-full bg-[#E3F2FD] text-black py-2 rounded mb-4"
  >
    {showHistory ? "Hide History & Insights" : "Show History & Insights"}
  </button>

  {showHistory && (
    <>
      {/* Glucose Trends Chart */}
      {logHistory.length > 0 && (
        <div className="mb-4 w-full" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={logHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bloodSugar" fill="#8884d8" name="Glucose" />
              <Bar dataKey="insulinDose" fill="#82ca9d" name="Insulin Dose" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log Entries */}
      <ul className="mt-2 space-y-2 max-h-[300px] overflow-y-auto">
        {logHistory.map((entry, idx) => (
          <li key={idx} className="p-2 border rounded bg-white shadow-md">
            <p><strong>Timestamp:</strong> {entry.timestamp}</p>
            <p><strong>Blood Sugar:</strong> {entry.bloodSugar} mg/dL</p>
            <p><strong>Carbs:</strong> {entry.carbs} g</p>
            <p><strong>Insulin Dose:</strong> {entry.insulinDose} units</p>
          </li>
        ))}
      </ul>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-4 p-4 bg-white shadow-md rounded space-y-2 max-h-[200px] overflow-y-auto">
          <h4 className="font-bold text-lg mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="p-2 border rounded bg-green-50">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="mt-4 p-4 bg-white shadow-md rounded space-y-2 max-h-[200px] overflow-y-auto">
          <h4 className="font-bold text-lg mb-2">AI Insights</h4>
          <ul className="space-y-1">
            {aiInsights.map((insight, idx) => (
              <li key={idx} className="p-2 border rounded bg-yellow-50">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fetch Recommendations Button */}
      <button
        onClick={fetchRecommendations}
        className="w-full bg-[#E3F2FD] text-black py-2 rounded mt-4"
      >
        {loadingRecs ? "Fetching..." : "Update Recommendations"}
      </button>
    </>
  )}
</div>

    </div>
  );
}

