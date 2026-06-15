import { useCafeSettings } from "@/hooks/useCafeSettings";
import { LegalPageLayout } from "./LegalPageLayout";

export function PrivacidadPage() {
  const { settings } = useCafeSettings();
  const cafeName = settings?.cafe_name ?? "Aromático Café";
  const email = settings?.email ?? "contacto@aromaticocafe.com";
  const address = settings?.address;

  return (
    <LegalPageLayout
      title="Política de Privacidad"
      lastUpdated="6 de junio de 2026"
    >
      <section>
        <h2 className="legal-h2">1. Introducción</h2>
        <p>
          La presente Política de Privacidad describe la forma en que{" "}
          <strong>{cafeName}</strong> recolecta, usa, almacena, transfiere y protege
          la información personal de las personas que interactúan con nuestro sitio
          web, nuestras instalaciones físicas y nuestros canales de atención (en
          adelante, los "Titulares").
        </p>
        <p>
          Esta política se desarrolla en cumplimiento de la Ley Estatutaria 1581 de
          2012, el Decreto 1377 de 2013 y demás normas concordantes que regulan la
          protección de datos personales en la República de Colombia.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">2. Responsable del tratamiento</h2>
        <p>El responsable del tratamiento de los datos personales es:</p>
        <ul className="legal-list">
          <li>
            <strong>Razón social:</strong> {cafeName}
          </li>
          {address && (
            <li>
              <strong>Dirección:</strong> {address}
            </li>
          )}
          <li>
            <strong>Correo electrónico:</strong>{" "}
            <a href={`mailto:${email}`} className="legal-link">
              {email}
            </a>
          </li>
          <li>
            <strong>País:</strong> Colombia
          </li>
        </ul>
      </section>

      <section>
        <h2 className="legal-h2">3. Datos personales que recolectamos</h2>
        <p>
          Dependiendo de la interacción del Titular con {cafeName}, podemos
          recolectar las siguientes categorías de datos:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Datos de identificación:</strong> nombre completo, número de
            documento (cuando sea estrictamente necesario).
          </li>
          <li>
            <strong>Datos de contacto:</strong> número telefónico, correo
            electrónico, dirección.
          </li>
          <li>
            <strong>Datos de reservas:</strong> fecha y hora de visita, número de
            comensales, preferencias indicadas voluntariamente.
          </li>
          <li>
            <strong>Datos de navegación:</strong> dirección IP, tipo de dispositivo,
            navegador, páginas visitadas y tiempo de permanencia (recopilados
            automáticamente a través de cookies y herramientas analíticas).
          </li>
          <li>
            <strong>Datos transaccionales:</strong> productos consumidos, métodos de
            pago utilizados (no se almacenan números completos de tarjetas).
          </li>
        </ul>
        <p>
          {cafeName} no recolecta datos sensibles (origen racial, salud,
          orientación sexual, creencias religiosas) ni datos de menores de edad,
          salvo con autorización expresa de sus representantes legales.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">4. Finalidades del tratamiento</h2>
        <p>Los datos personales recolectados son utilizados para:</p>
        <ul className="legal-list">
          <li>Gestionar y confirmar reservas de mesa.</li>
          <li>
            Comunicarnos con el Titular para asuntos relacionados con su visita,
            consulta o solicitud.
          </li>
          <li>Procesar pagos y emitir comprobantes o facturas cuando corresponda.</li>
          <li>
            Enviar información sobre promociones, eventos y novedades, siempre que
            el Titular haya otorgado autorización previa.
          </li>
          <li>
            Mejorar nuestros productos, servicios y la experiencia del cliente.
          </li>
          <li>
            Cumplir obligaciones legales, contables y tributarias propias del
            establecimiento.
          </li>
          <li>
            Analizar el comportamiento de navegación en el sitio web para optimizar
            su funcionamiento.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="legal-h2">5. Derechos del Titular</h2>
        <p>
          De acuerdo con el artículo 8° de la Ley 1581 de 2012, todo Titular de
          datos personales tiene derecho a:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Conocer, actualizar y rectificar</strong> sus datos personales
            frente a {cafeName}.
          </li>
          <li>
            <strong>Solicitar prueba</strong> de la autorización otorgada para el
            tratamiento de sus datos.
          </li>
          <li>
            <strong>Ser informado</strong>, previa solicitud, sobre el uso que se ha
            dado a sus datos personales.
          </li>
          <li>
            <strong>Presentar quejas</strong> ante la Superintendencia de Industria y
            Comercio (SIC) por infracciones a la ley.
          </li>
          <li>
            <strong>Revocar la autorización</strong> y/o solicitar la supresión de
            sus datos cuando no se respeten los principios, derechos y garantías
            constitucionales y legales.
          </li>
          <li>
            <strong>Acceder en forma gratuita</strong> a sus datos personales que
            hayan sido objeto de tratamiento.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="legal-h2">6. Procedimiento para ejercer los derechos</h2>
        <p>
          El Titular puede ejercer sus derechos enviando una solicitud al correo
          electrónico{" "}
          <a href={`mailto:${email}`} className="legal-link">
            {email}
          </a>{" "}
          con la siguiente información:
        </p>
        <ul className="legal-list">
          <li>Nombre completo y documento de identificación.</li>
          <li>Descripción clara y concreta de la solicitud.</li>
          <li>Datos de contacto para la respuesta.</li>
          <li>Documentos que soporten la solicitud, si aplica.</li>
        </ul>
        <p>
          {cafeName} dará respuesta a las consultas en un plazo máximo de diez (10)
          días hábiles y a los reclamos en un plazo máximo de quince (15) días
          hábiles, contados a partir del día siguiente a la recepción de la
          solicitud, conforme a los artículos 14 y 15 de la Ley 1581 de 2012.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">7. Autorización del Titular</h2>
        <p>
          La autorización para el tratamiento de los datos personales se obtiene a
          través de mecanismos como:
        </p>
        <ul className="legal-list">
          <li>
            La realización de una reserva en línea, donde el Titular acepta esta
            política.
          </li>
          <li>El envío voluntario de información a nuestros canales de contacto.</li>
          <li>La entrega presencial de datos al momento de un evento o solicitud.</li>
        </ul>
        <p>
          La aceptación de los servicios o el uso del sitio web implica la
          aceptación de la presente Política de Privacidad.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">8. Almacenamiento y medidas de seguridad</h2>
        <p>
          {cafeName} adopta medidas técnicas, humanas y administrativas razonables
          para garantizar la seguridad de los datos personales y evitar su
          adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento.
        </p>
        <p>
          Los datos se almacenan en servidores seguros con cifrado en tránsito y en
          reposo. El acceso a los mismos está restringido al personal autorizado y
          solo se conservan durante el tiempo necesario para cumplir las finalidades
          descritas o las obligaciones legales aplicables.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">9. Cookies y tecnologías similares</h2>
        <p>
          Nuestro sitio web utiliza cookies y tecnologías similares para mejorar la
          experiencia del usuario. Para conocer en detalle qué cookies utilizamos y
          cómo gestionarlas, consulte nuestra{" "}
          <a href="/cookies" className="legal-link">
            Política de Cookies
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="legal-h2">10. Transferencia y transmisión de datos</h2>
        <p>
          {cafeName} no comparte datos personales con terceros, salvo cuando sea
          necesario para la prestación del servicio (por ejemplo, procesadores de
          pago, plataformas tecnológicas) o cuando exista una obligación legal. En
          dichos casos, se exige a los terceros adoptar medidas equivalentes de
          protección de datos.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">11. Vigencia y modificaciones</h2>
        <p>
          La presente Política de Privacidad rige a partir de la fecha de su última
          actualización indicada al inicio del documento. {cafeName} se reserva el
          derecho de modificarla en cualquier momento, lo que será informado a través
          del sitio web. Se recomienda revisar periódicamente esta política para
          conocer los cambios.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">12. Contacto</h2>
        <p>
          Para cualquier consulta, reclamación o solicitud relacionada con el
          tratamiento de sus datos personales, el Titular puede comunicarse al correo
          electrónico{" "}
          <a href={`mailto:${email}`} className="legal-link">
            {email}
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
