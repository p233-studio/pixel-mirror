import "./App.svelte";

const tagName = "pixel-mirror";

if (!document.querySelector(tagName)) {
  document.body.appendChild(document.createElement(tagName));
}

// Sets html element position to relative.
// This is the minimal-cost solution for overlay positioning.
// Most host projects should be unaffected by this change.
document.documentElement.style.position = "relative";
