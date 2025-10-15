import React from 'react';

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
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
            Event Name
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            placeholder="e.g., Team Meeting, Birthday Party..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-white text-base"
            // You would use state here in a real React app: value={eventName} onChange={handleChange}
          />
        </div>

        {/* Create Event Button */}
        <button
          // onClick={handleCreateEvent} // Event handler in a real React app
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-[1.01]"
        >
          Create Event
        </button>

        {/* Optional Minimalistic Footer/Note */}
        <p className="text-center text-xs text-gray-400 pt-2">
          Powered by t0pa
        </p>
      </div>
    </div>
  );
};

export default Home;