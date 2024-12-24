export default function jigsawPlugin() {
  return {
    name: "vite-plugin-jigsaw",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV !== "production") {
        return html.replace(
          "</body>",
          `<script type="module" src="/node_modules/@p233-studio/jigsaw/dist/index.js"></script></body>`
        );
      }
      return html;
    }
  };
}
