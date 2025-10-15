import React, { useState } from 'react';

// --- Utility Functions ---

// EXTENDED TIME SLOTS: 9:00 to 00:00 (Midnight)
const generateTimeSlots = () => {
    const slots = [];
    // Loop from 9 AM (9) to 11 PM (23) for the last 23:30 slot
    for (let hour = 9; hour <= 23; hour++) {
        const paddedHour = hour < 10 ? `0${hour}` : `${hour}`;
        slots.push(`${paddedHour}:00`);
        slots.push(`${paddedHour}:30`);
    }
    // Add 00:00 for the end of the day
    slots.push('00:00'); 
    return slots;
};

// GENERATE DATES FOR MULTIPLE WEEKS (4 weeks total)
const getDatesForWeeks = (weeks = 4) => {
    const dates = [];
    const today = new Date();
    
    const offset = today.getDay() === 0 ? -6 : 1 - today.getDay();
    const currentMonday = new Date(today.setDate(today.getDate() + offset));

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

// New prop 'isAdmin' is introduced here
const EventPage = ({ eventName = "Weekly Hangout", isAdmin = true }) => {
    const [selectedSlots, setSelectedSlots] = useState({});
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [message, setMessage] = useState(null);

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

    // Handler for the Admin Delete button
    const handleDeleteEvent = (confirm) => {
        if (!confirm) {
            setIsConfirmingDelete(true);
            setMessage(null);
        } else {
            setIsConfirmingDelete(false);
            // In a real application, you would make an API call here.
            setMessage({ type: 'success', text: `Event "${eventName}" has been marked for deletion (Admin action simulated).` });
            console.log(`[ADMIN ACTION] Deleting event: ${eventName}`);
            setTimeout(() => setMessage(null), 5000);
        }
    };
    
    // Custom Alert Component (to replace native alert/confirm)
    const CustomAlert = ({ type, text }) => (
        <div className={`w-full max-w-4xl mx-auto p-4 rounded-lg mb-4 text-white font-medium shadow-lg ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
            {text}
        </div>
    );

    // The height for the Day Header row must be consistent
    const headerHeightClass = "h-[70px]";
    const stickyColWidth = "w-[4.5rem]";

    return (
        <div className="min-h-screen w-screen bg-gray-50 p-4 sm:p-8">
            
            {/* Message Area */}
            {message && <CustomAlert type={message.type} text={message.text} />}
            
            {/* Header and Title */}
            <div className="w-full max-w-4xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center">
                    {eventName}
                    {/* Admin Indicator (Crown Icon) */}
                    {isAdmin && (
                        <span className="ml-3 text-yellow-500" title="Administrator">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                                <path d="M21.94,8.53C21.72,8.42,21.5,8.31,21.28,8.21C20.67,7.91,20,7.74,19.33,7.74H18V4L15.93,6.38L14.77,4.06L13.62,6.38L11.55,4V7.74H10.67C10,7.74,9.33,7.91,8.72,8.21C8.5,8.31,8.28,8.42,8.06,8.53C7.94,8.59,7.81,8.66,7.72,8.74L6.55,9.74L5.38,8.74C5.29,8.66,5.17,8.59,5.06,8.53C4.45,8.23,3.81,8.05,3.17,8.05H3V20H21V8.05H20.83C20.45,8.05,20.07,8.13,19.72,8.29C19.5,8.39,19.28,8.5,19.06,8.61C18.94,8.67,18.81,8.74,18.72,8.82L17.55,9.82L16.38,8.82C16.29,8.74,16.17,8.67,16.06,8.61C15.94,8.55,15.83,8.48,15.72,8.42C15.11,8.12,14.45,7.94,13.83,7.94H13V15.26H11V7.94H10.17C9.55,7.94,8.89,8.12,8.28,8.42C8.17,8.48,8.06,8.55,7.94,8.61C7.83,8.67,7.72,8.74,7.62,8.82L6.45,9.82L5.28,8.82C5.17,8.74,5.06,8.67,4.94,8.61C4.83,8.55,4.72,8.48,4.61,8.42C4,8.12,3.33,7.94,2.67,7.94H2V20H22V8.05H21.94Z"/>
                            </svg>
                        </span>
                    )}
                </h1>
                <p className="text-lg text-gray-600">Select all days and times you are available over the next 4 weeks.</p>
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
                        // The grid now only spans ALL event days (28)
                        style={{ gridTemplateColumns: `repeat(${eventDays.length}, 1fr)` }} 
                    >

                        {/* Day Headers (Week Day + Date) */}
                        {eventDays.map(day => (
                            <div 
                                key={day.fullDate} 
                                // The day headers stick to the top when the page scrolls down
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
                {isAdmin && (
                    <button
                        onClick={() => handleDeleteEvent(false)} // Open confirmation view
                        className="py-3 px-8 rounded-lg shadow-md text-lg font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out transform hover:scale-[1.01]"
                    >
                        Delete Event
                    </button>
                )}

                {/* Submit Availability Button */}
                <button
                    className="py-3 px-8 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:scale-[1.01]"
                >
                    Submit Availability
                </button>
            </div>
            
            {/* Delete Confirmation Modal/Message (Conditional) */}
            {isConfirmingDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
                        <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to permanently delete {eventName}? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsConfirmingDelete(false)}
                                className="py-2 px-4 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteEvent(true)}
                                className="py-2 px-4 rounded-lg text-white bg-red-600 hover:bg-red-700 transition duration-150"
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
