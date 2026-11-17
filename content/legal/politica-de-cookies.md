---
titulo: "Política de cookies"
slug: politica-de-cookies
version: "1.0-borrador"
vigenteDesde: ""
seo:
  title: "Política de cookies y almacenamiento local"
  description: "Revisa qué cookies y datos de almacenamiento local usa este sitio, para qué sirven, cuánto duran y cómo cambiar tus preferencias en cualquier momento."
notasRevision:
  - "Confirmar con desarrollo que esta política describe exactamente la implementación: nombres, categorías y duraciones de cada cookie o elemento de almacenamiento. Antes de publicar, revisar en el navegador (herramientas de desarrollo) las cookies que se instalan en producción con cada combinación de preferencias."
  - "lx_attr: el texto afirma que solo se guarda si el usuario acepta la categoría «Funcionales», que se borra si después la desactiva y que el sitio lo descarta a los 90 días. Confirmar que el código hace las tres cosas; si se guarda por defecto, ajustar el texto y revisar el riesgo, porque incluye identificadores de clic de anuncios (gclid, fbclid)."
  - "Modo de consentimiento de Google: confirmar si se usa el modo básico (las etiquetas no se cargan hasta que hay consentimiento) o el avanzado (las etiquetas se cargan y envían a Google señales sin cookies con datos técnicos como hora, navegador y página de referencia). Si es el avanzado, agregar esa explicación en la sección de analítica."
  - "Duraciones de terceros según la documentación de cada proveedor consultada el 2026-11-13: _ga y _ga_<ID>, 2 años por defecto (support.google.com/analytics/answer/11397207); _fbc, 90 días (developers.facebook.com, parámetros fbp y fbc); _fbp, 90 días según fuentes secundarias y ayuda de Meta. Verificar en producción, porque los proveedores pueden cambiarlas o la configuración puede modificarlas."
  - "Si se vincula GA4 o Google Tag Manager con Google Ads, o se activa el vinculador de conversiones, aparecerán cookies de publicidad de Google (por ejemplo, _gcl_au) que hoy no están en la tabla. Agregarlas antes de activarlas."
  - "Confirmar que la coincidencia avanzada automática del Píxel de Meta está desactivada. Si se activa, el píxel envía a Meta datos de los formularios en formato cifrado y habría que informarlo aquí y en la política de tratamiento."
  - "Confirmar si las campañas de Meta usan audiencias de personas que visitaron el sitio (remarketing). El texto lo menciona como posible según la configuración de las campañas."
  - "El aviso o banner de cookies debe informar, antes de aceptar, que Google y Meta pueden tratar los datos para fines propios y fuera de Colombia, y enlazar a esta política."
  - "Herramienta de agendamiento: hoy se describe como no activa. Si la firma la habilita, actualizar esta política y la tabla antes de activarla."
revision:
  estado: pendiente
  abogado: ""
  fecha: ""
---

Esta política explica qué cookies y tecnologías similares usa el sitio {{sitioUrl}}, operado por {{razonSocial}} ({{marca}}), para qué sirven y cómo puedes elegir cuáles aceptar.

## Qué son las cookies y el almacenamiento local

Las **cookies** son pequeños archivos que un sitio web guarda en tu navegador para recordar información sobre tu visita. El **almacenamiento local** es un espacio del navegador que cumple una función parecida, pero la información no se envía automáticamente al servidor en cada visita.

Algunas cookies las instala {{marca}} (cookies propias) y otras las instalan servicios externos (cookies de terceros) cuando los activas.

## Categorías que usa este sitio

### Necesarias

Permiten que el sitio funcione y recuerde tu elección sobre las cookies. Usamos la cookie `lx_consent`, que guarda tus preferencias durante 180 días. No se puede desactivar desde el panel, porque sin ella el sitio no podría recordar lo que elegiste.

Cuando envías una solicitud, el sitio guarda en el almacenamiento de la sesión del navegador (`lx_siguiente_paso`) el número de referencia y un resumen general del asunto (tema, etapa, cuándo quieres avanzar, modalidad y si puedes pagar la consulta). Sirve solo para escribir el mensaje de WhatsApp de la página de confirmación y se borra al cerrar la pestaña. No incluye tu nombre, teléfono ni correo.

### Funcionales

Usamos el almacenamiento local del navegador (no una cookie) con el elemento `lx_attr`, que guarda el origen de tu visita: parámetros UTM de las campañas, identificadores de clic de anuncios (gclid de Google y fbclid de Meta), la página por la que entraste al sitio y el sitio desde el que llegaste.

Esta información sirve para asociar el origen de tu visita a una solicitud que decidas enviar por un formulario. Se conserva durante 90 días y no se comparte con terceros, salvo como parte de la solicitud que tú envías a {{marca}}. Si no envías ninguna solicitud, permanece solo en tu navegador hasta que el sitio la descarte.

Solo se activa si aceptas la categoría «Funcionales» en el aviso de cookies o en «Preferencias de cookies». Si después la desactivas, el sitio borra esa información de tu navegador.

### Analítica

Solo con tu consentimiento. Usamos **Google Analytics 4**, que se carga directamente o a través de **Google Tag Manager**, para conocer de forma agregada cómo se usa el sitio: por ejemplo, qué páginas se visitan y cuánto dura una visita. Instala las cookies `_ga` y `_ga_<ID>`.

El sitio usa el **Modo de consentimiento de Google** con todas las opciones denegadas por defecto (almacenamiento de analítica, almacenamiento de publicidad, datos de usuario para publicidad y personalización de anuncios). Mientras no aceptes, las etiquetas de Google no se cargan y, por tanto, no instalan cookies de analítica ni de publicidad.

### Publicidad

Solo con tu consentimiento. Usamos el **Píxel de Meta** para medir los resultados de los anuncios de {{marca}} en plataformas de Meta (como Facebook e Instagram), optimizarlos y, según la configuración de cada campaña, mostrar anuncios a personas que ya visitaron el sitio. Instala las cookies `_fbp` y `_fbc`.

### Contenido incrustado

Los videos de YouTube (que se cargan desde el dominio youtube-nocookie.com), Instagram o TikTok solo se cargan cuando pulsas reproducir. A partir de ese momento, el proveedor puede instalar sus propias cookies o tecnologías similares y tratar datos según sus políticas, que te recomendamos revisar.

### Herramientas de agendamiento

Después de enviar una solicitud, el sitio puede ofrecerte una agenda en línea de Google Calendar (o de Calendly, si {{marca}} la habilita) para elegir la fecha de tu consulta. La agenda no se carga hasta que pulsas «Ver horarios disponibles». Desde ese momento, el proveedor puede instalar sus propias cookies según su política.

## Tabla de cookies y almacenamiento local

| Nombre | Proveedor | Finalidad | Categoría | Duración |
|---|---|---|---|---|
| `lx_consent` | {{marca}} (propia) | Guardar tus preferencias de cookies | Necesaria | 180 días |
| `lx_attr` (almacenamiento local) | {{marca}} (propia) | Guardar el origen de la visita para asociarlo a una solicitud que envíes | Funcional | 90 días |
| `_ga` | Google (Google Analytics 4) | Distinguir usuarios para estadísticas de uso | Analítica | 2 años |
| `_ga_<ID>` | Google (Google Analytics 4) | Mantener el estado de la sesión | Analítica | 2 años |
| `_fbp` | Meta (Píxel de Meta) | Identificar el navegador para medir y optimizar anuncios | Publicidad | 90 días |
| `_fbc` | Meta (Píxel de Meta) | Guardar el identificador de clic (fbclid) cuando llegas desde un anuncio de Meta | Publicidad | 90 días |
| `lx_siguiente_paso` (almacenamiento de sesión) | {{marca}} (propia) | Escribir el mensaje de WhatsApp de la página de confirmación | Necesaria | Hasta cerrar la pestaña |
| Cookies de YouTube, Instagram o TikTok | Google, Meta o TikTok | Reproducir el contenido incrustado que activas | Contenido incrustado | Según cada proveedor |
| Cookies de Google Calendar o Calendly | Google o Calendly | Mostrar la agenda y registrar la cita que reservas | Contenido incrustado | Según cada proveedor |

Las duraciones de las cookies de terceros son las que informa cada proveedor y pueden cambiar.

## Cómo cambiar tus preferencias

Puedes cambiar o retirar tu consentimiento en cualquier momento desde el enlace **«Preferencias de cookies»** en el pie de página. Retirar el consentimiento no afecta el uso que se haya hecho de la información antes de retirarlo.

También puedes borrar las cookies y el almacenamiento local desde la configuración de tu navegador, normalmente en la opción de borrar datos de sitios o de navegación. Si lo haces, el sitio volverá a preguntarte tus preferencias.

## Tus datos personales

Cuando la información obtenida con estas tecnologías se asocia a una persona identificada o identificable, se trata como dato personal según la **Política de tratamiento de datos personales**, donde se explican tus derechos y cómo ejercerlos. Puedes escribirnos a {{correoDatos}}.

## Cambios a esta política

Actualizaremos esta política cuando cambien las cookies o herramientas que usa el sitio. Si se incorpora una nueva categoría, te pediremos de nuevo tu consentimiento.

Vigente desde {{fechaVigencia}}.
