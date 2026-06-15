// Prints an HTML fragment via a hidden same-origin iframe.
//
// Replaces the old `window.open(...) + document.write(...)` pattern: no popup
// (so no popup-blocker issues) and no document.write. `bodyHtml` is expected to
// come from a React-rendered ref's `innerHTML` (already escaped by React); the
// title is escaped defensively and the styles are static, so the generated
// document can't be used for HTML injection.

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : c === '"'
            ? "&quot;"
            : "&#39;",
  );
}

export function printHtml(opts: {
  title: string;
  styles: string;
  bodyHtml: string;
}) {
  const { title, styles, bodyHtml } = opts;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(
    title,
  )}</title><style>${styles}</style></head><body>${bodyHtml}</body></html>`;

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) {
      iframe.remove();
      return;
    }
    // Small delay so any images/fonts in the fragment can settle before print.
    setTimeout(() => {
      win.focus();
      win.print();
      // Tear down once the (modal) print dialog has been handled.
      setTimeout(() => iframe.remove(), 1000);
    }, 250);
  };

  document.body.appendChild(iframe);
}
