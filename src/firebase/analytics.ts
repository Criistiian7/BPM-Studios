import { doc, increment, updateDoc } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { analytics, db } from "../firebase";

type EntityType = "studio" | "artist";

const SESSION_KEY_PREFIX = "viewed";

function getCollectionName(entityType: EntityType): "users" | "studios" {
  return entityType === "studio" ? "studios" : "users";
}

export async function trackView(
  viewerId: string,
  entityType: EntityType,
  entityId: string,
): Promise<void> {
  if (!viewerId || !entityId) return;

  const sessionKey = `${SESSION_KEY_PREFIX}_${viewerId}_${entityType}_${entityId}`;
  if (sessionStorage.getItem(sessionKey)) return;

  const analyticsInstance = await analytics;
  if (analyticsInstance) {
    logEvent(analyticsInstance, `${entityType}_view`, { entity_id: entityId });
  }

  const collectionName = getCollectionName(entityType);
  const entityRef = doc(db, collectionName, entityId);
  await updateDoc(entityRef, { totalViews: increment(1) });
  sessionStorage.setItem(sessionKey, "1");
}
