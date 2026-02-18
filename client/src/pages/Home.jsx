import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import { useAuth } from "../context/authContext";

export function MyButton() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateEvent = async () => {
    const title = document.getElementById("eventName").value;
    const description = document.getElementById("descriptionName").value;

    if (!title.trim()) {
      setError("Event name is required");
      return;
    }

    if (!token) {
      setError("You must be logged in to create an event");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const event = await response.json();
      navigate(`/event/${event.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <button
        onClick={handleCreateEvent}
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-[1.01] disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Event"}
      </button>
    </>
  );
}

const Home = () => {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        {/* Title/Header */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Event Creator ✨
        </h1>

        {/* Event Name Input */}
        <div>
          <label
            htmlFor="eventName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Event Name
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            placeholder="Enter your event name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 text-base"
          />
        </div>

        <div>
          <label
            htmlFor="descriptionName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="descriptionName"
            name="descriptionName"
            placeholder="Enter description here"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 text-base"
            rows="4"
          />
        </div>

        {/* Create Event Button */}
        <MyButton></MyButton>
        {/* Optional Minimalistic Footer/Note */}
        <p className="text-center text-xs text-gray-400 pt-2">
          Powered by t0pa
        </p>
      </div>
    </div>
  );
};

export default Home;
