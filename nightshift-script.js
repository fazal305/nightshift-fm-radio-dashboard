const stationList = [
  {
    id: "nightshift-fm",
    name: "NIGHTSHIFT FM",
    frequency: "98.6 FM",
    vibe: "LO-FI",
    color: "#b967ff",
    audioSrc: "assets/audio/nightshift-fm.mp3",
    fallbackFrequency: 110,
    dj: "DJ Sleepless",
    tracks: [
      "midnight rain / unknown artist",
      "3am coffee / lo-fi beats",
      "neon city drift / synthwave collective",
      "last train home / chill hop",
      "empty streets / soft keys"
    ],
    chatMessages: [
      "studying late with this in the background",
      "this track is carrying my focus",
      "volume low, vibes high",
      "this feels like rain on a window",
      "anyone else coding right now",
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
    fallbackFrequency: 140,
    dj: "0xAudio",
    tracks: [
      "deep focus.exe",
      "compile time / ambient",
      "git blame / lo-fi",
      "merge conflict dreams",
      "localhost after dark"
    ],
    chatMessages: [
      "shipping late again",
      "this station got me through finals",
      "css finally behaving because of this beat",
      "debugging with this in the background",
      "frontend crew awake",
      "this beat fixed my layout"
    ]
  },
  {
    id: "static-signal",
    name: "STATIC SIGNAL",
    frequency: "88.8 FM",
    vibe: "DARK",
    color: "#ff3131",
    audioSrc: "assets/audio/static-signal.mp3",
    fallbackFrequency: 82,
    dj: "The Static",
    tracks: [
      "signal lost / void",
      "frequency unknown / drone",
      "dead channel / ambient",
      "numbers station / midnight tape",
      "red light hallway / static"
    ],
    chatMessages: [
      "the signal keeps cutting out",
      "this station is strangely calming",
      "static is part of the track",
      "low light, high focus",
      "this one belongs after midnight",
      "the mix is unreal"
    ]
  },
  {
    id: "solar-drift",
    name: "SOLAR DRIFT",
    frequency: "91.0 FM",
    vibe: "CHILL",
    color: "#ffb000",
    audioSrc: "assets/audio/solar-drift.mp3",
    fallbackFrequency: 176,
    dj: "Sunny Side",
    tracks: [
      "golden hour loops / ambient",
      "rooftop sunset / chill",
      "warm window / soft keys",
      "slow clouds / daydream tape",
      "sunbeam radio / mellow"
    ],
    chatMessages: [
      "perfect morning station",
      "this is my work playlist",
      "tea and this station equals peace",
      "needed this after a long day",
      "this feels like sunlight",
      "Sunny Side is carrying the mood"
    ]
  }
];

const requestTracks = [
  { name: "Velvet Static", artist: "Nightshift Archive" },
  { name: "Rain On Glass", artist: "Sleepless Keys" },
  { name: "Neon Side Street", artist: "Analog City" },
  { name: "After Hours Loop", artist: "Tape Room" },
  { name: "Soft Signal", artist: "Low Light Club" }
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
const signalStrength = document.getElementById("signalStrength");
const chatLog = document.getElementById("chatLog");
const requestForm = document.getElementById("requestForm");
const requestTrackSelect = document.getElementById("requestTrackSelect");

let currentStation = stationList[0];
let currentTrackIndex = 0;
let currentChatIndex = 0;
let fakeListeners = 1284;
let animationFrameId = null;
let audioContext = null;
let audioSource = null;
let analyser = null;
let dataArray = null;
let visualizerBars = [];
let trackInterval = null;
let listenerInterval = null;
let chatTimeout = null;
let fallbackOscillator = null;
let fallbackGain = null;

function initApp() {
  createStationButtons();
  loadRequestTracks();
  createVisualizerBars();
  createMiniEqualizer();
  loadVolume();
  playStation("nightshift-fm", false);
  updateClock();

  window.setInterval(updateClock, 1000);
  playBtn.addEventListener("click", handlePlayButton);
  muteBtn.addEventListener("click", toggleMute);
  volumeSlider.addEventListener("input", handleVolumeChange);
  requestForm.addEventListener("submit", handleTrackRequest);

  dragWidget(document.getElementById("miniWidget"));
  dragWidget(document.getElementById("chatWidget"));
  dragWidget(document.getElementById("statsWidget"));
}

function createStationButtons() {
  stationSelector.innerHTML = "";

  stationList.forEach(function (station) {
    const button = document.createElement("button");
    button.className = "station-pill";
    button.type = "button";
    button.textContent = `${station.name} / ${station.frequency}`;
    button.dataset.stationId = station.id;
    button.addEventListener("click", function () {
      playStation(station.id, true);
    });

    stationSelector.appendChild(button);
  });
}

function loadRequestTracks() {
  requestTracks.forEach(function (track, index) {
    const optionElement = document.createElement("option");
    optionElement.value = index;
    optionElement.textContent = `${track.name} / ${track.artist}`;
    requestTrackSelect.appendChild(optionElement);
  });
}

function createVisualizerBars() {
  visualizer.innerHTML = "";
  visualizerBars = [];

  for (let index = 0; index < 32; index += 1) {
    const barElement = document.createElement("div");
    barElement.className = "visualizer-bar";
    visualizer.appendChild(barElement);
    visualizerBars.push(barElement);
  }
}

function createMiniEqualizer() {
  miniEqualizer.innerHTML = "";

  for (let index = 0; index < 12; index += 1) {
    const miniBar = document.createElement("div");
    miniBar.className = "mini-bar";
    miniBar.style.animationDelay = `${index * 0.08}s`;
    miniEqualizer.appendChild(miniBar);
  }
}

function playStation(stationId, shouldStartAudio = true) {
  const selectedStation = stationList.find(function (station) {
    return station.id === stationId;
  });

  if (!selectedStation) {
    return;
  }

  currentStation = selectedStation;
  currentTrackIndex = 0;
  currentChatIndex = 0;

  document.documentElement.style.setProperty("--station-color", currentStation.color);
  stationName.textContent = currentStation.name;
  mainStationTitle.textContent = currentStation.name;
  frequencyDisplay.textContent = currentStation.frequency;
  vibeBadge.textContent = currentStation.vibe;
  djName.textContent = currentStation.dj;
  setNowPlaying(currentStation.tracks[0]);

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

function setNowPlaying(track) {
  trackName.textContent = track;
  miniTrack.textContent = track;
}

function updateActiveStationButton() {
  document.querySelectorAll(".station-pill").forEach(function (button) {
    button.classList.toggle("active", button.dataset.stationId === currentStation.id);
  });
}

function handlePlayButton() {
  if (radioAudio.paused && !fallbackOscillator) {
    startAudioPlayback();
    return;
  }

  pausePlayback();
}

function pausePlayback() {
  radioAudio.pause();
  stopFallbackTone();
  playBtn.textContent = "Play";
}

function setupAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return false;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }

  if (!audioSource) {
    audioSource = audioContext.createMediaElementSource(radioAudio);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
  }

  return true;
}

function startAudioPlayback() {
  const hasAudio = setupAudioContext();

  if (!hasAudio) {
    startVisualFallback();
    return;
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  radioAudio.play()
    .then(function () {
      stopFallbackTone();
      playBtn.textContent = "Pause";
      drawVisualizer();
    })
    .catch(function () {
      startFallbackTone();
      playBtn.textContent = "Pause";
      drawVisualizer();
      appendChatMessage("Local audio file missing. Switching to generated signal.", currentStation.dj);
    });
}

function startVisualFallback() {
  playBtn.textContent = "Pause";
  drawVisualizer();
  appendChatMessage("Audio API unavailable. Visual signal mode is active.", currentStation.dj);
}

function drawVisualizer() {
  window.cancelAnimationFrame(animationFrameId);

  function renderFrame() {
    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray);
    }

    visualizerBars.forEach(function (bar, index) {
      const audioHeight = dataArray ? dataArray[index % dataArray.length] / 2.2 : 0;
      const fallbackHeight = 18 + Math.sin(Date.now() / 160 + index) * 18 + Math.random() * 14;
      const isActive = !radioAudio.paused || fallbackOscillator;
      const height = isActive ? Math.max(8, audioHeight || fallbackHeight) : 8;
      bar.style.height = `${Math.min(100, height)}%`;
    });

    animationFrameId = window.requestAnimationFrame(renderFrame);
  }

  renderFrame();
}

function saveVolume(value) {
  localStorage.setItem("nightshift-volume", value);
}

function loadVolume() {
  const savedVolume = localStorage.getItem("nightshift-volume");
  const volumeValue = savedVolume || "0.65";
  volumeSlider.value = volumeValue;
  radioAudio.volume = Number(volumeValue);
}

function handleVolumeChange() {
  const volume = Number(volumeSlider.value);
  radioAudio.volume = volume;

  if (fallbackGain) {
    fallbackGain.gain.value = radioAudio.muted ? 0 : volume * 0.14;
  }

  saveVolume(volumeSlider.value);
}

function toggleMute() {
  radioAudio.muted = !radioAudio.muted;

  if (fallbackGain) {
    fallbackGain.gain.value = radioAudio.muted ? 0 : Number(volumeSlider.value) * 0.14;
  }

  muteBtn.textContent = radioAudio.muted ? "Unmute" : "Mute";
}

function updateClock() {
  clockDisplay.textContent = new Date().toLocaleTimeString("en-US", {
    hour12: false
  });
}

function cycleTrackName() {
  currentTrackIndex = (currentTrackIndex + 1) % currentStation.tracks.length;
  setNowPlaying(currentStation.tracks[currentTrackIndex]);
}

function updateListenerCount() {
  const changeAmount = Math.floor(Math.random() * 8) - 2;
  fakeListeners = Math.min(4200, Math.max(800, fakeListeners + changeAmount));
  listenerCount.textContent = fakeListeners.toLocaleString();
  signalStrength.textContent = `${Math.floor(Math.random() * 4) + 95}%`;
}

function appendChatMessage(message, sender = "listener") {
  const messageElement = document.createElement("div");
  const senderElement = document.createElement("strong");
  const textElement = document.createElement("span");

  messageElement.className = "chat-message";
  senderElement.textContent = sender;
  textElement.textContent = message;

  messageElement.append(senderElement, textElement);
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function resetChat() {
  chatLog.innerHTML = "";
  appendChatMessage(`You are tuned into ${currentStation.name}.`, currentStation.dj);
  appendChatMessage(currentStation.chatMessages[0], "nightlistener");
}

function startFakeChatLoop() {
  window.clearTimeout(chatTimeout);

  const randomDelay = Math.floor(Math.random() * 30000) + 15000;
  chatTimeout = window.setTimeout(function () {
    currentChatIndex = (currentChatIndex + 1) % currentStation.chatMessages.length;
    appendChatMessage(currentStation.chatMessages[currentChatIndex], getRandomUsername());
    startFakeChatLoop();
  }, randomDelay);
}

function getRandomUsername() {
  const usernames = [
    "sleepyUser",
    "staticKid",
    "chaiCoder",
    "midnightGuest",
    "lofiListener",
    "finalsSurvivor"
  ];

  return usernames[Math.floor(Math.random() * usernames.length)];
}

function handleTrackRequest(event) {
  event.preventDefault();

  if (requestTrackSelect.value === "") {
    appendChatMessage("Select a track first before sending a request.", currentStation.dj);
    return;
  }

  const selectedTrack = requestTracks[Number(requestTrackSelect.value)];
  const requestedTrack = `${selectedTrack.name} / ${selectedTrack.artist}`;

  setNowPlaying(requestedTrack);
  appendChatMessage(`Request accepted. Queuing "${selectedTrack.name}".`, currentStation.dj);
  appendChatMessage(`"${selectedTrack.name}" requested by a night listener.`, "SYSTEM");
  requestTrackSelect.value = "";

  if (!radioAudio.paused || fallbackOscillator) {
    startFallbackTone();
  }
}

function restartStationLoops() {
  window.clearInterval(trackInterval);
  window.clearInterval(listenerInterval);
  window.clearTimeout(chatTimeout);

  trackInterval = window.setInterval(cycleTrackName, 30000);
  listenerInterval = window.setInterval(updateListenerCount, 3000);
  startFakeChatLoop();
}

function dragWidget(widgetElement) {
  const handle = widgetElement.querySelector(".widget-handle");
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener("mousedown", startMouseDrag);
  document.addEventListener("mousemove", moveMouseDrag);
  document.addEventListener("mouseup", stopDrag);
  handle.addEventListener("touchstart", startTouchDrag, { passive: true });
  document.addEventListener("touchmove", moveTouchDrag, { passive: true });
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

function startFallbackTone() {
  if (!setupAudioContext()) {
    return;
  }

  stopFallbackTone();
  radioAudio.pause();

  fallbackOscillator = audioContext.createOscillator();
  fallbackGain = audioContext.createGain();
  fallbackOscillator.type = "sine";
  fallbackOscillator.frequency.value = currentStation.fallbackFrequency;
  fallbackGain.gain.value = radioAudio.muted ? 0 : Number(volumeSlider.value) * 0.14;

  fallbackOscillator.connect(fallbackGain);
  fallbackGain.connect(analyser);
  fallbackOscillator.start();
}

function stopFallbackTone() {
  if (!fallbackOscillator) {
    return;
  }

  fallbackOscillator.stop();
  fallbackOscillator.disconnect();
  fallbackOscillator = null;
  fallbackGain = null;
}

document.addEventListener("DOMContentLoaded", initApp);
