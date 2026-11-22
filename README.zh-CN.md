# 双词电台

[English](README.md) · [打开网站](https://band-name-radio.xiaosang.cc/) · [GitHub](https://github.com/holynova/band-name-radio)

按空格换一个乐队名。两组词库各 308 个词，能搭出 94,864 个不重样的名字。打开声音，还能听到这个名字的旋律。

<img src="assets/screenshot.png" width="360" alt="双色乐队名与最近生成记录">

点「声音」后，轻点屏幕上的名字即可重播。最近八个名字保存在当前浏览器里，一轮抽完才会重新洗牌。

## 本地运行

```sh
npm run check
python3 -m http.server 8000 --directory dist
```

打开 `http://localhost:8000`。`git push origin main` 后，Cloudflare Pages 会检查并发布 `dist/` 内的静态文件。

<a href="https://band-name-radio.xiaosang.cc/"><img src="assets/qr.png" width="112" alt="扫码在手机打开"></a>
