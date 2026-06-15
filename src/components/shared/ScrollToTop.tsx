import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Lleva el scroll al inicio cada vez que cambia la ruta.
 *
 * Sin esto, al navegar (por ejemplo desde un enlace del footer) la página nueva
 * conserva la posición de scroll anterior y aparece empezada desde abajo.
 * Reinicia tanto el scroll de la ventana (páginas públicas) como el del
 * contenedor `main` (el panel admin tiene su propio scroll interno).
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector("main")?.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
