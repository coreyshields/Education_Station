(() => {
  const STORAGE_KEY = "education-station.letter-adventure.events.v1";
  const SCHEMA_VERSION = 1;
  const MAX_EVENTS = 1000;
  let sessionId = null;
  let memoryEvents = [];

  function makeId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function readEvents() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.schemaVersion === SCHEMA_VERSION && Array.isArray(parsed.events)
        ? parsed.events
        : [];
    } catch {
      return [];
    }
  }

  function record(eventName, details = {}) {
    if (!sessionId) sessionId = makeId();
    const event = {
      schema_version: SCHEMA_VERSION,
      event_id: makeId(),
      session_id: sessionId,
      activity_id: "letter-adventure-a",
      app_version: "0.1.0",
      event_name: eventName,
      occurred_at: new Date().toISOString(),
      ...details,
    };

    memoryEvents.push(event);
    memoryEvents = memoryEvents.slice(-MAX_EVENTS);

    try {
      const events = [...readEvents(), event].slice(-MAX_EVENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, events }));
    } catch {
      // Keep the game playable if local browser storage is blocked or full.
    }
  }

  window.letterAdventureProgress = {
    startSession() {
      sessionId = makeId();
      record("session_started");
    },
    record,
  };
})();
