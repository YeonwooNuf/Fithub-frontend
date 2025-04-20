// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./OngoingEvent.css";

// const OngoingEvent = () => {
//   const [ongoingEvent, setOngoingEvent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [hasError, setHasError] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check if we have cached event data and it's less than 5 minutes old
//     const cachedData = localStorage.getItem('cachedEventData');
//     const cachedTime = localStorage.getItem('cachedEventTime');
    
//     const now = new Date().getTime();
//     const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
//     if (cachedData && cachedTime && (now - parseInt(cachedTime) < fiveMinutes)) {
//       try {
//         const events = JSON.parse(cachedData);
//         const activeEvents = events.filter(event => new Date(event.endDate) >= new Date());
        
//         if (activeEvents.length > 0) {
//           setOngoingEvent(activeEvents[0]);
//         }
//         setLoading(false);
//         return; // Exit early, no need to make API call
//       } catch (e) {
//         console.error("Error parsing cached data:", e);
//         // Continue to API call if parsing fails
//       }
//     }

//     // Get token only once
//     const token = localStorage.getItem("token");
    
//     // Only make the request if we have a token
//     if (token) {
//       // Fetch ongoing events
//       axios.get("/api/events", {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//         .then(res => {
//           const events = res.data;
          
//           // Cache the response
//           localStorage.setItem('cachedEventData', JSON.stringify(events));
//           localStorage.setItem('cachedEventTime', now.toString());
          
//           const activeEvents = events.filter(event => new Date(event.endDate) >= new Date());
          
//           // If there are any ongoing events, display the first one
//           if (activeEvents.length > 0) {
//             setOngoingEvent(activeEvents[0]);
//           }
//           setLoading(false);
//         })
//         .catch(err => {
//           console.error("Error fetching events:", err);
//           setLoading(false);
//           setHasError(true);
//         });
//     } else {
//       setLoading(false);
//       setHasError(true);
//     }
//   }, []);

//   const handleViewDetails = () => {
//     if (ongoingEvent) {
//       navigate(`/event`, { state: { selectedEventId: ongoingEvent.id } });
//     }
//   };

//   if (loading) {
//     return <div className="ongoing-event-skeleton"></div>;
//   }

//   if (hasError || !ongoingEvent) {
//     return null; // Don't render anything if there are no ongoing events or if there was an error
//   }

//   return (
//     <div className="ongoing-event-container">
//       <div className="ongoing-event-content">
//         <h2 className="ongoing-event-title">{ongoingEvent.title}</h2>
//         <p className="ongoing-event-description">{ongoingEvent.mainContent}</p>
//         <button 
//           className="ongoing-event-button" 
//           onClick={handleViewDetails}
//         >
//           자세히 보기
//         </button>
//       </div>
//       {ongoingEvent.imageUrl && (
//         <div className="ongoing-event-image-container">
//           <img 
//             src={ongoingEvent.imageUrl} 
//             alt={ongoingEvent.title} 
//             className="ongoing-event-image" 
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default OngoingEvent; 