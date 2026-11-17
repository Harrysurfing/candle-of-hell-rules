# 彼岸之烛 · 规则速查

桌边随时查阅用的非官方规则摘要：对照表、术语、常见问题、故事 / 冒险 / 检定。

打开后可搜「借机」「阴」「协助」；分类与搜索互不卡死。支持加到手机主屏幕（`manifest.json`）。

中文字体 `Noto Sans SC` 已自托管在 `fonts/`（SIL OFL），不依赖 Google Fonts。

## 本地预览

```bash
npx --yes serve -l 5173
```

浏览器打开提示的地址即可。

## 部署到免费托管

### Cloudflare Pages（推荐）

```bash
npx --yes wrangler pages deploy . --project-name=bian-zhi-zhu-rules
```

首次会引导登录 Cloudflare 账号。

### Netlify

```bash
npx --yes netlify-cli deploy --dir=. --prod
```

### GitHub Pages

把本目录推到公开仓库，在 Settings → Pages 选择根目录或 `/docs`。
