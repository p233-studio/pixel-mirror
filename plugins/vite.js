export default function pixelMirror() {
  return {
    name: "pixel-mirror",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV !== "production") {
        return html.replace("</head>", `<script defer src="/node_modules/pixel-mirror/dist/index.js"></script></head>`);
      }
      return html;
    }
  };
}
