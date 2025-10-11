import React, { useState } from "react";
import MyTracks from "./MyTracks";
import MyContacts from "./MyContacts";
import ConnectionRequests from "./ConnectionRequests";

const Tabs: React.FC = () => {
    const [active, setActive] = useState<"tracks" | "contacts" | "requests">("tracks");

    const tabClass = (t:string) => `px-4 py-2 rounded-t ${active===t ? 
        "bg-white border-t border-l border-r border-gray-200 mb-px" : 
        "text-gray-600 hover:text-gray-900"}`;

        return (
            <div className="bg-white rounded shadow">
                <div className="flex space-x-2 border-b bg-gray-50">
                    <button type="button" className={tabClass("tracks")} 
                    onClick={() => setActive("tracks")}>Tracks</button>
                    <button type="button" className={tabClass("contacts")} 
                    onClick={() => setActive("contacts")}>Contacts</button>
                    <button type="button" className={tabClass("requests")} 
                    onClick={() => setActive("requests")}>Requests</button>
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