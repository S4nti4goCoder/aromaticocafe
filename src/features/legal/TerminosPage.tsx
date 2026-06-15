import { useCafeSettings } from "@/hooks/useCafeSettings";
import { LegalPageLayout } from "./LegalPageLayout";

export function TerminosPage() {
  const { settings } = useCafeSettings();
  const cafeName = settings?.cafe_name ?? "Aromático Café";
  const email = settings?.email ?? "contacto@aromaticocafe.com";

  return (
    <LegalPageLayout title="Términos y Condiciones" lastUpdated="6 de junio de 2026">
      <section>
        <h2 className="legal-h2">1. Objeto y aceptación</h2>
        <p>
          Los presentes términos y condiciones (en adelante, los "Términos") regulan
          el acceso y uso del sitio web de <strong>{cafeName}</strong> (en adelante,
          el "Sitio"), así como los servicios ofrecidos a través del mismo. Al
          acceder, navegar o utilizar el Sitio, el usuario manifiesta haber leído,
          entendido y aceptado en su totalidad los presentes Términos. Si no está de
          acuerdo con alguno de ellos, deberá abstenerse de utilizar el Sitio.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">2. Información del titular</h2>
        <p>
          El Sitio es operado por <strong>{cafeName}</strong>, establecimiento
          comercial dedicado a la preparación y venta de café, bebidas y alimentos,
          con domicilio en Colombia. Para cualquier consulta relacionada con estos
          Términos, el usuario puede comunicarse al correo electrónico{" "}
          <a
            href={`mailto:${email}`}
            className="legal-link"
          >
            {email}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="legal-h2">3. Servicios ofrecidos</h2>
        <p>
          A través del Sitio, {cafeName} ofrece a sus usuarios la posibilidad de:
        </p>
        <ul className="legal-list">
          <li>Consultar la carta de productos, categorías y promociones vigentes.</li>
          <li>Realizar reservas de mesa para consumo en el establecimiento.</li>
          <li>Conocer la ubicación, horarios y datos de contacto del local.</li>
          <li>Acceder a información sobre eventos y novedades del establecimiento.</li>
        </ul>
        <p>
          Los precios, productos y promociones publicados en el Sitio son de carácter
          informativo y pueden variar sin previo aviso. La disponibilidad final
          dependerá del inventario en el establecimiento al momento del consumo.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">4. Reservas de mesa</h2>
        <p>
          Las reservas realizadas a través del Sitio están sujetas a confirmación por
          parte del establecimiento. {cafeName} se reserva el derecho de aceptar,
          modificar o cancelar reservas en función de la disponibilidad, ocupación
          del local u otras circunstancias operativas. Las reservas no implican el
          pago anticipado de productos, salvo que se indique expresamente.
        </p>
        <p>
          El usuario se compromete a proporcionar información veraz y actualizada al
          momento de realizar una reserva. En caso de no poder asistir, se solicita
          notificarlo con al menos dos (2) horas de anticipación a través de los
          canales de contacto disponibles.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">5. Uso permitido del Sitio</h2>
        <p>
          El usuario se compromete a hacer un uso adecuado del Sitio, conforme a la
          ley, la moral, el orden público y los presentes Términos. Queda
          expresamente prohibido:
        </p>
        <ul className="legal-list">
          <li>Utilizar el Sitio con fines fraudulentos o ilícitos.</li>
          <li>
            Introducir virus, programas maliciosos o cualquier elemento que pueda
            dañar la infraestructura del Sitio.
          </li>
          <li>
            Acceder, copiar o utilizar información del Sitio para fines comerciales no
            autorizados.
          </li>
          <li>
            Suplantar la identidad de otra persona al realizar reservas o
            comunicaciones.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="legal-h2">6. Propiedad intelectual</h2>
        <p>
          Todos los contenidos del Sitio, incluyendo pero no limitado a textos,
          imágenes, fotografías, logotipos, marcas, diseños gráficos, código fuente y
          arquitectura de la información, son propiedad de {cafeName} o de terceros
          que han autorizado su uso, y se encuentran protegidos por la legislación
          colombiana sobre propiedad intelectual y derechos de autor.
        </p>
        <p>
          Queda prohibida la reproducción, distribución, comunicación pública,
          transformación o cualquier otra forma de explotación de dichos contenidos
          sin autorización previa y escrita de {cafeName}.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">7. Limitación de responsabilidad</h2>
        <p>
          {cafeName} no garantiza la disponibilidad ininterrumpida del Sitio ni la
          ausencia de errores. El establecimiento no será responsable por daños
          derivados de fallas técnicas, interrupciones del servicio de internet,
          ataques informáticos u otras causas ajenas a su control razonable.
        </p>
        <p>
          La información publicada en el Sitio tiene carácter meramente informativo.
          La descripción de productos, precios y horarios puede actualizarse en
          cualquier momento. {cafeName} no asume responsabilidad por información
          desactualizada en el momento de la consulta.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">8. Protección de datos personales</h2>
        <p>
          El tratamiento de los datos personales proporcionados a través del Sitio se
          rige por la <a href="/privacidad" className="legal-link">Política de
          Privacidad</a> de {cafeName}, la cual cumple con lo dispuesto en la Ley
          1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia. Al
          utilizar el Sitio, el usuario reconoce haber leído y aceptado dicha
          política.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">9. Modificaciones</h2>
        <p>
          {cafeName} se reserva el derecho de modificar los presentes Términos en
          cualquier momento. Las modificaciones entrarán en vigencia desde su
          publicación en el Sitio. Es responsabilidad del usuario revisar
          periódicamente los Términos para mantenerse informado de los cambios.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">10. Ley aplicable y jurisdicción</h2>
        <p>
          Los presentes Términos se rigen por las leyes de la República de Colombia.
          Cualquier controversia derivada de su interpretación o aplicación será
          resuelta por los jueces competentes del domicilio del establecimiento,
          salvo disposición legal en contrario.
        </p>
      </section>

      <section>
        <h2 className="legal-h2">11. Contacto</h2>
        <p>
          Para cualquier consulta, sugerencia o reclamación relacionada con estos
          Términos, el usuario puede contactarnos a través del correo electrónico{" "}
          <a href={`mailto:${email}`} className="legal-link">
            {email}
          </a>{" "}
          o por los demás canales de contacto publicados en el Sitio.
        </p>
      </section>
    </LegalPageLayout>
  );
}
