(() => {
  const root = document.querySelector("#game-root");
  const soundToggle = document.querySelector("[data-action='sound-toggle']");
  const progressDots = [...document.querySelectorAll(".progress-dot")];

  const state = {
    screen: "intro",
    trailFound: [],
    attempts: { find: 0, trail: 0, apple: 0 },
    feedback: "",
    gentleFeedback: false,
    selected: null,
    selectionPending: false,
    trailPending: false,
    applePending: false,
    selectedTrailIndex: null,
    animateAnt: false,
    soundEnabled: false,
    findChoices: [],
    previousFindChoices: null,
    trailChoices: [],
    previousTrailChoices: null,
    appleChoices: [],
    previousAppleChoices: null,
  };

  let audioContext;

  const stageForScreen = { intro: 0, find: 1, trail: 2, apple: 3, done: 3 };
  const findDistractors = ["M", "S", "T", "P", "L", "C", "O", "R", "N"];
  const trailDistractors = ["M", "S", "T", "P", "L", "C", "O", "R", "N"];
  const appleDistractors = ["O", "M", "S", "T", "P", "L", "C", "R"];

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function prepareFindChoices() {
    const distractorPairs = [];
    for (let first = 0; first < findDistractors.length; first += 1) {
      for (let second = first + 1; second < findDistractors.length; second += 1) {
        distractorPairs.push([findDistractors[first], findDistractors[second]]);
      }
    }
    const previousPair = state.previousFindChoices?.filter((letter) => letter !== "A").sort().join("");
    const availablePairs = distractorPairs.filter((pair) => [...pair].sort().join("") !== previousPair);
    const distractors = availablePairs[Math.floor(Math.random() * availablePairs.length)];
    const previousAnswerPosition = state.previousFindChoices?.indexOf("A");
    state.findChoices = shuffle(["A", ...distractors]);
    if (previousAnswerPosition !== undefined && state.findChoices.indexOf("A") === previousAnswerPosition) {
      const newPosition = (previousAnswerPosition + 1 + Math.floor(Math.random() * 2)) % state.findChoices.length;
      [state.findChoices[previousAnswerPosition], state.findChoices[newPosition]] = [state.findChoices[newPosition], state.findChoices[previousAnswerPosition]];
    }
    state.previousFindChoices = [...state.findChoices];
  }

  function chooseFreshPair(pool, previousChoices) {
    const pairs = [];
    for (let first = 0; first < pool.length; first += 1) {
      for (let second = first + 1; second < pool.length; second += 1) {
        pairs.push([pool[first], pool[second]]);
      }
    }
    const previousPair = previousChoices?.filter((letter) => letter !== "A").sort().join("");
    const availablePairs = pairs.filter((pair) => [...pair].sort().join("") !== previousPair);
    return availablePairs[Math.floor(Math.random() * availablePairs.length)];
  }

  function prepareTrailChoices() {
    const distractorSets = [];
    for (let first = 0; first < trailDistractors.length; first += 1) {
      for (let second = first + 1; second < trailDistractors.length; second += 1) {
        for (let third = second + 1; third < trailDistractors.length; third += 1) {
          distractorSets.push([trailDistractors[first], trailDistractors[second], trailDistractors[third]]);
        }
      }
    }
    const previousDistractors = state.previousTrailChoices?.filter((letter) => letter !== "A").sort().join("");
    const availableSets = distractorSets.filter((set) => [...set].sort().join("") !== previousDistractors);
    const distractors = availableSets[Math.floor(Math.random() * availableSets.length)];
    state.trailChoices = ["A", "A", "A", "A", "A", ...shuffle(distractors)];
    state.previousTrailChoices = [...state.trailChoices];
  }

  function prepareAppleChoices() {
    const distractors = chooseFreshPair(appleDistractors, state.previousAppleChoices);
    const previousAnswerPosition = state.previousAppleChoices?.indexOf("A");
    state.appleChoices = shuffle(["A", ...distractors]);
    if (previousAnswerPosition !== undefined && state.appleChoices.indexOf("A") === previousAnswerPosition) {
      const newPosition = (previousAnswerPosition + 1 + Math.floor(Math.random() * 2)) % state.appleChoices.length;
      [state.appleChoices[previousAnswerPosition], state.appleChoices[newPosition]] = [state.appleChoices[newPosition], state.appleChoices[previousAnswerPosition]];
    }
    state.previousAppleChoices = [...state.appleChoices];
  }

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
    const choices = state.findChoices.map((letter) => {
      const selected = state.selected === letter;
      const correct = selected && letter === "A";
      const particles = correct ? `<span class="celebration" aria-hidden="true"><span>🍎</span><span>🐜</span><span>🐊</span><span>🍎</span></span>` : "";
      return `<button class="choice ${selected ? `is-selected ${correct ? "is-correct" : "is-wrong"}` : ""}" data-letter="${letter}" aria-label="Letter ${letter}" ${state.selectionPending ? "disabled" : ""}><span class="choice-letter">${letter}</span>${particles}</button>`;
    }).join("");
    layout(`
      <div class="characters"><span class="apple" role="img" aria-label="Red apple">🍎</span></div>
      <p class="prompt">${state.selectionPending ? "You found the letter A! Great job!" : "Can you find the letter A?"}</p>
      <div class="choice-row">${choices}</div>
      <p class="feedback ${state.gentleFeedback ? "is-gentle" : ""}" role="status">${state.feedback || "Choose one letter."}</p>
      ${state.selectionPending ? `<button class="primary-button continue-button" data-action="continue">Continue</button>` : ""}
    `);
  }

  function renderTrail() {
    const routeLeaves = [
      { x: 14, y: 57 }, { x: 32, y: 36 }, { x: 51, y: 62 }, { x: 70, y: 36 }, { x: 87, y: 57 },
    ];
    const branchLeaves = [
      { x: 24, y: 88 }, { x: 49, y: 12 }, { x: 77, y: 86 },
    ];
    const leaves = state.trailChoices.map((letter, index) => {
      const onRoute = index < routeLeaves.length;
      const position = onRoute ? routeLeaves[index] : branchLeaves[index - routeLeaves.length];
      const found = state.trailFound.includes(index);
      const selected = state.selectedTrailIndex === index;
      const correct = found && selected;
      const isNextLeaf = onRoute && index === state.trailFound.length;
      const particles = correct ? `<span class="celebration" aria-hidden="true"><span>🍎</span><span>🐜</span><span>🐊</span><span>🍎</span></span>` : "";
      const feedbackClass = selected ? `is-selected ${correct ? "is-correct" : "is-wrong"}` : "";
      const label = found ? `Found A, leaf ${index + 1}` : onRoute ? `${isNextLeaf ? "Next" : "Later"} trail leaf, letter A` : `Off-trail leaf, letter ${letter}`;
      const disabled = found || state.trailPending || (onRoute && !isNextLeaf);
      return `<span class="leaf-position" style="left:${position.x}%;top:${position.y}%"><button class="choice trail-leaf ${isNextLeaf ? "is-next" : ""} ${found ? "is-collected" : ""} ${feedbackClass}" data-trail="${index}" aria-label="${label}" ${disabled ? "disabled" : ""}><span class="leaf-letter">${found ? "✓" : letter}</span>${particles}</button></span>`;
    }).join("");
    const antPosition = state.trailFound.length === 0
      ? { x: 4, y: 76 }
      : state.trailFound.length === routeLeaves.length
        ? { x: 103, y: 13 }
        : {
          x: routeLeaves[state.trailFound.length - 1].x - 4,
          y: routeLeaves[state.trailFound.length - 1].y + 8,
        };
    const finished = state.trailPending;
    const antLabel = finished ? "Ant beside the apple" : state.trailFound.length === 0 ? "Ant at the start" : `Ant at leaf ${state.trailFound.length} of 5`;
    layout(`
      <p class="prompt">${finished ? "The ant made it to the apple! Yum!" : "Help the ant get to the apple. Choose the next A!"}</p>
      <div class="trail-board" role="group" aria-label="Leaf path to the apple. Find five A leaves to guide the ant.">
        <svg class="trail-route" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true"><path d="M40 300 C80 300 90 220 140 220 S240 120 320 144 S430 270 510 248 S630 120 700 144 S800 270 870 228 S930 110 970 90" /><path class="trail-branch" d="M220 190 Q245 270 240 352 M485 185 Q500 115 490 48 M760 190 Q785 270 770 344" /></svg>
        <span class="trail-start" aria-hidden="true">START</span>
        <span class="trail-apple ${finished ? "is-bitten" : ""}" role="img" aria-label="${finished ? "Apple with a bite missing" : "Red apple at the end of the trail"}">🍎<small>APPLE</small></span>
        ${leaves}
        <span class="ant-token ${state.animateAnt ? "is-hopping" : ""}" style="left:${antPosition.x}%;top:${antPosition.y}%" role="img" aria-label="${antLabel}">🐜</span>
      </div>
      <p class="feedback ${state.gentleFeedback ? "is-gentle" : ""}" role="status">${state.feedback || `Find the A letters. ${state.trailFound.length} of 5 found.`}</p>
      ${state.trailPending ? `<button class="primary-button continue-button" data-action="continue-apple">Continue</button>` : ""}
    `);
  }

  function renderApple() {
    const choices = state.appleChoices.map((letter) => {
      const selected = state.selected === letter;
      const correct = selected && letter === "A";
      const particles = correct ? `<span class="celebration" aria-hidden="true"><span>🐊</span><span>✨</span><span>🐜</span><span>🐊</span></span>` : "";
      return `<button class="choice ${selected ? `is-selected ${correct ? "is-correct" : "is-wrong"}` : ""}" data-letter="${letter}" aria-label="Letter ${letter}" ${state.applePending ? "disabled" : ""}><span class="choice-letter">${letter}</span>${particles}</button>`;
    }).join("");
    layout(`
      <div class="characters"><span class="guide" role="img" aria-label="Alligator guide">🐊</span></div>
      <div class="letter-pair" aria-label="Uppercase A and lowercase a"><span>A</span><span>a</span></div>
      <p class="prompt">${state.applePending ? "You found the right letter! Alligator starts with A!" : "Which letter does <strong>alligator</strong> start with?"}</p>
      <div class="choice-row">${choices}</div>
      <p class="feedback ${state.gentleFeedback ? "is-gentle" : ""}" role="status">${state.feedback || "Choose the letter that starts alligator."}</p>
      ${state.applePending ? `<button class="primary-button continue-button" data-action="finish">Continue</button>` : ""}
    `);
  }

  function renderDone() {
    layout(`
      <p class="finish-art" role="img" aria-label="Alligator celebrating">🐊</p>
      <p class="prompt">You found A! Alligator starts with A.</p>
      <p class="subprompt">Thanks for helping your alligator friend.</p>
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

  function updateSoundToggle() {
    soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
    soundToggle.setAttribute("aria-label", state.soundEnabled ? "Turn sound off" : "Turn sound on");
    soundToggle.innerHTML = `${state.soundEnabled ? "🔊" : "🔇"} <span>Sound ${state.soundEnabled ? "on" : "off"}</span>`;
  }

  function playSound(kind) {
    if (!state.soundEnabled) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      audioContext ||= new AudioContextClass();
      if (audioContext.state === "suspended") audioContext.resume();
      if (kind === "crunch") {
        const duration = 0.15;
        const buffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * duration), audioContext.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index += 1) {
          samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
        }
        const crunch = audioContext.createBufferSource();
        const filter = audioContext.createBiquadFilter();
        const volume = audioContext.createGain();
        crunch.buffer = buffer;
        filter.type = "highpass";
        filter.frequency.setValueAtTime(900, audioContext.currentTime);
        volume.gain.setValueAtTime(0.0001, audioContext.currentTime);
        volume.gain.exponentialRampToValueAtTime(0.055, audioContext.currentTime + 0.015);
        volume.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
        crunch.connect(filter);
        filter.connect(volume);
        volume.connect(audioContext.destination);
        crunch.start();
        crunch.stop(audioContext.currentTime + duration);
        return;
      }
      const notes = kind === "correct" ? [660, 880] : [520];
      const start = audioContext.currentTime;
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const volume = audioContext.createGain();
        const noteStart = start + index * 0.11;
        oscillator.type = kind === "correct" ? "sine" : "triangle";
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        volume.gain.setValueAtTime(0.0001, noteStart);
        volume.gain.exponentialRampToValueAtTime(kind === "correct" ? 0.075 : 0.045, noteStart + 0.025);
        volume.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.16);
        oscillator.connect(volume);
        volume.connect(audioContext.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.17);
      });
    } catch {
      // Keep the game's visual feedback available if audio is unsupported or unavailable.
    }
  }

  function chooseLetter(letter) {
    if (state.selectionPending || state.applePending) return;
    state.selected = letter;
    if (letter === "A") {
      if (state.screen === "find") {
        playSound("correct");
        state.selectionPending = true;
        state.attempts.find += 1;
        record("letter_choice", {
          stage: "find-target",
          skill_id: "uppercase-letter-identification",
          target_letter: "A",
          selected_letter: letter,
          correct: true,
          attempt_number: state.attempts.find,
        });
        setFeedback("You found A!");
        render();
        return;
      } else if (state.screen === "apple") {
        playSound("correct");
        state.applePending = true;
        state.attempts.apple += 1;
        record("letter_choice", {
          stage: "apple-start",
          skill_id: "initial-letter-association",
          target_letter: "A",
          selected_letter: letter,
          correct: true,
          attempt_number: state.attempts.apple,
        });
        setFeedback("Alligator starts with A! You did it.");
      }
    } else if (state.screen === "find") {
      playSound("select");
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
      state.selected = letter;
    } else {
      playSound("select");
      state.attempts.apple += 1;
      record("letter_choice", {
        stage: "apple-start",
        skill_id: "initial-letter-association",
        target_letter: "A",
        selected_letter: letter,
        correct: false,
        attempt_number: state.attempts.apple,
      });
      setFeedback("That one is a different letter. Alligator starts with A. Try again!", true);
    }
    render();
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;

    if (button.dataset.action === "start") {
      state.screen = "find";
      state.attempts = { find: 0, trail: 0, apple: 0 };
      state.trailFound = [];
      state.selected = null;
      state.selectionPending = false;
      state.trailPending = false;
      state.applePending = false;
      state.selectedTrailIndex = null;
      state.animateAnt = false;
      prepareFindChoices();
      prepareTrailChoices();
      window.letterAdventureProgress?.startSession();
      setFeedback("");
    } else if (button.dataset.action === "continue") {
      state.screen = "trail";
      state.selectionPending = false;
      state.selected = null;
      setFeedback("Let’s follow the apple trail!");
    } else if (button.dataset.action === "continue-apple") {
      state.screen = "apple";
      state.trailPending = false;
      state.selectedTrailIndex = null;
      state.selected = null;
      state.gentleFeedback = false;
      prepareAppleChoices();
      setFeedback("");
    } else if (button.dataset.action === "finish") {
      state.screen = "done";
      record("activity_completed", { completion: "completed" });
    } else if (button.dataset.action === "again") {
      state.screen = "intro";
      state.trailFound = [];
      state.attempts = { find: 0, trail: 0, apple: 0 };
      setFeedback("");
    } else if (button.dataset.letter) {
      if (state.selectionPending || state.applePending) return;
      chooseLetter(button.dataset.letter);
      return;
    } else if (button.dataset.trail !== undefined) {
      if (state.trailPending) return;
      const index = Number(button.dataset.trail);
      if (state.trailFound.includes(index)) return;
      const letter = state.trailChoices[index];
      state.selectedTrailIndex = index;
      state.animateAnt = letter === "A";
      playSound(letter === "A" ? "correct" : "select");
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
          state.trailPending = true;
          setFeedback("Crunch! The ant reached the apple!");
          window.setTimeout(() => playSound("crunch"), 460);
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

  soundToggle.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    updateSoundToggle();
  });

  updateSoundToggle();
  render();
})();
