import  { useEffect, useState } from "react";
import { getUserNotifications } from "../services/api";
import { FaBell } from "react-icons/fa"; // Bell icon from react-icons

interface Notification {
  heading:string;
  for:string;
  description:string;
  _id:string
}

const NotificationButton = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Fetch notifications when the component is mounted
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getUserNotifications();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    fetchNotifications();
  }, []);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button 
        onClick={toggleNotifications}
        className="p-2 bg-gray-200 rounded-full fixed top-4 right-4 shadow-lg hover:bg-gray-300"
      >
        <FaBell size={24} />
      </button>
      
      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute top-12 right-4 w-80 bg-white border rounded-md shadow-lg">
          <h3 className="font-semibold text-lg p-4 border-b">Notifications</h3>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={index} className="px-4 py-2 hover:bg-gray-100">
                  <h4 className="font-semibold">{notification.heading}</h4>
                  <p>{notification.description}</p>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
