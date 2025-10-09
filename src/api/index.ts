export async function getTracks(ownerId?: string) {
    const params = ownerId ? `?ownerId=${encodeURIComponent(ownerId)}` : "";
    const res = await fetch(`/api/tracks${params}`);
    if (!res.ok) throw new Error("Failed fetching tracks");
    return res.json();
}

export async function createTrack(payload: 
    { title: string; bpm: number; ownerId: string }) {
        const res = await fetch(`/api/tracks`, { method: "POST", headers: {
            "Content-Type": "application/json" },body: JSON.stringify(payload) });
            if (!res.ok) throw new Error("Failed creating track");
            return res.json();
    }

    export async function getContacts() {
        const res = await fetch("/api/contacts");
        if (!res.ok) throw new Error("Failed fetching contacts");
        return res.json();
    }

    export async function getRequests() {
        const res = await fetch("/api/requests");
        if (!res.ok) throw new Error("Failed fetching requests");
        return res.json();
    }

    export async function acceptRequest(id: string) {
        const res = await fetch(`/api/requests/${id}/accept`, { method: "POST" });
        if (!res.ok) throw new Error("Failed accepting request");
        return res.json();
    }