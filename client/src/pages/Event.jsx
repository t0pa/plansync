import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import { useAuth } from "../context/authContext";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 23; hour++) {
    const padded = hour < 10 ? `0${hour}` : `${hour}`;
    slots.push(`${padded}:00`);
  }
  slots.push("00:00");
  return slots;
};

const getDatesForWeeks = (weeks = 4) => {
  const dates = [];
  const today = new Date();
  const day = today.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + offset);

  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(currentMonday);
    date.setDate(currentMonday.getDate() + i);
    dates.push({
      fullDate: date.toISOString().split("T")[0],
      displayDay: date.toLocaleDateString("en-US", { weekday: "short" }),
      displayDate: date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
      }),
    });
  }
  return dates;
};

const timeSlots = generateTimeSlots();
const eventDays = getDatesForWeeks(4);

const EventPage = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [event, setEvent] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [mySubmissionSlots, setMySubmissionSlots] = useState({});

  // Quick Access State
  const [activePresetDay, setActivePresetDay] = useState(eventDays[0].fullDate);

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchEventAndAvailabilities = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
      if (!res.ok) throw new Error("Event not found");
      const data = await res.json();
      setEvent(data);

      if (data.availabilities) {
        setAvailabilities(data.availabilities);
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId = payload.userId || payload.sub;
          const mine = data.availabilities.find((a) => a.userId === userId);
          if (mine) {
            const map = {};
            const slotsArr = Array.isArray(mine.times)
              ? mine.times
              : mine.times?.split(",") || [];
            slotsArr.forEach((s) => (map[s] = true));
            setMySubmissionSlots(map);
          }
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchEventAndAvailabilities();
  }, [fetchEventAndAvailabilities]);

  const toggleSlot = (fullDate, time) => {
    const key = `${fullDate}-${time}`;
    setSelectedSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMouseDown = (fullDate, time) => {
    setIsDragging(true);
    setDragStart({ fullDate, time });
    toggleSlot(fullDate, time);
  };

  const handleMouseEnter = (fullDate, time) => {
    if (!isDragging || !dragStart || fullDate !== dragStart.fullDate) return;
    const startIdx = timeSlots.indexOf(dragStart.time);
    const endIdx = timeSlots.indexOf(time);
    const [min, max] = [startIdx, endIdx].sort((a, b) => a - b);
    const newSlots = { ...selectedSlots };
    for (let i = min; i <= max; i++) {
      newSlots[`${fullDate}-${timeSlots[i]}`] = true;
    }
    setSelectedSlots(newSlots);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const applyPreset = (type) => {
    const newSlots = { ...selectedSlots };
    let targetHours = [];
    if (type === "morning") targetHours = ["08:00", "09:00", "10:00", "11:00"];
    if (type === "evening") targetHours = ["17:00", "18:00", "19:00", "20:00"];
    if (type === "night") targetHours = ["21:00", "22:00", "23:00", "00:00"];

    targetHours.forEach((time) => {
      newSlots[`${activePresetDay}-${time}`] = true;
    });
    setSelectedSlots(newSlots);
  };

  const handleSubmitAvailability = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const slots = Object.keys(selectedSlots).filter((k) => selectedSlots[k]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slots }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setMessage({ type: "success", text: "Availability updated!" });
      setSelectedSlots({});
      fetchEventAndAvailabilities();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete event");
      setMessage({ type: "success", text: "Event deleted successfully!" });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setIsDeleting(false);
    }
  };

  const getSlotCounts = () => {
    const counts = {};
    availabilities.forEach((avail) => {
      const slots = Array.isArray(avail.times)
        ? avail.times
        : avail.times?.split(",") || [];
      slots.forEach((s) => {
        if (s) counts[s] = (counts[s] || 0) + 1;
      });
    });
    return counts;
  };

  const slotCounts = getSlotCounts();
  const maxParticipants = availabilities.length;

  if (loading)
    return <div className="p-8 font-medium">Loading event grid...</div>;
  if (!event) return <div className="p-8 text-red-600">Event not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-48">
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded shadow-lg text-white ${message.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {message.text}
          <button className="ml-4 underline" onClick={() => setMessage(null)}>
            Close
          </button>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delete Event
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              {event.title}
            </h1>
            <p className="text-gray-600 mt-2">{event.description}</p>
          </div>
          {token &&
            (() => {
              const payload = JSON.parse(atob(token.split(".")[1]));
              const userId = payload.userId || payload.sub;
              return userId === event.userId ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Delete Event
                </button>
              ) : null;
            })()}
        </div>
      </header>

      {/* QUICK ACCESS BAR - TOP OF TABLE */}
      <div className="max-w-7xl mx-auto mb-4 bg-white border border-gray-200 p-3 rounded-xl shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex flex-col border-r pr-4 border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Select Date
          </span>
          <select
            value={activePresetDay}
            onChange={(e) => setActivePresetDay(e.target.value)}
            className="text-sm font-bold text-indigo-600 bg-transparent outline-none cursor-pointer"
          >
            {eventDays.map((d) => (
              <option key={d.fullDate} value={d.fullDate}>
                {d.displayDay} {d.displayDate}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {["morning", "evening", "night"].map((type) => (
            <button
              key={type}
              onClick={() => applyPreset(type)}
              className="px-4 py-1.5 bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-700 rounded-lg text-xs font-bold uppercase transition-all border border-gray-100"
            >
              {type}
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedSlots({});
              setMySubmissionSlots({});
            }}
            className="px-4 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 rounded-lg text-xs font-bold uppercase transition-all border border-red-100"
          >
            Deselect All
          </button>
        </div>
        <span className="text-[10px] text-gray-400 font-medium italic ml-auto">
          Click presets to auto-fill the selected date
        </span>
      </div>

      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto relative" onMouseLeave={handleMouseUp}>
          <div className="inline-block min-w-full">
            <div
              className="grid gap-0"
              style={{
                gridTemplateColumns: `80px repeat(${eventDays.length}, minmax(100px, 1fr))`,
              }}
            >
              <div className="bg-gray-100 border-b border-r p-4 sticky left-0 z-20 font-bold text-gray-500 text-xs uppercase">
                Time
              </div>
              {eventDays.map((day) => (
                <div
                  key={day.fullDate}
                  className="bg-gray-100 border-b p-3 text-center min-w-[100px]"
                >
                  <div className="text-xs text-gray-500 uppercase">
                    {day.displayDay}
                  </div>
                  <div className="font-bold text-gray-800">
                    {day.displayDate}
                  </div>
                </div>
              ))}
              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  <div className="bg-gray-50 border-r border-b p-3 sticky left-0 z-10 text-center text-sm font-semibold text-gray-600 italic">
                    {time}
                  </div>
                  {eventDays.map((day) => {
                    const keyId = `${day.fullDate}-${time}`;
                    const count = slotCounts[keyId] || 0;
                    const isSelected = !!selectedSlots[keyId];
                    const isMine = !!mySubmissionSlots[keyId];
                    let cellClass = "bg-white hover:bg-gray-50";
                    if (isSelected) cellClass = "bg-indigo-500";
                    else if (isMine) cellClass = "bg-blue-600";
                    else if (count > 0)
                      cellClass =
                        count / (maxParticipants || 1) > 0.5
                          ? "bg-green-500"
                          : "bg-green-200";

                    return (
                      <div
                        key={keyId}
                        onMouseDown={() => handleMouseDown(day.fullDate, time)}
                        onMouseEnter={() =>
                          handleMouseEnter(day.fullDate, time)
                        }
                        onMouseUp={handleMouseUp}
                        className={`h-14 border-b border-r cursor-pointer transition-colors relative ${cellClass}`}
                      >
                        {!isSelected && count > 0 && (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BAR - PURE SUBMIT */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4 flex items-center justify-between z-40">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase">
            Selection
          </span>
          <div className="text-sm font-bold text-indigo-600">
            {Object.values(selectedSlots).filter(Boolean).length} slots chosen
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedSlots({})}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 transition"
          >
            Clear
          </button>
          <button
            onClick={handleSubmitAvailability}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all"
          >
            {isSubmitting ? "Saving..." : "Save My Times"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
