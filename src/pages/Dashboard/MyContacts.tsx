import React from "react";

const MyContacts: React.FC = () => {
    const contacts = [
    { id: "c1", name: "Adi", role: "Producer" },
    { id: "c2", name: "Gabriela", role: "Singer" },
    ];
    
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
            </ul>
        </div>
    );
};

export default MyContacts;