# Letter Adventure Progress Event Contract

## Purpose

Record interaction evidence in the background so later versions can support internal analysis and adaptive learning. These events do not produce a child-facing score or caregiver report. The current prototype stores them locally in the browser and does not send them to a server.

## Event envelope

Each saved record includes:

| Field | Meaning |
| --- | --- |
| `schema_version` | Event contract version (`1`). |
| `event_id` | Random identifier for this event. |
| `session_id` | Random identifier for one play session; a replay starts a new session. |
| `activity_id` | Activity identifier (`letter-adventure-a`). |
| `app_version` | Prototype version that produced the event. |
| `event_name` | Event type, such as `letter_choice`. |
| `occurred_at` | UTC timestamp for ordering events. |

Interaction events may also include `stage`, `skill_id`, `target_letter`, `selected_letter`, `correct`, and `attempt_number`, as applicable. Event records do not include a child's name, account, or profile identifier.

## Event types

| Event | When recorded | Additional fields |
| --- | --- | --- |
| `session_started` | The child starts a play session. | Envelope only. |
| `letter_choice` | A choice is made in the find-A or apple-start activity. | `stage`, `skill_id`, `target_letter`, `selected_letter`, `correct`, `attempt_number`. |
| `trail_choice` | A trail marker is selected. | Same interaction fields, with `stage: letter-trail` and `skill_id: target-letter-selection`. |
| `activity_completed` | The child correctly identifies A as the first letter in apple. | `completion: completed`. |

Current skill identifiers are `uppercase-letter-identification`, `target-letter-selection`, and `initial-letter-association`. They describe the activity evidence and should not be interpreted as mastery by themselves.

## Storage and future changes

- The browser stores up to the latest 1,000 events under a versioned local key. There is no network request or event viewer.
- Storage errors must never prevent play. The current event stays in memory only if browser storage cannot save it.
- The prototype has no learner profiles, so do not treat accumulated events on a shared device as belonging to one specific child.
- When adding fields, prefer optional additions that preserve existing meanings. If an event's meaning or required structure changes, increment the schema version and document a migration or compatibility plan.
- Before any remote sync or learner-specific analysis, define caregiver controls, learner separation, retention, and deletion behavior.

## Example

```json
{
  "schema_version": 1,
  "event_id": "random-event-id",
  "session_id": "random-session-id",
  "activity_id": "letter-adventure-a",
  "app_version": "0.1.0",
  "event_name": "letter_choice",
  "occurred_at": "2026-10-23T20:00:00.000Z",
  "stage": "find-target",
  "skill_id": "uppercase-letter-identification",
  "target_letter": "A",
  "selected_letter": "M",
  "correct": false,
  "attempt_number": 1
}
```
