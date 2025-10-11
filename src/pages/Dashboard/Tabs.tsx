import React, { useState } from "react";
import MyTracks from "./MyTracks";
import MyContacts from "./MyContacts";
import ConnectionRequests from "./ConnectionRequests";
import { FiMusic, FiUsers, FiUserPlus } from "react-icons/fi";

type TabType = "tracks" | "contacts" | "requests";

const Tabs: React.FC = () => {
  const [active, setActive] = useState<TabType>("tracks");

  const tabClass = (tab: TabType) => `
    flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all
    ${active === tab
      ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400"
      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
    }
  `;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors">
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2">
        <button
          type="button"
          className={tabClass("tracks")}
          onClick={() => setActive("tracks")}
        >
          <FiMusic />
          <span>Tracks</span>
        </button>
        <button
          type="button"
          className={tabClass("contacts")}
          onClick={() => setActive("contacts")}
        >
          <FiUsers />
          <span>Contacte</span>
        </button>
        <button
          type="button"
          className={tabClass("requests")}
          onClick={() => setActive("requests")}
        >
          <FiUserPlus />
          <span>Cereri</span>
        </button>
      </div>

      <div className="p-6">
        {active === "tracks" && <MyTracks />}
        {active === "contacts" && <MyContacts />}
        {active === "requests" && <ConnectionRequests />}
      </div>
    </div>
  );
};

export default Tabs;