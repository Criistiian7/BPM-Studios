import React, { useEffect, useState } from "react";
import { getContacts } from "../../api";

const MyContacts: React.FC = () => {
    const [contacts, setContacts] = useState<any[]>([]);
    useEffect(()=>{ getContacts().then(setContacts).catch(()=>{}) }, []);
    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">My Contacts</h3>
            <ul className="space-y-3">
                {contacts.map(c => (
                    <li key={c.id} className="p-3 border rounded flex 
                    justify-between items-center">
                    <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-sm text-gray-500">{c.role}</div>
                    </div>
                    <div className="text-sm text-gray-600">Message</div>    
                    </li>
                ))}
                {contacts.length===0 && <li className="text-gray-500">No contacts yet</li>}
            </ul>
        </div>
    );
};

export default MyContacts;