import React, { useEffect, useState } from "react";
import { getRequests, acceptRequest } from "../../api";

const ConnectionRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  useEffect(() => {
    getRequests()
      .then(setRequests)
      .catch(() => {});
  }, []);

  const handleAccept = async (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await acceptRequest(id);
    } catch (err) {
      const fresh = await getRequests();
      setRequests(fresh);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Cererile de Connectare</h3>
      <ul className="space-y-3">
        {requests.map((r) => (
          <li
            key={r.id}
            className="p-3 border rounded flex 
                    justify-between items-center"
          >
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-gray-500">
                {r.mutual} conexiuni comune
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(r.id)}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Accept
              </button>
              <button className="px-3 py-1 bg-gray-200 rounded">Refuz</button>
            </div>
          </li>
        ))}
        {requests.length === 0 && (
          <li className="text-gray-500">No requests</li>
        )}
      </ul>
    </div>
  );
};

export default ConnectionRequests;
