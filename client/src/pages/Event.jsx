import React, { useState, useEffect } from 'react';

// --- Configuration and Utility Functions ---

// *** REAL API CONFIGURATION ***
const API_BASE_URL = 'https://api.youreventscheduler.com'; 
const EVENT_ID = 'event_123'; // *** CRITICAL: In a real app, this comes from the URL (e.g., /events/event_123) ***

// --- Event Ownership Configuration (No login needed) ---
// The key stored in local storage must be unique per event!
const ADMIN_OWNERSHIP_PREFIX = 'admin_ownership_'; 

// Helper to create the unique key for this event
const getAdminKey = (eventId) => `${ADMIN_OWNERSHIP_PREFIX}${eventId}`;

// Helper function to check admin status from local storage
const checkEventOwnership = (eventId) => {
    const key = getAdminKey(eventId);
    // We only check for the existence of the specific ownership token for this event.
    try {
        // Returns true if the key exists, false otherwise.
        return !!localStorage.getItem(key);
    } catch (e) {
        console.error("localStorage access failed:", e);
        return false;
    }
};

// Generate a new unique token (UUID) when an event is "created"
const generateOwnershipToken = () => {
    // Generates a strong, unique, unguessable string (e.g., "a1b2c3d4-e5f6-...")
    return crypto.randomUUID();
};


// EXTENDED TIME SLOTS: 9:00 to 00:00 (Midnight)
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 23; hour++) {
        const paddedHour = hour < 10 ? `0${hour}` : `${hour}`;
        slots.push(`${paddedHour}:00`);
        
    }
    slots.push('00:00'); 
    return slots;
};

// GENERATE DATES FOR MULTIPLE WEEKS (4 weeks total)
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
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateString = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });

        dates.push({
            fullDate: date.toISOString().split('T')[0],
            displayDay: dayName,
            displayDate: dateString,
        });
    }
    return dates;
};

// --- Component Definition ---

const timeSlots = generateTimeSlots();
const eventDays = getDatesForWeeks(4); 

const EventPage = ({ eventName = "Weekly Hangout" }) => {
    const [selectedSlots, setSelectedSlots] = useState({});
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    
    // Check ownership for THIS SPECIFIC EVENT_ID on load
    const [isUserAdmin, setIsUserAdmin] = useState(() => checkEventOwnership(EVENT_ID));

    useEffect(() => {
        console.log(`Component mounted. Admin key for this event is: ${getAdminKey(EVENT_ID)}`);
    }, []);


    // --- Admin Logic (Simulated Event Creation/Ownership Grant) ---
    const handleAdminLogin = () => {
        try {
            // 1. Generate a unique token for this event
            const ownershipToken = generateOwnershipToken(); 
            const key = getAdminKey(EVENT_ID);

            // 2. Store the token under the event-specific key
            localStorage.setItem(key, ownershipToken);
            
            setIsUserAdmin(true);
            setMessage({ type: 'success', text: `Ownership granted for ${EVENT_ID}. Token stored locally.` });
            setTimeout(() => setMessage(null), 3000);
        } catch (e) {
            setMessage({ type: 'error', text: 'Error: Cannot set ownership token in local storage.' });
        }
    };

    // Handler for removing ownership
    const handleAdminLogout = () => {
        try {
            const key = getAdminKey(EVENT_ID);
            localStorage.removeItem(key);
            setIsUserAdmin(false);
            setMessage({ type: 'error', text: 'Event ownership removed from this browser.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (e) {
             setMessage({ type: 'error', text: 'Error: Cannot remove ownership token from local storage.' });
        }
    };
    
    // --- Data Submission Logic (Connecting to Backend) ---
    const handleSubmitAvailability = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setMessage({ type: 'info', text: 'Submitting your availability...' });
        
        const availabilityData = Object.keys(selectedSlots).filter(key => selectedSlots[key]);

        try {
            // In a real app, this API call would happen
            const response = await fetch(`${API_BASE_URL}/api/events/${EVENT_ID}/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'anonymous_user_abc', // Placeholder for non-logged-in user identifier
                    slots: availabilityData,
                }),
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || `Server responded with status ${response.status}`);
            }

            setMessage({ type: 'success', text: 'Availability submitted successfully! Thank you.' });

        } catch (error) {
            console.error("Submission failed:", error);
            setMessage({ type: 'error', text: `Submission failed: ${error.message}. Please try again.` });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };


    // --- Admin Delete Logic (Connecting to Backend) ---
    const handleDeleteEvent = async (confirm) => {
        if (!isUserAdmin) return;
        
        if (!confirm) {
            setIsConfirmingDelete(true);
            setMessage(null);
            return;
        }

        setIsConfirmingDelete(false);
        setIsSubmitting(true);
        setMessage({ type: 'info', text: `Deleting event: ${eventName}...` });

        try {
            // Get the ownership token for verification on the backend
            const ownershipToken = localStorage.getItem(getAdminKey(EVENT_ID));

            // The backend MUST verify this token against the one stored in its database for EVENT_ID
            const response = await fetch(`${API_BASE_URL}/api/events/${EVENT_ID}`, {
                method: 'DELETE',
                headers: {
                    // Send the ownership token for verification
                    'X-Event-Owner-Token': ownershipToken, 
                },
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || `Server responded with status ${response.status}`);
            }

            // Success - Also remove the local ownership token after deletion
            handleAdminLogout(); // Clears local storage token
            setMessage({ type: 'success', text: `Event "${eventName}" successfully deleted from the server.` });

        } catch (error) {
            console.error("Deletion failed:", error);
            setMessage({ type: 'error', text: `Deletion failed: ${error.message}.` });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    // --- UI/Helper Logic ---
    const toggleSlot = (fullDate, time) => {
        const key = `${fullDate}-${time}`;
        setSelectedSlots(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const isSelected = (fullDate, time) => {
        return selectedSlots[`${fullDate}-${time}`];
    };

    const getSlotClass = (fullDate, time) => {
        const base = "h-6 sm:h-8 border border-gray-200 cursor-pointer transition duration-150 ease-in-out";
        if (isSelected(fullDate, time)) {
            return `${base} bg-indigo-500 hover:bg-indigo-600`;
        }
        return `${base} bg-white hover:bg-gray-100`;
    };
    
    // Custom Alert Component
    const CustomAlert = ({ type, text }) => (
        <div className={`w-full max-w-4xl mx-auto p-4 rounded-lg mb-4 text-white font-medium shadow-lg ${
            type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`}>
            {text}
        </div>
    );

    const headerHeightClass = "h-[70px]";
    const stickyColWidth = "w-[4.5rem]";

    return (
        <div className="min-h-screen w-screen bg-gray-50 p-4 sm:p-8">
            
            {/* Message Area */}
            {message && <CustomAlert type={message.type} text={message.text} />}
            
            {/* Header and Title */}
            <div className="w-full max-w-4xl mx-auto mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center">
                    {eventName}
                    {/* Admin Indicator (Crown Icon) */}
                    {isUserAdmin && (
                        <span className="ml-3 text-yellow-500" title="Event Owner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                                <path d="M21.94,8.53C21.72,8.42,21.5,8.31,21.28,8.21C20.67,7.91,20,7.74,19.33,7.74H18V4L15.93,6.38L14.77,4.06L13.62,6.38L11.55,4V7.74H10.67C10,7.74,9.33,7.91,8.72,8.21C8.5,8.31,8.28,8.42,8.06,8.53C7.94,8.59,7.81,8.66,7.72,8.74L6.55,9.74L5.38,8.74C5.29,8.66,5.17,8.59,5.06,8.53C4.45,8.23,3.81,8.05,3.17,8.05H3V20H21V8.05H20.83C20.45,8.05,20.07,8.13,19.72,8.29C19.5,8.39,19.28,8.5,19.06,8.61C18.94,8.67,18.81,8.74,18.72,8.82L17.55,9.82L16.38,8.82C16.29,8.74,16.17,8.67,16.06,8.61C15.94,8.55,15.83,8.48,15.72,8.42C15.11,8.12,14.45,7.94,13.83,7.94H13V15.26H11V7.94H10.17C9.55,7.94,8.89,8.12,8.28,8.42C8.17,8.48,8.06,8.55,7.94,8.61C7.83,8.67,7.72,8.74,7.62,8.82L6.45,9.82L5.28,8.82C5.17,8.74,5.06,8.67,4.94,8.61C4.83,8.55,4.72,8.48,4.61,8.42C4,8.12,3.33,7.94,2.67,7.94H2V20H22V8.05H21.94Z"/>
                            </svg>
                        </span>
                    )}
                </h1>
                <p className="text-lg text-gray-600">Select all days and times you are available over the next 4 weeks.</p>
                
                {/* Simulated Admin Control for demonstration */}
                <div className="mt-4 flex space-x-3">
                    {!isUserAdmin ? (
                        <button 
                            onClick={handleAdminLogin}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                            title="Simulates event creation and saving the unique ownership token."
                            disabled={isSubmitting}
                        >
                            Simulate Event Creation/Owner Access
                        </button>
                    ) : (
                        <button 
                            onClick={handleAdminLogout}
                            className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                            title="Removes the ownership token from local storage."
                            disabled={isSubmitting}
                        >
                            Remove Owner Access
                        </button>
                    )}
                </div>

            </div>

            {/* NEW STRUCTURE: Flex container for the sticky column and the scrollable grid */}
            <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg flex">
                
                {/* 1. STICKY TIME LABELS COLUMN */}
                <div 
                    className="flex-shrink-0 sticky top-0 bg-white z-30 border-r border-gray-200"
                >
                    {/* Top-Left Empty Corner Header - Width updated */}
                    <div className={`p-2 border-b-2 border-gray-200 ${headerHeightClass} flex items-end justify-end ${stickyColWidth}`}></div> 

                    {/* Time Labels - Width updated */}
                    {timeSlots.map(time => (
                        <div 
                            key={time}
                            className={`px-2 py-1 text-xs text-gray-500 font-medium text-right h-6 sm:h-8 flex items-center justify-end ${stickyColWidth}`}
                        >
                            {time}
                        </div>
                    ))}
                </div>


                {/* 2. SCROLLABLE DATE GRID CONTAINER */}
                <div className="overflow-x-auto flex-grow"> 

                    <div 
                        className="grid"
                        style={{ gridTemplateColumns: `repeat(${eventDays.length}, 1fr)` }} 
                    >

                        {/* Day Headers (Week Day + Date) */}
                        {eventDays.map(day => (
                            <div 
                                key={day.fullDate} 
                                className={`p-2 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-200 w-24 flex-shrink-0 sticky top-0 bg-white z-20 flex flex-col justify-end ${headerHeightClass}`}
                            >
                                <div className="text-xs text-indigo-600">{day.displayDay}</div>
                                <div className="text-sm">{day.displayDate}</div>
                            </div>
                        ))}
                        
                        {/* Time Slots for ALL Days (28 cells per time slot row) */}
                        {timeSlots.map(time => (
                            <React.Fragment key={time}>
                                {eventDays.map(day => (
                                    <div
                                        key={`${day.fullDate}-${time}`}
                                        className={`${getSlotClass(day.fullDate, time)} w-24 flex-shrink-0`}
                                        onClick={() => toggleSlot(day.fullDate, time)}
                                        title={`Click to toggle availability for ${day.displayDate} at ${time}`}
                                    >
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Footer Buttons */}
            <div className="w-full max-w-4xl mx-auto mt-8 flex justify-end space-x-4">
                
                {/* Admin: Delete Event Button (Conditional) */}
                {isUserAdmin && (
                    <button
                        onClick={() => handleDeleteEvent(false)}
                        className="py-3 px-8 rounded-lg shadow-md text-lg font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out transform hover:scale-[1.01] disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Delete Event
                    </button>
                )}

                {/* Submit Availability Button */}
                <button
                    onClick={handleSubmitAvailability}
                    className="py-3 px-8 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        "Submit Availability"
                    )}
                </button>
            </div>
            
            {/* Delete Confirmation Modal/Message (Conditional) */}
            {isConfirmingDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
                        <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to permanently delete **{eventName}**? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsConfirmingDelete(false)}
                                className="py-2 px-4 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-150"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteEvent(true)}
                                className="py-2 px-4 rounded-lg text-white bg-red-600 hover:bg-red-700 transition duration-150"
                                disabled={isSubmitting}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventPage;
