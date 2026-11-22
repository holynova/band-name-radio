# Two-Word Radio

[简体中文](README.zh-CN.md) · [Open the site](https://band-name-radio.xiaosang.cc/) · [GitHub](https://github.com/holynova/band-name-radio)

Press Space to tune in to a new band. Two collections of 308 words form 94,864 names, each with a short melody.

<img src="assets/screenshot.png" width="360" alt="A generated two-color band name and its recent history">

Try the sound switch, then click the name to replay it. The last eight names stay on this device after refreshing. A full round exhausts every pairing before reshuffling.

## Run locally

```sh
npm run check
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Cloudflare Pages checks the static files in `dist/` after `git push origin main`.

<a href="https://band-name-radio.xiaosang.cc/"><img src="assets/qr.png" width="112" alt="Scan to open on mobile"></a>
