export default function pixelMirrorPlugin() {
  return {
    name: "vite-plugin-pixel-mirror",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV !== "production") {
        return html.replace("</body>", `<script defer src="/node_modules/pixel-mirror/dist/index.js"></script></body>`);
      }
      return html;
    }
  };
}
