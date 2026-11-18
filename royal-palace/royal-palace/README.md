# The Royal Palace — Princess Day gift

Vite + React + react-three-fiber. Every scene is built from primitives, so it loads fast.

## 1. Add your photos/videos
Copy files into `public/media/` using the names in `src/config.js` (`memory1.jpg` … `memory8.jpg`, `memory4.mp4`, `song.mp3`).
Any extension works: change the `src` in config to match. Photos are resized to 1600px automatically.
Keep videos short (under 15 MB) and MP4/H.264. Missing photos show a gold shimmer.

## 2. Change texts
Edit only `src/config.js`: names, memory titles/captions, `loveLetter`, `ballroomSignText`, `finalLines`.
(Set `const her` and `const me` at the top first.)

## 3. Run locally (Antigravity or any terminal)
```
npm install
npm run dev
```
Open the printed URL. To test on your phone (same Wi-Fi) use the "Network" URL.
The camera needs HTTPS on phones: run `npm run dev:https` and accept the self-signed certificate warning.

## 4. Deploy for a shareable link
- **Vercel**: push to GitHub, "Add New Project", import it. Framework: Vite, build `npm run build`, output `dist`.
- **Netlify**: same, or run `npm run build` and drag the `dist` folder onto app.netlify.com/drop.
Both give an HTTPS link, so the camera works. Open it on your phone once before you send it.

Notes: music starts on the first tap (browser rule). Face tracking downloads a small MediaPipe model from Google/jsDelivr, and falls back to a fixed oval if it cannot load.
