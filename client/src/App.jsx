import { useState, useEffect } from "react";

function App() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/events")
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  const addEvent = async () => {
    await fetch("http://localhost:4000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    const updated = await fetch("http://localhost:4000/api/events").then(r => r.json());
    setEvents(updated);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PlanSync</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded p-2 flex-1"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Event title..."
        />
        <button
          onClick={addEvent}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {events.map(e => (
          <li key={e.id} className="border p-2 rounded">{e.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
