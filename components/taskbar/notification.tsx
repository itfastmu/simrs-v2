import { useEffect, useState, useRef } from 'react';
import { MdNotifications } from 'react-icons/md';

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    "Notifikasi 1",
    "Notifikasi 2",
    "Notifikasi 3"
    // Tambahkan notifikasi lain di sini
  ]);
  const panelRef = useRef<HTMLDivElement>(null);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    console.log(panelRef.current,event.target)
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block ml-5">
      <MdNotifications
        size="1.8rem"
        className="inline fill-amber-500 hover:cursor-pointer hover:fill-amber-400"
        onClick={togglePanel}
      />
      {notifications.length > 0 && (
        <div className="absolute top-0 right-0 bg-blue-700 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
          {notifications.length}
        </div>
      )}
      {isOpen && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold">Notifikasi</h3>
            <ul>
              <li className="mt-2 p-2 bg-gray-100 rounded hover:bg-gray-200">
                Notifikasi 1
              </li>
              <li className="mt-2 p-2 bg-gray-100 rounded hover:bg-gray-200">
                Notifikasi 2
              </li>
              <li className="mt-2 p-2 bg-gray-100 rounded hover:bg-gray-200">
                Notifikasi 3
              </li>
              {/* Tambahkan notifikasi lain di sini */}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
