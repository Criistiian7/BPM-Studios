import React from "react";

const MyTracks: React.FC = () => {

    const tracks = [
        { id: "1", title: "Beat One", bpm: 120 },
        { id: "2", title: "Chill Loop", bpm: 90 },
    ];

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">My Tracks</h3>
            <ul className="space-y-3">
                {tracks.map(t => (
                    <li key={t.id} className="p-3 border rounded flex 
                    justify-between items-center">
                    <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-sm text-gray-500">BPM: {t.bpm}</div>
                        </div>
                        <div className="text-sm text-gray-600">Actions</div>
                        </li>
                ))}
                </ul>
                </div>
    );
};

export default MyTracks;