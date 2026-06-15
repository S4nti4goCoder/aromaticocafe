import { useCafeSettings } from "@/hooks/useCafeSettings";
import { LegalPageLayout } from "./LegalPageLayout";
import { RevokeCookieConsentButton } from "./RevokeCookieConsentButton";

export function CookiesPage() {
  const { settings } = useCafeSettings();
  const cafeName = settings?.cafe_name ?? "Aromático Café";
  const email = settings?.email ?? "contacto@aromaticocafe.com";

  return (
    <LegalPageLayout
      title="Política de Cookies"
      lastUpdated="6 de junio de 2026"
    >
      <section>
        <h2 className="legal-h2">1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que un sitio web guarda en
          el navegador o dispositivo del usuario cuando este lo visita. Permiten
          al sitio recordar información sobre la visita, como el idioma
          preferido, las preferencias de navegación o si el usuario ya ha
          iniciado sesión, mejorando la experiencia de uso.
        </p>
        <p>
          La presente Política de Cookies explica qué tipo de cookies utiliza el
          sitio web de <strong>{cafeName}</strong>, con qué finalidad y cómo el
          usuario puede gestionarlas.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">2. Tipos de cookies que utilizamos</h2>
        <p>
          De acuerdo con su finalidad, en este sitio se utilizan las siguientes
          categorías de cookies:
        </p>

        <h3 className="legal-h3">2.1. Cookies estrictamente necesarias</h3>
        <p>
          Son indispensables para el correcto funcionamiento del sitio. Permiten
          la navegación entre páginas, el uso de funciones básicas (como
          formularios de reserva o postulación) y la conservación de la sesión
          de usuario. Sin ellas, el sitio no podría funcionar adecuadamente.
        </p>
        <ul className="legal-list">
          <li>Cookies de sesión técnica</li>
          <li>Cookies de autenticación del panel administrativo</li>
          <li>Cookies de configuración del consentimiento</li>
        </ul>

        <h3 className="legal-h3">2.2. Cookies de preferencias</h3>
        <p>
          Permiten recordar las elecciones del usuario, como el tema visual
          (claro u oscuro) o el idioma. Mejoran la experiencia personalizada
          pero no son esenciales para el funcionamiento del sitio.
        </p>

        <h3 className="legal-h3">2.3. Cookies analíticas</h3>
        <p>
          Recolectan información de manera anónima sobre cómo los usuarios
          interactúan con el sitio (páginas más visitadas, tiempo de
          permanencia, dispositivo, navegador). Estos datos permiten a{" "}
          {cafeName} mejorar su sitio web. Se requiere consentimiento previo
          del usuario para activarlas.
        </p>

        <h3 className="legal-h3">2.4. Cookies de terceros</h3>
        <p>
          Algunas funcionalidades del sitio dependen de servicios externos que
          pueden instalar sus propias cookies, tales como:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Google Maps</strong> — para mostrar la ubicación del
            establecimiento.
          </li>
          <li>
            <strong>WhatsApp</strong> — para las funciones de contacto directo y
            reservas.
          </li>
          <li>
            <strong>Supabase</strong> — proveedor de infraestructura para
            autenticación y almacenamiento.
          </li>
        </ul>
        <p>
          {cafeName} no controla las cookies instaladas por estos terceros. Se
          recomienda revisar las políticas de privacidad y cookies de cada uno
          de ellos.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">3. Base legal para el uso de cookies</h2>
        <p>
          El uso de cookies en este sitio se sustenta en:
        </p>
        <ul className="legal-list">
          <li>
            El <strong>interés legítimo</strong> del establecimiento para
            cookies estrictamente necesarias.
          </li>
          <li>
            El <strong>consentimiento expreso del usuario</strong>, otorgado a
            través del banner de cookies, para las cookies analíticas, de
            preferencias y de terceros no esenciales.
          </li>
        </ul>
        <p>
          Lo anterior se ajusta a lo establecido en la Ley 1581 de 2012, el
          Decreto 1377 de 2013 y demás normas aplicables sobre protección de
          datos personales en Colombia.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">4. Gestión y revocación del consentimiento</h2>
        <p>
          El usuario puede aceptar, rechazar o personalizar el uso de cookies en
          cualquier momento desde el banner de cookies que aparece al ingresar
          al sitio por primera vez. Si ya ha elegido una opción y desea
          cambiarla, puede revocar su consentimiento aquí mismo:
        </p>

        <RevokeCookieConsentButton />

        <p className="mt-6">
          Adicionalmente, todos los navegadores modernos permiten al usuario
          configurar el tratamiento de las cookies. A continuación, enlaces
          oficiales con instrucciones para los navegadores más comunes:
        </p>
        <ul className="legal-list">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Microsoft Edge
            </a>
          </li>
          <li>
            <a
              href="https://support.brave.com/hc/en-us/articles/360050634931-How-Do-I-Manage-Cookies-In-Brave"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Brave
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="legal-h2">5. Consecuencias de deshabilitar cookies</h2>
        <p>
          La deshabilitación o bloqueo total de las cookies puede afectar el
          correcto funcionamiento de algunas secciones del sitio,
          particularmente las que requieren autenticación, formularios o
          contenido embebido de terceros (como mapas).
        </p>
      </section>

      <section>
        <h2 className="legal-h2">6. Modificaciones a esta política</h2>
        <p>
          {cafeName} se reserva el derecho de modificar esta Política de Cookies
          en cualquier momento, especialmente cuando existan cambios
          regulatorios, tecnológicos o en los servicios prestados. Cualquier
          modificación será publicada en esta misma página con su respectiva
          fecha de actualización.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">7. Contacto</h2>
        <p>
          Para cualquier consulta sobre esta Política de Cookies o sobre el
          tratamiento de datos personales relacionados con cookies, el usuario
          puede comunicarse al correo electrónico{" "}
          <a href={`mailto:${email}`} className="legal-link">
            {email}
          </a>
          .
        </p>
        <p>
          Esta política debe leerse en conjunto con nuestra{" "}
          <a href="/privacidad" className="legal-link">
            Política de Privacidad
          </a>{" "}
          y los{" "}
          <a href="/terminos" className="legal-link">
            Términos y Condiciones
          </a>{" "}
          del sitio.
        </p>
      </section>
    </LegalPageLayout>
  );
}
