const STATION_LIST = [
  {
    id: "nightshift-fm",
    name: "NIGHTSHIFT FM",
    frequency: "98.6 FM",
    vibe: "LO-FI",
    color: "#b967ff",
    audioSrc: "assets/audio/nightshift-fm.mp3",
    dj: "DJ Sleepless",
    tracks: [
      "midnight rain / unknown artist",
      "3am coffee / lo-fi beats",
      "neon city drift / synthwave collective",
      "can't sleep again / bedroom producer",
      "last train home / chill hop"
    ],
    chatMessages: [
      "studying at 2am fr",
      "this track is everything",
      "where do I find this artist",
      "night shift people are built different",
      "volume low, vibes high",
      "this feels like rain on a window",
      "anyone else coding rn?",
      "DJ Sleepless never misses"
    ]
  },
  {
    id: "codewave-radio",
    name: "CODEWAVE RADIO",
    frequency: "104.2 FM",
    vibe: "FOCUS",
    color: "#00e5ff",
    audioSrc: "assets/audio/codewave-radio.mp3",
    dj: "0xAudio",
    tracks: [
      "deep focus.exe",
      "compile time / ambient",
      "git blame / lo-fi",
      "merge conflict dreams",
      "localhost after dark"
    ],
    chatMessages: [
      "shipping at 3am again",
      "npm install going brrr",
      "this station got me through my finals",
      "css finally behaving because of this beat",
      "git push and pray",
      "debugging with this in the background",
      "frontend gang awake?",
      "this beat fixed my layout"
    ]
  },
  {
    id: "ghost-signal",
    name: "GHOST SIGNAL",
    frequency: "88.8 FM",
    vibe: "DARK",
    color: "#ff3131",
    audioSrc: "assets/audio/ghost-signal.mp3",
    dj: "The Static",
    tracks: [
      "signal lost / void",
      "frequency unknown / drone",
      "dead channel / ambient",
      "numbers station / midnight tape",
      "red light hallway / static"
    ],
    chatMessages: [
      "who is this DJ",
      "I found this station by accident",
      "signal keeps cutting out for me too",
      "is anyone else hearing whispers",
      "this should not be on my radio",
      "the static is part of the song right",
      "do not tune below 88.8",
      "something answered my request"
    ]
  },
  {
    id: "solar-drift",
    name: "SOLAR DRIFT",
    frequency: "91.0 FM",
    vibe: "CHILL",
    color: "#ffb000",
    audioSrc: "assets/audio/solar-drift.mp3",
    dj: "Sunny Side",
    tracks: [
      "golden hour loops / ambient",
      "rooftop sunset / chill",
      "warm window / soft keys",
      "slow clouds / daydream tape",
      "sunbeam radio / mellow"
    ],
    chatMessages: [
      "perfect Sunday morning station",
      "this is my wfh playlist",
      "tea and this station = peace",
      "the warmest beat ever",
      "needed this after a long day",
      "this feels like sunlight",
      "quiet morning gang",
      "Sunny Side is carrying my mood"
    ]
  }
];
const REQUEST_TRACKS = [
  {
    name: "Downers At Dusk",
    artist: "Talha Anjum",
    src: "assets/audio/downers-at-dusk.mp3"
  },
  {
    name: "Khana Badosh",
    artist: "Talha Anjum",
    src: "assets/audio/khana-badosh.mp3"
  },
  {
    name: "Karachi Mera",
    artist: "Talha Anjum",
    src: "assets/audio/karachi-mera.mp3"
  },
  {
    name: "Gumaan",
    artist: "Talha Anjum",
    src: "assets/audio/gumaan.mp3"
  }
];
const radioAudio = document.getElementById("radioAudio");
const stationName = document.getElementById("stationName");
const mainStationTitle = document.getElementById("mainStationTitle");
const frequencyDisplay = document.getElementById("frequencyDisplay");
const vibeBadge = document.getElementById("vibeBadge");
const djName = document.getElementById("djName");
const trackName = document.getElementById("trackName");
const miniTrack = document.getElementById("miniTrack");
const visualizer = document.getElementById("visualizer");
const miniEqualizer = document.getElementById("miniEqualizer");
const stationSelector = document.getElementById("stationSelector");
const playBtn = document.getElementById("playBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");
const clockDisplay = document.getElementById("clockDisplay");
const listenerCount = document.getElementById("listenerCount");
const chatLog = document.getElementById("chatLog");
const requestForm = document.getElementById("requestForm");
const requestInput = document.getElementById("requestInput");
const requestTrackSelect = document.getElementById("requestTrackSelect");

let currentStation = STATION_LIST[0];
let currentTrackIndex = 0;
let currentChatIndex = 0;
let fakeListeners = 1284;

let audioContext;
let audioSource;
let analyser;
let dataArray;
let visualizerBars = [];

let trackInterval;
let listenerInterval;
let chatTimeout;
let droneOscillator;
let droneGain;

/*
   This starts the whole app when the page is ready.
*/
$(document).ready(function () {
  createStationButtons();
  loadRequestTracks();
  createVisualizerBars();
  createMiniEqualizer();
  loadVolume();
  playStation("nightshift-fm", false);
  updateClock();

  setInterval(updateClock, 1000);

  playBtn.addEventListener("click", handlePlayButton);
  muteBtn.addEventListener("click", toggleMute);
  volumeSlider.addEventListener("input", handleVolumeChange);
  requestForm.addEventListener("submit", handleTrackRequest);

  dragWidget(document.getElementById("miniWidget"));
  dragWidget(document.getElementById("chatWidget"));
  dragWidget(document.getElementById("statsWidget"));
});

/*
   This creates the audio system after the user clicks.
*/
function setupAudioContext() {
  if (audioContext) {
    return;
  }

  audioContext = new AudioContext();
  audioSource = audioContext.createMediaElementSource(radioAudio);
  analyser = audioContext.createAnalyser();

  analyser.fftSize = 128;

  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
}

/*
   This creates the 32 big visualizer bars.
*/
function createVisualizerBars() {
  visualizer.innerHTML = "";
  visualizerBars = [];

  for (let i = 0; i < 32; i++) {
    const barElement = document.createElement("div");
    barElement.className = "visualizer-bar";

    visualizer.appendChild(barElement);
    visualizerBars.push(barElement);
  }
}

/*
   This creates the small equalizer bars inside the floating mini widget.
*/
function createMiniEqualizer() {
  miniEqualizer.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const miniBar = document.createElement("div");
    miniBar.className = "mini-bar";
    miniBar.style.animationDelay = `${i * 0.08}s`;
    miniEqualizer.appendChild(miniBar);
  }
}

/*
   This creates one button for each fake radio station.
*/
function createStationButtons() {
  stationSelector.innerHTML = "";

  STATION_LIST.forEach(function (station) {
    const button = document.createElement("button");

    button.className = "station-pill";
    button.textContent = `${station.name} / ${station.frequency}`;
    button.dataset.stationId = station.id;

    button.addEventListener("click", function () {
      playStation(station.id, true);
    });

    stationSelector.appendChild(button);
  });
}

/*
   This loads a station, updates the UI, changes color, and optionally starts audio.
*/
function playStation(stationId, shouldStartAudio = true) {
  currentStation = STATION_LIST.find(function (station) {
    return station.id === stationId;
  });

  currentTrackIndex = 0;
  currentChatIndex = 0;

  document.documentElement.style.setProperty("--station-color", currentStation.color);

  stationName.textContent = currentStation.name;
  mainStationTitle.textContent = currentStation.name;
  frequencyDisplay.textContent = currentStation.frequency;
  vibeBadge.textContent = currentStation.vibe;
  djName.textContent = currentStation.dj;
  trackName.textContent = currentStation.tracks[0];
  miniTrack.textContent = currentStation.tracks[0];

  radioAudio.src = currentStation.audioSrc;
  radioAudio.loop = true;
  radioAudio.volume = Number(volumeSlider.value);

  updateActiveStationButton();
  resetChat();
  restartStationLoops();

  if (shouldStartAudio) {
    startAudioPlayback();
  }
}

/*
   This highlights the active station button.
*/
function updateActiveStationButton() {
  const stationButtons = document.querySelectorAll(".station-pill");

  stationButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.stationId === currentStation.id);
  });
}

/*
   This handles the Play and Pause button.
*/
function handlePlayButton() {
  if (radioAudio.paused) {
    startAudioPlayback();
  } else {
    radioAudio.pause();
    stopDroneFallback();
    playBtn.textContent = "Play";
  }
}

/*
   This starts the real audio file, or uses the fallback drone if the file is missing.
*/
function startAudioPlayback() {
  setupAudioContext();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  radioAudio.play()
    .then(function () {
      stopDroneFallback();
      playBtn.textContent = "Pause";
      drawVisualizer();
    })
    .catch(function () {
      startDroneFallback();
      playBtn.textContent = "Pause";
      drawVisualizer();
      appendChatMessage("Audio file missing, switching to emergency drone signal.", currentStation.dj);
    });
}

/*
   This reads live audio frequency data and turns it into bar heights.
*/
function drawVisualizer() {
  if (!analyser || !dataArray) {
    return;
  }

  analyser.getByteFrequencyData(dataArray);

  visualizerBars.forEach(function (bar, index) {
    let barHeight = 8;

    if (!radioAudio.paused || droneOscillator) {
      const dataIndex = index % dataArray.length;
      barHeight = Math.max(8, dataArray[dataIndex] / 2.4);
    }

    bar.style.height = `${barHeight}%`;
  });

  requestAnimationFrame(drawVisualizer);
}

/*
   This saves the current volume in the browser.
*/
function saveVolume(value) {
  localStorage.setItem("nightshift-volume", value);
}

/*
   This loads saved volume from the browser.
*/
function loadVolume() {
  const savedVolume = localStorage.getItem("nightshift-volume");
  const volumeValue = savedVolume || "0.65";

  volumeSlider.value = volumeValue;
  radioAudio.volume = Number(volumeValue);
}

/*
   This updates audio volume and saves it.
*/
function handleVolumeChange() {
  radioAudio.volume = Number(volumeSlider.value);

  if (droneGain) {
    droneGain.gain.value = Number(volumeSlider.value) * 0.15;
  }

  saveVolume(volumeSlider.value);
}

/*
   This mutes or unmutes the station.
*/
function toggleMute() {
  radioAudio.muted = !radioAudio.muted;

  if (droneGain) {
    droneGain.gain.value = radioAudio.muted ? 0 : Number(volumeSlider.value) * 0.15;
  }

  muteBtn.textContent = radioAudio.muted ? "Unmute" : "Mute";
}

/*
   This updates the live clock every second.
*/
function updateClock() {
  const now = new Date();

  clockDisplay.textContent = now.toLocaleTimeString("en-US", {
    hour12: false
  });
}

/*
   This cycles through fake track names every 30 seconds.
*/
function cycleTrackName() {
  currentTrackIndex++;

  if (currentTrackIndex >= currentStation.tracks.length) {
    currentTrackIndex = 0;
  }

  trackName.textContent = currentStation.tracks[currentTrackIndex];
  miniTrack.textContent = currentStation.tracks[currentTrackIndex];
}

/*
   This updates the fake listener count so the station feels alive.
*/
function updateListenerCount() {
  const changeAmount = Math.floor(Math.random() * 8) - 2;

  fakeListeners += changeAmount;

  if (fakeListeners < 800) {
    fakeListeners = 800;
  }

  if (fakeListeners > 4200) {
    fakeListeners = 4200;
  }

  listenerCount.textContent = fakeListeners;
}

/*
   This adds a new message bubble to the chat log.
*/
function appendChatMessage(message, sender = "listener") {
  const messageElement = document.createElement("div");

  messageElement.className = "chat-message";
  messageElement.innerHTML = `
    <strong>${sender}</strong>
    <span>${message}</span>
  `;

  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
}

/*
   This clears the chat and adds the first station messages.
*/
function resetChat() {
  chatLog.innerHTML = "";

  appendChatMessage(`You are tuned into ${currentStation.name}.`, currentStation.dj);
  appendChatMessage(currentStation.chatMessages[0], "nightlistener");
}

/*
   This starts fake chat messages with random delays.
*/
function startFakeChatLoop() {
  clearTimeout(chatTimeout);

  const randomDelay = Math.floor(Math.random() * 30000) + 15000;

  chatTimeout = setTimeout(function () {
    currentChatIndex++;

    if (currentChatIndex >= currentStation.chatMessages.length) {
      currentChatIndex = 0;
    }

    appendChatMessage(currentStation.chatMessages[currentChatIndex], getRandomUsername());
    startFakeChatLoop();
  }, randomDelay);
}

/*
   This gives fake listeners random usernames.
*/
function getRandomUsername() {
  const usernames = [
    "sleepyUser",
    "staticKid",
    "chaiCoder",
    "midnightGuest",
    "lofiGhost",
    "finalsSurvivor"
  ];

  const randomIndex = Math.floor(Math.random() * usernames.length);

  return usernames[randomIndex];
}
/*
   This loads all request tracks into the dropdown menu.
*/
function loadRequestTracks() {
  REQUEST_TRACKS.forEach(function (track, index) {

    const optionElement = document.createElement("option");

    optionElement.value = index;

    optionElement.textContent = `${track.name} / ${track.artist}`;

    requestTrackSelect.appendChild(optionElement);

  });
}
/*
   This plays a selected requested track from the dropdown.
*/
function handleTrackRequest(event) {

  event.preventDefault();

  const selectedTrackIndex = requestTrackSelect.value;

  if (selectedTrackIndex === "") {

    appendChatMessage(
      "Select a track first before sending a request.",
      currentStation.dj
    );

    return;
  }

  const selectedTrack = REQUEST_TRACKS[selectedTrackIndex];

  radioAudio.src = selectedTrack.src;

  radioAudio.loop = true;

  radioAudio.play();

  playBtn.textContent = "Pause";

  trackName.textContent =
    `${selectedTrack.name} / ${selectedTrack.artist}`;

  miniTrack.textContent =
    `${selectedTrack.name} / ${selectedTrack.artist}`;

  appendChatMessage(
    `Request accepted. Now playing "${selectedTrack.name}".`,
    currentStation.dj
  );

  appendChatMessage(
    `"${selectedTrack.name}" requested by a night listener.`,
    "SYSTEM"
  );
}

/*
   This restarts intervals when the station changes.
*/
function restartStationLoops() {
  clearInterval(trackInterval);
  clearInterval(listenerInterval);
  clearTimeout(chatTimeout);

  trackInterval = setInterval(cycleTrackName, 30000);
  listenerInterval = setInterval(updateListenerCount, 3000);

  startFakeChatLoop();
}

/*
   This makes a widget draggable with mouse and touch.
*/
function dragWidget(widgetElement) {
  const handle = widgetElement.querySelector(".widget-handle");

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener("mousedown", startMouseDrag);
  document.addEventListener("mousemove", moveMouseDrag);
  document.addEventListener("mouseup", stopDrag);

  handle.addEventListener("touchstart", startTouchDrag);
  document.addEventListener("touchmove", moveTouchDrag);
  document.addEventListener("touchend", stopDrag);

  function startMouseDrag(event) {
    if (window.innerWidth < 768) {
      return;
    }

    isDragging = true;
    offsetX = event.clientX - widgetElement.offsetLeft;
    offsetY = event.clientY - widgetElement.offsetTop;
    handle.style.cursor = "grabbing";
  }

  function moveMouseDrag(event) {
    if (!isDragging) {
      return;
    }

    widgetElement.style.left = `${event.clientX - offsetX}px`;
    widgetElement.style.top = `${event.clientY - offsetY}px`;
  }

  function startTouchDrag(event) {
    if (window.innerWidth < 768) {
      return;
    }

    const touch = event.touches[0];

    isDragging = true;
    offsetX = touch.clientX - widgetElement.offsetLeft;
    offsetY = touch.clientY - widgetElement.offsetTop;
  }

  function moveTouchDrag(event) {
    if (!isDragging) {
      return;
    }

    const touch = event.touches[0];

    widgetElement.style.left = `${touch.clientX - offsetX}px`;
    widgetElement.style.top = `${touch.clientY - offsetY}px`;
  }

  function stopDrag() {
    isDragging = false;
    handle.style.cursor = "grab";
  }
}

/*
   This creates a simple generated drone if the audio file is missing.
*/
function startDroneFallback() {
  if (droneOscillator) {
    return;
  }

  setupAudioContext();

  droneOscillator = audioContext.createOscillator();
  droneGain = audioContext.createGain();

  droneOscillator.type = "sine";
  droneOscillator.frequency.value = 110;
  droneGain.gain.value = Number(volumeSlider.value) * 0.15;

  droneOscillator.connect(droneGain);
  droneGain.connect(analyser);

  droneOscillator.start();
}

/*
   This stops the generated fallback drone.
*/
function stopDroneFallback() {
  if (!droneOscillator) {
    return;
  }

  droneOscillator.stop();
  droneOscillator.disconnect();

  droneOscillator = null;
  droneGain = null;
}