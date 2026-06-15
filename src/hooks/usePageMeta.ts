import { useEffect } from "react";

/** Sets the document title and favicon for the current page. */
export function usePageMeta(title: string, faviconHref: string) {
  useEffect(() => {
    document.title = title;

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = faviconHref;
  }, [title, faviconHref]);
}
