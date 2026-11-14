# Especificación de contenidos — LEXPERTISE

Este documento define el formato y las reglas editoriales de todo el contenido del sitio.
El código valida cada archivo contra este esquema durante la compilación: un campo mal escrito
detiene el build con un mensaje claro.

## 1. Reglas editoriales obligatorias

1. **Idioma:** español de Colombia, tuteo ("conoce", "necesitas"), lenguaje claro, sin jerga innecesaria.
2. **Nada inventado:** no escribir nombres de abogados, razón social, NIT, teléfonos, direcciones,
   horarios, precios, años de experiencia, clientes, casos, premios ni testimonios.
3. **Publicidad jurídica (Ley 1123 de 2007, art. 31 y concordantes):**
   - No prometer resultados, sentencias favorables, plazos ni porcentajes de éxito.
   - No usar autoelogios ni comparaciones: evitar "expertos", "los mejores", "líderes",
     "especialistas en", "amplia trayectoria", "garantizamos", "ganamos".
   - No presentar situaciones hipotéticas como casos reales.
4. **Responsabilidad:** dejar claro que la información es general, que no reemplaza el análisis de un
   caso concreto y que la viabilidad depende de los hechos, documentos, fechas y normas aplicables.
5. **Exactitud normativa:** cada afirmación jurídica debe poder verificarse en fuentes oficiales
   (Secretaría del Senado, Gestor Normativo de Función Pública, SUIN-Juriscol, Rama Judicial,
   Superintendencia de Industria y Comercio, Ministerio del Trabajo, DIAN, Corte Constitucional).
   Registrar las fuentes consultadas en `fuentes`. Si un punto es dudoso o está en discusión
   (por ejemplo, una demanda de inconstitucionalidad pendiente), anotarlo en `notasRevision`.
6. **Sin derecho penal:** LEXPERTISE no presta servicios de derecho penal. No ofrecerlos ni sugerirlos.
7. **Cobertura:** no afirmar atención presencial en ciudades concretas. Se puede decir
   "en Colombia" de forma general.
8. **Llamados a la acción:** informativos ("Solicitar información", "Conocer el proceso de consulta").
   Nunca urgencia artificial ("¡Últimos cupos!", contadores) ni consultas gratuitas.
9. **Originalidad:** no copiar textos de otros sitios jurídicos.
10. **Revisión:** todo archivo nace con `revision.estado: pendiente`. Solo un abogado de la firma lo
    cambia a `aprobado` (con su nombre y fecha). En producción no se publican páginas pendientes.

## 2. Claves de áreas (`area`)

| Clave | Área de práctica |
|---|---|
| `familia` | Derecho de familia y sucesiones |
| `laboral` | Derecho laboral y seguridad social |
| `civil` | Derecho civil y contratos |
| `comercial` | Derecho comercial y empresarial |
| `tributario` | Derecho tributario |
| `administrativo` | Derecho administrativo |
| `propiedad-intelectual` | Propiedad intelectual y registro de marcas |

## 3. Páginas de servicio — `content/servicios/<slug>.md`

```yaml
---
slug: divorcio-unilateral            # igual al nombre del archivo
tipo: landing                        # area | servicio | landing
area: familia                        # clave de la tabla anterior
audiencia: [personas]                # personas, empresas o ambas
estado: activo                       # activo | por-confirmar | oculto
orden: 30                            # orden en listados (menor = primero)
titulo: "Divorcio unilateral"        # nombre corto para tarjetas y menús (máx. 40 caracteres)
h1: "Divorcio unilateral: conoce esta alternativa legal."
subtitulo: "Texto de apoyo del hero (máx. 220 caracteres)."
resumen: "Descripción breve para tarjetas (máx. 160 caracteres)."
seo:
  title: "Título SEO único (máx. 60 caracteres)"
  description: "Meta description única (entre 120 y 155 caracteres)."
pasos:                               # Procedimiento general (3 a 6 pasos). Opcional en tipo area.
  - titulo: "Nombre del paso"
    texto: "Descripción breve (máx. 260 caracteres)."
documentos:                          # Documentación que podría requerirse. Opcional.
  - "Registro civil de matrimonio"
faqs:                                # 4 a 7 preguntas
  - pregunta: "¿...?"
    respuesta: "Respuesta general, prudente, sin prometer resultados (máx. 700 caracteres)."
relacionados: [divorcio-mutuo-acuerdo, divorcio-con-hijos-y-bienes]   # slugs de servicios
whatsapp: divorcios                  # general | divorcios | familia | laboral | empresas | contratos
fuentes:
  - nombre: "Ley 2442 de 2024"
    url: "https://..."
notasRevision:                       # puntos que el abogado debe confirmar (pueden quedar vacíos)
  - "Confirmar ..."
revision:
  estado: pendiente                  # pendiente | aprobado
  abogado: ""
  fecha: ""
actualizado: "2026-11-13"
---
```

**Cuerpo (Markdown):** solo secciones `##` y `###`, párrafos, listas y negritas. No usar `#` (el H1 lo
pone la plantilla), ni HTML, ni imágenes. El cuerpo contiene la explicación del asunto y las
consideraciones relevantes. **No repetir** en el cuerpo los pasos, documentos o preguntas frecuentes:
la plantilla los muestra desde el frontmatter con su propio diseño.

Plantilla de una landing: Hero → cuerpo → Procedimiento general (`pasos`) → Documentación (`documentos`)
→ aviso legal → Preguntas frecuentes (`faqs`) → contacto y formulario.

## 4. Recursos (artículos) — `content/recursos/<slug>.md`

```yaml
---
titulo: "Divorcio de mutuo acuerdo en Colombia: aspectos generales"
slug: divorcio-de-mutuo-acuerdo-en-colombia
extracto: "Resumen de 1 a 2 frases (máx. 200 caracteres)."
categoria: familia                   # clave de área
autor: ""                            # nombre de abogado verificado; vacío hasta confirmarlo
fechaPublicacion: ""                 # AAAA-MM-DD, se llena al publicar
fechaRevisionJuridica: ""            # AAAA-MM-DD, la llena el abogado
imagen: ""                           # ruta en /public/uploads; vacío por ahora
video:                               # opcional: video del equipo (Instagram, YouTube o TikTok)
  plataforma: ""
  url: ""
preguntaPrincipal: ""                # opcional, para artículos derivados de un video
seo:
  title: "..."
  description: "..."
estado: borrador                     # borrador | revision | publicado
relacionados: [divorcio-mutuo-acuerdo]   # slugs de servicios
faqs: []                             # opcional, mismo formato que en servicios
fuentes: []
notasRevision: []
actualizado: "2026-11-13"
---
```

Cuerpo: introducción breve sin H1, secciones `##`, cierre con una recomendación prudente de revisar el
caso concreto. Extensión orientativa: 700 a 1.100 palabras.

## 5. Documentos legales — `content/legal/<slug>.md`

```yaml
---
titulo: "Política de tratamiento de datos personales"
slug: tratamiento-de-datos
version: "1.0-borrador"
vigenteDesde: ""
seo:
  title: "..."
  description: "..."
notasRevision: []
revision:
  estado: pendiente
  abogado: ""
  fecha: ""
---
```

En el cuerpo se pueden usar estas variables. El sitio las reemplaza con los datos oficiales
configurados o, mientras falten, con un marcador visible **[PENDIENTE]**:

`{{marca}}` `{{razonSocial}}` `{{nit}}` `{{direccion}}` `{{ciudad}}` `{{correo}}` `{{correoDatos}}`
`{{telefono}}` `{{sitioUrl}}` `{{fechaVigencia}}`

## 6. Configuración — `content/settings/*.json`

- `sitio.json`: marca, datos de la empresa, redes, consulta (precio/duración/modalidades solo si están
  confirmados), agendamiento y verificación.
- `whatsapp.json`: mensajes predefinidos por contexto.
- `inicio.json`: textos de la página de inicio y preguntas frecuentes institucionales.
- `content/legal/consentimientos.json`: textos de autorización con su versión.
- `content/equipo/*.json`: un archivo por profesional, solo con información verificada.
