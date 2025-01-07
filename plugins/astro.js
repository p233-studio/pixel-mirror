export default function pixelMirror() {
  return {
    name: "pixel-mirror",
    hooks: {
      "astro:config:setup": ({ command, injectScript }) => {
        if (command === "dev") {
          injectScript(
            "head-inline",
            `const script = document.createElement("script");
             script.src = "/node_modules/pixel-mirror/dist/index.js";
             script.defer = true;
             document.head.appendChild(script);`
          );
        }
      }
    }
  };
}
