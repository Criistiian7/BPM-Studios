import { rest } from "msw";

let tracks = [
    { id: "t1", title: "Beat One", bpm: 120, ownerId: "demo-1" },
    { id: "t2", title: "Chill Loop", bpm: 90, ownerId: "demo-1" },
];

let contacts = [ 
    { id: "c1", name: "Adi", role: "Producer", userId: "demo-1" },
];

let requests = [
    { id: "r1", name: "Mihai", mutual: 2, toUserId: "demo-1" },
];

export const handlers = [
    // Tracks
    rest.get("/api/tracks", (req, res, ctx) => {
        const owner = req.url.searchParams.get("ownerId");
    const result = owner ? tracks.filter(t => t.ownerId === owner) : tracks;
    return res(ctx.status(200), ctx.json(result));
  }),
  // create track
  rest.post("/api/tracks", async (req, res, ctx) => {
    const body = await req.json();
    const newTrack = { id: `t${Date.now()}`, ...body };
    tracks.push(newTrack);
    return res(ctx.status(201), ctx.json(newTrack));
  }),
  // contacts
  rest.get("/api/contacts", (req, res, ctx) => res(ctx.status(200), ctx.json(contacts))),
  // requests
  rest.get("/api/requests", (req, res, ctx) => res(ctx.status(200), ctx.json(requests))),
  rest.post("/api/requests/:id/accept", (req, res, ctx) => {
    const { id } = req.params as any;
    requests = requests.filter(r => r.id !== id);
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
];