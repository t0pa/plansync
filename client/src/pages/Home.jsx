import React, { useState, useEffect } from "react";
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
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events`);
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();

        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.userId || payload.sub;
            setEvents(data.filter((e) => e.userId === userId));
          } catch (err) {
            setEvents([]);
          }
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [token]);
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        {/* Title/Header */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Event Creator ✨
        </h1>

        {/* Header row with + button to open creator modal */}
        <div className="flex items-center justify-between">
          <div></div>
          <button
            onClick={() => setShowCreator(true)}
            aria-label="Create event"
            className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-2xl font-bold shadow-lg"
          >
            +
          </button>
        </div>

        {/* Creator Modal */}
        {showCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Create Event
                </h3>
                <button
                  onClick={() => setShowCreator(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="eventName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Event Name
                  </label>
                  <input
                    id="eventName"
                    name="eventName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Enter your event name"
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
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Enter description here"
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreator(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <div className="flex-1">
                    <MyButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* My Events Overview */}
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            My Events
          </h2>
          {!token ? (
            <p className="text-sm text-gray-500">Log in to see your events.</p>
          ) : loadingEvents ? (
            <p className="text-sm text-gray-500">Loading your events...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500">You have no events yet.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                >
                  <Link to={`/event/${ev.id}`} className="flex flex-col">
                    <span className="font-bold text-gray-900">{ev.title}</span>
                    {ev.description && (
                      <span className="text-sm text-gray-500">
                        {ev.description}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Optional Minimalistic Footer/Note */}
        <p className="text-center text-xs text-gray-400 pt-2">
          Powered by t0pa
        </p>
      </div>
    </div>
  );
};

export default Home;
