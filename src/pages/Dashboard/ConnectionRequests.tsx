import React from "react";

const ConnectionRequests: React.FC = () => {
    const requests = [
        { id: "r1", name: "Mihai", mutual: 3 },
        { id: "r2", name: "Ioana", mutual: 1 },
    ];

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">Cererile de Connectare</h3>
            <ul className="space-y-3">
                {requests.map(r => (
                    <li key={r.id} className="p-3 border rounded flex 
                    justify-between items-center">
                    <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-sm text-gray-500">{r.mutual} conexiuni comune</div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-500 text-white rounded">Accept</button>
                        <button className="px-3 py-1 bg-gray-200 rounded">Refuz</button>
                        </div>
                    </li>
                ))}
                </ul>
                </div>
    );
};

export default ConnectionRequests;