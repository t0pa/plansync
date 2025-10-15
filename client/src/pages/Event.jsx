import React, { useState } from 'react';

// --- Utility Functions ---

// EXTENDED TIME SLOTS: 9:00 to 00:00 (Midnight)
const generateTimeSlots = () => {
    const slots = [];
    // Loop from 9 AM (9) to 11 PM (23) for the last 23:30 slot
    for (let hour = 9; hour <= 24; hour++) {
        const paddedHour = hour < 10 ? `0${hour}` : `${hour}`;
        slots.push(`${paddedHour}:00`);
        
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

const EventPage = ({ eventName = "Weekly Hangout" }) => {
    const [selectedSlots, setSelectedSlots] = useState({});

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

    // The height for the Day Header row must be consistent
    const headerHeightClass = "h-[70px]";

    return (
        <div className="min-h-screen w-screen bg-gray-50 p-4 sm:p-8">
            
            {/* Header and Title */}
            <div className="w-full max-w-4xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{eventName}</h1>
                <p className="text-lg text-gray-600">Select all days and times you are available over the next 4 weeks.</p>
            </div>  

            {/* NEW STRUCTURE: Flex container for the sticky column and the scrollable grid */}
            <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg flex">
                
                {/* 1. STICKY TIME LABELS COLUMN */}
                <div 
                    // This column is sticky to the page scroll (top-0) and has highest Z-index
                    className="flex-shrink-0 sticky top-0 bg-white z-30 border-r border-gray-200"
                >
                    {/* Top-Left Empty Corner Header - MUST match the height of the main grid's header */}
                    <div className={`p-2 border-b-2 border-gray-200 ${headerHeightClass} flex items-end justify-end w-[3rem]`}></div> 

                    {/* Time Labels */}
                    {timeSlots.map(time => (
                        <div 
                            key={time}
                            className="px-2 py-1 text-xs text-gray-500 font-medium text-right h-6 sm:h-8 flex items-center justify-end w-[3rem]"
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
            
            {/* Submit Button */}
            <div className="w-full max-w-4xl mx-auto mt-8 flex justify-end">
                <button
                    className="py-3 px-8 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:scale-[1.01]"
                >
                    Submit Availability
                </button>
            </div>
        </div>
    );
};

export default EventPage;