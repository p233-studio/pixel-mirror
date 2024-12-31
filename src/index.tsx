/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import css from "./styles/style.scss?inline";

// Sets html element position to relative.
// This is the minimal-cost solution for overlay positioning.
// Most host projects should be unaffected by this change.
document.documentElement.style.position = "relative";

class PixelMirror extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = css;
    shadow.appendChild(style);

    render(() => <App />, shadow);
  }
}

customElements.define("pixel-mirror", PixelMirror);

const container = document.createElement("pixel-mirror");
document.body.appendChild(container);
