(() => {
  const root = document.querySelector("#game-root");
  const progressDots = [...document.querySelectorAll(".progress-dot")];

  const state = {
    screen: "intro",
    trailFound: [],
    attempts: { find: 0, trail: 0, apple: 0 },
    feedback: "",
    gentleFeedback: false,
    selected: null,
  };

  const stageForScreen = { intro: 0, find: 1, trail: 2, apple: 3, done: 3 };
  const letters = ["A", "M", "S"];
  const trailLetters = ["A", "M", "A", "S", "A", "A", "M", "A"];

  function updateProgress() {
    const active = stageForScreen[state.screen] ?? 0;
    progressDots.forEach((dot, index) => {
      dot.classList.toggle("is-current", index === active);
      dot.classList.toggle("is-done", index < active || state.screen === "done");
      dot.setAttribute("aria-current", index === active ? "step" : "false");
    });
  }

  function layout(content) {
    root.innerHTML = `<div class="scene"><div class="scene-content">${content}</div></div>`;
    updateProgress();
  }

  function renderIntro() {
    layout(`
      <div class="characters"><span class="guide" role="img" aria-label="A friendly fox guide">🦊</span><span class="apple" role="img" aria-label="Red apple">🍎</span></div>
      <div class="letter-pair" aria-label="Uppercase A and lowercase a"><span>A</span><span>a</span></div>
      <p class="prompt">Let’s find the letter A. A says /a/, like apple.</p>
      <p class="subprompt">Your fox friend needs help following the apple trail.</p>
      <button class="primary-button" data-action="start">Let’s go!</button>
    `);
  }

  function renderFind() {
    const choices = letters.map((letter) => `<button class="choice" data-letter="${letter}" aria-label="Letter ${letter}">${letter}</button>`).join("");
    layout(`
      <div class="characters"><span class="guide" role="img" aria-label="Fox guide">🦊</span></div>
      <p class="prompt">Can you find the letter A?</p>
      <div class="choice-row">${choices}</div>
      <p class="feedback ${state.gentleFeedback ? "is-gentle" : ""}" role="status">${state.feedback || "Choose one letter."}</p>
    `);
  }

  function renderTrail() {
    const markers = trailLetters.map((letter, index) => {
      const found = state.trailFound.includes(index);
      return `<button class="choice ${found ? "is-collected" : ""}" data-trail="${index}" aria-label="${found ? "Found" : "Choose"} letter ${letter}">${found ? "✓" : letter}</button>`;
    }).join("");
    layout(`
      <div class="characters"><span class="guide" role="img" aria-label="Fox guide">🦊</span></div>
      <p class="prompt">Choose the A letters to help me follow the trail.</p>
      <div class="trail" aria-label="Letter trail">${markers}</div>
      <p class="feedback ${state.gentleFeedback ? "is-gentle" : ""}" role="status">${state.feedback || `Find the A letters. ${state.trailFound.length} of 5 found.`}</p>
    `);
  }

  function renderApple() {
    const choices = ["O", "A", "M"].map((letter) => `<button class="choice" data-letter="${letter}" aria-label="Letter ${letter}">${letter}</button>`).join("");
    layout(`
      <div class="characters"><span class="guide" role="img" aria-label="Fox guide">🦊</span><span class="apple" role="img" aria-label="Red apple">🍎</span></div>
      <div class="letter-pair" aria-label="Uppercase A and lowercase a"><span>A</span><span>a</span></div>
      <p class="prompt">Which letter does <strong>apple</strong> start with?</p>
      <div class="choice-row">${choices}</div>
      <p class="feedback ${state.gentleFeedback ? "is-gentle" : ""}" role="status">${state.feedback || "Choose the letter that starts apple."}</p>
    `);
  }

  function renderDone() {
    layout(`
      <p class="finish-art" role="img" aria-label="Fox found an apple">🦊🍎</p>
      <p class="prompt">You found A! Apple starts with A.</p>
      <p class="subprompt">Thanks for helping your fox friend find the apple.</p>
      <div class="finish-buttons">
        <button class="primary-button" data-action="again">Play A again</button>
        <button class="secondary-button" disabled aria-describedby="next-note">Try another letter</button>
      </div>
      <p class="small-note" id="next-note">More letter adventures are coming soon.</p>
    `);
  }

  function render() {
    const renderers = { intro: renderIntro, find: renderFind, trail: renderTrail, apple: renderApple, done: renderDone };
    renderers[state.screen]();
  }

  function setFeedback(message, gentle = false) {
    state.feedback = message;
    state.gentleFeedback = gentle;
  }

  function record(eventName, details) {
    window.letterAdventureProgress?.record(eventName, details);
  }

  function chooseLetter(letter) {
    if (letter === "A") {
      if (state.screen === "find") {
        state.attempts.find += 1;
        record("letter_choice", {
          stage: "find-target",
          skill_id: "uppercase-letter-identification",
          target_letter: "A",
          selected_letter: letter,
          correct: true,
          attempt_number: state.attempts.find,
        });
        setFeedback("You found A! Let’s follow the trail.");
        state.screen = "trail";
      } else if (state.screen === "apple") {
        state.attempts.apple += 1;
        record("letter_choice", {
          stage: "apple-start",
          skill_id: "initial-letter-association",
          target_letter: "A",
          selected_letter: letter,
          correct: true,
          attempt_number: state.attempts.apple,
        });
        setFeedback("Apple starts with A! You did it.");
        record("activity_completed", { completion: "completed" });
        state.screen = "done";
      }
    } else if (state.screen === "find") {
      state.attempts.find += 1;
      record("letter_choice", {
        stage: "find-target",
        skill_id: "uppercase-letter-identification",
        target_letter: "A",
        selected_letter: letter,
        correct: false,
        attempt_number: state.attempts.find,
      });
      setFeedback(`That one is ${letter}. Let’s look for A.`, true);
    } else {
      state.attempts.apple += 1;
      record("letter_choice", {
        stage: "apple-start",
        skill_id: "initial-letter-association",
        target_letter: "A",
        selected_letter: letter,
        correct: false,
        attempt_number: state.attempts.apple,
      });
      setFeedback("That one is a different letter. Apple starts with A. Try again!", true);
    }
    render();
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;

    if (button.dataset.action === "start") {
      state.screen = "find";
      state.attempts = { find: 0, trail: 0, apple: 0 };
      window.letterAdventureProgress?.startSession();
      setFeedback("");
    } else if (button.dataset.action === "again") {
      state.screen = "intro";
      state.trailFound = [];
      state.attempts = { find: 0, trail: 0, apple: 0 };
      setFeedback("");
    } else if (button.dataset.letter) {
      chooseLetter(button.dataset.letter);
      return;
    } else if (button.dataset.trail !== undefined) {
      const index = Number(button.dataset.trail);
      if (state.trailFound.includes(index)) return;
      const letter = trailLetters[index];
      state.attempts.trail += 1;
      record("trail_choice", {
        stage: "letter-trail",
        skill_id: "target-letter-selection",
        target_letter: "A",
        selected_letter: letter,
        correct: letter === "A",
        attempt_number: state.attempts.trail,
      });
      if (letter === "A") {
        state.trailFound.push(index);
        if (state.trailFound.length === 5) {
          state.screen = "apple";
          setFeedback("You found all five A letters! Now let’s find the apple’s letter.");
        } else {
          setFeedback(`That’s an A! ${state.trailFound.length} of 5 found.`);
        }
        state.gentleFeedback = false;
      } else {
        setFeedback(`That one is ${letter}. Look for A to stay on the trail.`, true);
      }
    }
    render();
  });

  render();
})();
