# Letter Adventure Prototype

A first, dependency-free browser prototype for the Letter A flow. It follows the design in [letter-a-flow.md](letter-a-flow.md) and keeps the interaction in plain HTML, CSS, and JavaScript so it can be opened and tried without installing tools.

## Run locally

Open `index.html` in a desktop browser. The prototype uses no build step or external assets.

## Current flow

1. Meet the fox guide, uppercase A, lowercase a, and apple.
2. Choose uppercase A from three large letter buttons. Incorrect choices give a gentle cue and another try.
3. Select five A markers along a short letter trail; distractor letters do not remove progress.
4. Choose A as the first letter in *apple*.
5. Replay the A quest. The next-letter option is shown as coming soon.

This is a learning-flow prototype, not a finished game. The guide and apple use emoji placeholders; interactions and presentation should be revised after trying the flow with children and caregivers.

## Background progress events

The prototype records a small, versioned event log in browser storage to establish a foundation for future learning analytics. It tracks session starts, letter choices, correctness, attempt counts, and completion. It does not ask for a child name, show a score, or send data over the network. Records stay in the browser's local storage; clearing the browser's stored site data removes them. If storage is blocked or full, the game continues without saving the event. This prototype does not provide a progress viewer or caregiver profile system, so records on a shared browser are not associated with a particular child. See [progress-events.md](progress-events.md) for the event contract.
