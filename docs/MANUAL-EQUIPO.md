# Manual básico para el equipo de LEXPERTISE

## 1. Entrar al panel

1. Abrir `https://<dominio>/admin`.
2. Pulsar **Iniciar sesión con GitHub**. Solo funcionan las cuentas invitadas al repositorio con permiso de escritura.
3. El panel guarda los cambios en el repositorio. Cada cambio queda registrado (quién, cuándo y qué).

## 2. Flujo editorial

Todo cambio pasa por tres columnas: **Borrador → En revisión → Listo**. Al publicar desde «Listo», el sitio se vuelve a compilar (2–4 minutos).

**Regla de oro:** una página de servicio o un artículo solo aparece en el sitio público cuando:

- Servicios: `Disponibilidad comercial = activo` **y** `Revisión jurídica → Estado = aprobado`, con el nombre del abogado y la fecha.
- Recursos: `Estado = publicado`, con **autor verificado** y **fecha de revisión jurídica**.

Si falta la aprobación, la página sigue visible en el entorno de revisión (con un aviso amarillo), pero **no** en producción.

## 3. Qué se puede editar

| Sección del panel | Qué contiene |
|---|---|
| Áreas y servicios | Las 12 páginas (áreas, divorcios y sucesiones, landings). Titular, textos, pasos, documentos, preguntas frecuentes, fuentes, mensaje de WhatsApp. |
| Recursos y artículos | Artículos educativos y videos del equipo (Instagram, YouTube, TikTok). |
| Equipo | Un perfil por profesional. Marcar «Información verificada» solo con datos confirmados (nombre, cargo, tarjeta profesional, foto real). |
| Documentos legales | Aviso de privacidad, política de tratamiento, cookies, términos. |
| Configuración del sitio | Datos de la firma (razón social, NIT, contacto), consulta (precio/duración solo si están aprobados), agendamiento, WhatsApp, textos de inicio, textos de autorización, redirecciones. |
| Páginas institucionales | La firma y su metodología. |

## 4. Convertir un video en un recurso

1. **Recursos y artículos → Nuevo recurso.**
2. Título claro y la **pregunta principal** del video.
3. **Video del equipo:** plataforma + URL pública del video.
4. Explicación complementaria (lo que el video no alcanzó a decir), preguntas frecuentes y servicios relacionados.
5. Mover a **En revisión**. El abogado verifica, completa autor y fecha de revisión y cambia el estado a `publicado`.

El video solo se carga cuando la persona pulsa reproducir, así no se instalan cookies de terceros antes.

## 5. Reglas de redacción (resumen)

- Sin promesas de resultado, plazos ni porcentajes de éxito.
- Sin autoelogios ni comparaciones («expertos», «los mejores», «especialistas en»…).
- Las situaciones de ejemplo se rotulan como **hipotéticas**.
- Nunca publicar casos, nombres, documentos ni datos de clientes.
- Citar normas solo de fuentes oficiales (Secretaría del Senado, Función Pública, SUIN, Corte Constitucional, SIC, DIAN).
- No mencionar servicios de derecho penal.

El sistema revisa automáticamente estas expresiones en cada compilación (`npm run check:contenido`).

## 6. Textos de autorización

Si se modifica cualquier texto en **Configuración → Textos de autorización**, **cambiar también la versión** (por ejemplo, `2026-12-01.1`). Cada solicitud guarda la versión y una huella del texto aceptado como prueba de la autorización.

## 7. WhatsApp

**Configuración → WhatsApp:** número oficial en formato internacional (`57` + número, sin espacios ni signos) y un mensaje por tipo de página. El cambio se refleja en todos los botones del sitio.

## 8. Redirecciones del sitio anterior

**Configuración → Redirecciones 301:** agregar solo rutas que existían de verdad en el sitio anterior (verificadas en Search Console). Ejemplo: `/servicios-familia` → `/derecho-de-familia`.

## 9. Solicitudes recibidas

Las solicitudes no se ven en el panel de contenidos. Llegan al CRM (cuando esté conectado) y quedan en la base de datos. Cada una tiene una referencia `LX-AAAAMMDD-XXXXXX`, que la persona ve en la pantalla de confirmación.

Para atenderlas:

- Responder por el medio que eligió la persona.
- Las marcadas como **requiere revisión humana** (asunto fuera del portafolio) reciben una respuesta informativa.
- No pedir documentos por WhatsApp sin antes informar el tratamiento de datos.
