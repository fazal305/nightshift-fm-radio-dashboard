# Nightshift FM Radio Dashboard

A moody late-night radio dashboard built with HTML, CSS, and vanilla JavaScript.

Nightshift FM simulates a fictional online radio control room with station switching, animated visualizers, listener stats, floating widgets, request messages, live chat, and a generated fallback tone when local audio files are not available.

## Live Demo

https://fazal305.github.io/nightshift-fm-radio-dashboard/

## Features

- Full-screen neon radio dashboard
- Multiple fictional radio stations
- Dynamic station color themes
- Animated 32-bar visualizer
- Generated fallback audio when local tracks are missing
- Play, pause, mute, and volume controls
- Saved volume preference with `localStorage`
- Real-time clock
- Fake listener counter
- Simulated live chat
- Fictional track request flow
- Draggable desktop widgets
- Responsive mobile layout
- Reduced-motion support

## Audio Notice

This repository does not include music files. The app supports local audio files for personal testing, but the public demo uses a generated fallback tone when files are missing.

To test with your own audio, add files under:

```text
assets/audio/
```

Then update the audio file paths in `nightshift-script.js`.

Only use audio that you created, own, or have permission to use.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Web Audio API
- localStorage API

## Project Structure

```text
nightshift-fm-radio-dashboard/
|-- index.html
|-- nightshift-styles.css
|-- nightshift-script.js
|-- LICENSE
`-- README.md
```

## What I Practiced

- Building a themed dashboard UI
- Managing interactive state without a framework
- Working with audio playback and browser audio fallback
- Rendering stations, chat, and request options from JavaScript data
- Saving user preferences with `localStorage`
- Creating animated visual feedback with CSS and JavaScript
- Handling draggable widgets on larger screens
- Designing a responsive interface for desktop and mobile

## Run Locally

Open `index.html` in a browser.

No build step or package installation is required.

## Author

Built by Fazal Abbas.

- GitHub: https://github.com/fazal305
- LinkedIn: https://www.linkedin.com/in/fazal-abbas-4653dg86

## License

This project is licensed under the MIT License. Audio files are not included.
