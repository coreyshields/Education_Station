# Game Prototype Backlog

This backlog tracks improvements to the first Letter Adventure prototype. Priorities are a starting point; adjust them after trying the game with children and caregivers.

## First polish pass

- [x] **Clarify the first screen after “Let’s go.”** Replace the fox emoji with a clear, original apple or alligator illustration. Keep the character's identity obvious at a glance and consistent across screens.
- [ ] **Make text and controls easier to see and use.** Increase child-facing text and button sizes, then check that they scale appropriately on desktop, tablet, and narrow screens without crowding or clipping.
- [ ] **Make scene art responsive.** Scale and reposition the apple, letter choices, trail, and character to fit the available screen while keeping choices large and comfortably spaced.
- [ ] **Add visual feedback to choices.** Animate a selected letter so it is clear which item was tapped. For a correct A, briefly celebrate with a small burst of apple, alligator, or ant shapes; keep the effect short and avoid obscuring the next action.
- [ ] **Add optional sound feedback.** Provide a soft, distinct sound for a selection and a positive sound for a correct answer. Include a visible mute/sound control, avoid autoplay, and make sure the game remains understandable with sound off.
- [ ] **Vary letter choices between plays.** Shuffle the positions of answer choices and vary distractor letters on replay, while ensuring there is one unambiguous correct answer and the target A stays easy to find.
- [ ] **Make progress and feedback states clear.** Show how many trail letters remain and ensure each selected marker visibly stays collected. Keep incorrect-answer feedback encouraging and specific.
- [ ] **Check accessibility and comfort.** Confirm strong text/background contrast, visible keyboard focus, usable keyboard activation, reduced-motion support, and no reliance on color or sound alone to communicate correctness.

## Playtest and learning design

- [ ] **Try the flow with a child and caregiver.** Observe whether the child understands each prompt, can select choices comfortably, and knows what to try after feedback. Note where the caregiver has to explain or take over.
- [ ] **Review prompt wording and pacing.** Keep directions short, offer a caregiver-read-aloud option, and check that narration, if added, does not rush a child who needs more time.
- [ ] **Decide how support should change after a miss.** Try a gentle hint, fewer choices, or a visible A reference after repeated incorrect attempts. Avoid penalties and avoid making the child feel tested.
- [ ] **Check that the game teaches recognition, not just memorized positions.** Present A in varied positions and alongside different distractors across attempts.

## Background learning records

- [x] **Start a background event log.** The prototype records versioned session, attempt, correctness, and completion events locally in the browser. It does not display mastery information or transmit records to a server.
- [ ] **Define observable skills separately.** Distinguish uppercase-letter identification, target-letter selection on a path, and initial-letter association. Treat these as evidence over multiple attempts and sessions, not as a conclusion from one correct click.
- [ ] **Keep the event contract stable and extensible.** Document event names, schema version, skill identifiers, attempt counts, and outcome fields before adding more activities. Add new optional fields without changing the meaning of existing fields.
- [ ] **Decide how progress is separated by learner.** The current prototype keeps no child profile, so records from different children using the same browser are not distinguishable. Choose an appropriate caregiver-controlled profile or session approach before interpreting accumulated data per learner.
- [ ] **Set retention and deletion behavior.** Decide how long local records should be kept, how a caregiver can clear them, and what happens when browser storage is unavailable or full.
- [ ] **Keep the records internal.** Do not add a child-facing score, caregiver dashboard, or mastery report unless the product direction changes. Use the data as an internal signal for future adaptation and analysis.
- [ ] **Review data handling before any remote sync.** Keep collection local for now. Before adding an agent service, analytics endpoint, account, or cross-device sync, decide what data is needed, how it is protected, and what caregiver controls are appropriate.

## Later game features

- [ ] Add another letter only after the A flow is understandable and enjoyable in a small tryout.
- [ ] Replace emoji placeholders with original, consistent illustrations and document their source and usage rights.
- [ ] Decide whether the prototype should stay as a lightweight static web app or move to a framework/game engine based on the needs of the next validated interaction.
