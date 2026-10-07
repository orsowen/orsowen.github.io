# OB Portfolio — retro TV room

A portfolio shown on a retro CRT TV in a cozy room, with a main menu, a falling-blocks game, sounds and music.

## Folder structure

```
ob-portfolio/
├── index.html          the room scene (TV, furniture, posters) and script includes
├── data/
│   └── content.json    ALL portfolio text, EN + FR  ← edit this
├── assets/
│   └── photo.jpg       profile photo
├── css/
│   └── style.css       all styles
└── js/
    ├── content.js      reads content.json and builds the 7 portfolio screens
    ├── app.js          screen flow: standby → boot → menu → loading → portfolio, input, home button, screensaver
    ├── game.js         BLOCK DROP game
    ├── sound.js        sound effects, boot jingles, lo-fi music (generated, no audio files)
    └── scene.js        bookshelf items, game spines, live wall clock
```

## Run it

The page loads `data/content.json`, so it must be opened through a web server, not by double-clicking `index.html`.

- **Quick local test:** in this folder run `python -m http.server 8000`, then open http://localhost:8000
- **VS Code:** right-click `index.html` → *Open with Live Server*
- **Online:** push the folder to a GitHub repo and turn on GitHub Pages (Settings → Pages). It works as is.

## Edit your content (no code changes)

Everything you see on the TV screens comes from `data/content.json`. Keep `en` and `fr` with the same structure.

| Key | What it controls |
|---|---|
| `meta` | name, first/last name on the profile, photo path, email, LinkedIn, GitHub |
| `skills` | chips under your profile |
| `certifications` | badges under Education |
| `bootLines` | lines typed on the startup screen (`status` "OK" shows in green, "" shows nothing) |
| `en.screenTitles` / `fr.screenTitles` | titles in the top bar for each screen |
| `profile` | player tag, location, role, specialties line, description, skills title |
| `education` | list of `{ years, title, place, note }` — `note` is optional (leave `""`) |
| `experience` | list of `{ company, dates, place, role, bullets[], tools[] }` |
| `projects` | list of `{ type, year, title, description, tools[] }` — `type`: VR, AR, AI or WEB |
| `hobbies` | list of `{ icon, title, text }` — `icon`: swim, film, game, music, book, code, star |
| `contact` | title, subtitle and button labels |

**Add an item:** copy an existing block inside the list (from `{` to `}`), paste it after a comma, change the text. Do it in both `en` and `fr`.

**Change the photo:** replace `assets/photo.jpg` (square works best) or point `meta.photo` to another file.

Tip: if the screen says it could not load `content.json`, check the JSON for a missing comma or quote at https://jsonlint.com.

## Controls

- Mouse / touch, keyboard arrows + Enter, or the controller and buttons drawn in the room
- `M` mutes all sound, `Esc` goes back to the main menu
- TV power button (next to the green light under the screen) turns the screen off/on
- Console power button (front of the console) turns the console off/on: off shows static on the TV, back on plays the disc-reading screen
- On phones a remote control appears at the bottom: TV power, ◀, Home, ▶, Mute, console power
- Game: ← → move, ↑ rotate, ↓ soft drop, Space hard drop, P pause
