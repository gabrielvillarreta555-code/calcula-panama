# CP-SEO-001 — Investigación de crecimiento orgánico

- **Fecha:** 27 de noviembre de 2026
- **Base:** `main` @ `92c0987` (27 URLs en el sitemap)
- **Estado:** informe para aprobación. **No se ha modificado código, diseño ni contenido publicado.**

## 0. Cómo leer este informe

| Marca | Significado |
|---|---|
| **[C] Comprobado** | Verificado directamente en el código, el DNS, el sitio en producción o una fuente citada. |
| **[E] Estimado** | Juicio basado en señales indirectas: cobertura de prensa, competidores que posicionan el tema, estacionalidad. **No son volúmenes de búsqueda medidos.** |

**Limitación principal [C]:** no tengo acceso a Search Console, Google Ads Keyword Planner ni Google Trends con datos de Panamá. Por eso no hay en este informe ninguna cifra de búsquedas mensuales, clics o posiciones. Todo el «potencial de tráfico» es **relativo (Alto / Medio / Bajo) y estimado**.

---

## 1. Estado de la analítica y de Search Console

| Punto | Hallazgo | Tipo |
|---|---|---|
| Analítica web | **No hay ninguna instalada.** Se buscaron gtag, GTM, Plausible, Umami, Matomo, Clarity y Cloudflare Web Analytics: no aparece ninguno. | [C] |
| Bloqueo por CSP | La política `connect-src 'none'` impediría cualquier baliza aunque se añadiera un script. Es una decisión de privacidad deliberada, documentada en `auditoria-seo-noviembre-2026.md`. | [C] |
| Search Console | El DNS tiene **dos** registros TXT `google-site-verification`. Lo más probable es que exista una propiedad de dominio verificada, quizá con dos cuentas. No hay archivo HTML de verificación publicado. | [C] el registro / [E] que esté activa |
| Datos de Search Console | **No accesibles** desde este entorno. Hacen falta acceso del CEO o una exportación. | [C] |
| Bing Webmaster Tools | No se encontró verificación (`msvalidate.01`). | [C] |
| `robots.txt`, sitemap, `ads.txt` | `robots.txt` permite todo y declara el sitemap. El sitemap tiene 27 URLs. `ads.txt` responde 200. | [C] |
| Hosting | GitHub Pages: registros A 185.199.108–111.153 y `server: GitHub.com`. | [C] |
| Línea de base de tráfico | **No existe.** Las metas de noviembre (3.000 impresiones y 60 clics) siguen siendo objetivos, no mediciones. | [C] |

### Recomendaciones, en orden

1. **Search Console primero, sin tocar código.**
   - Confirmar qué cuenta es propietaria y limpiar el registro TXT sobrante.
   - Enviar `sitemap-index.xml`.
   - Exportar 16 meses de consultas y páginas filtradas por Panamá.
   - Con esa exportación se reordena la priorización de este informe usando datos reales.
2. **Bing Webmaster Tools:** importar desde Search Console. Coste cero; también alimenta a ChatGPT Search y Copilot.
3. **Analítica propia: decisión del CEO, no la recomiendo todavía.** Si se quiere medir comportamiento, la opción coherente con la política de privacidad es una analítica sin cookies, como Plausible o Umami autoalojado, o Cloudflare Web Analytics. Cualquiera exige:
   - abrir `connect-src` a un único dominio;
   - actualizar `/privacidad/`;
   - no registrar jamás los valores escritos en las calculadoras.

   Para las decisiones de SEO, Search Console basta.

---

## 2. Análisis de las 27 URLs actuales

| Grupo | URLs | Intención de búsqueda | Valoración [E] |
|---|---|---|---|
| **Laboral** | Salario neto, décimo, vacaciones, liquidación y horas extras | Transaccional y de alta recurrencia, con picos estacionales (décimo: abril, agosto, diciembre; liquidación: todo el año) | **Núcleo del tráfico potencial.** Títulos bien orientados a la consulta («Calculadora de… en Panamá»). La competencia directa es fuerte (§3). |
| **Guías** | 3 artículos e índice | Informativa: «cómo se calcula», «cuándo pagan» | **Muy pocas.** Los competidores tienen decenas de guías laborales. Cada calculadora debería tener al menos una guía que la alimente. |
| **Finanzas** | Mi Quincena, préstamos y meta de ahorro | Mixta | Préstamos compite con bancos y comparadores. Mi Quincena es diferencial pero tiene poca demanda de búsqueda explícita. |
| **Compras** | Categoría, Modo Pasillo, precio por unidad y descuentos | Genérica, no panameña | Consultas poco ligadas a Panamá. Útiles para retención, no para captación. |
| **Vehículos** | Financiamiento, combustible y costo mensual | Mixta | «Combustible» tiene un gancho local fuerte: los precios oficiales se actualizan cada 14 días (§4). |
| **Otros** | Promedio de notas y consumo eléctrico | Genérica / local | Consumo eléctrico puede conectarse a la tarifa de la ASEP y al umbral del subsidio de 300 kWh. |
| **Navegación e institucional** | Portada, herramientas, sobre nosotros, contacto, privacidad y términos | — | No buscan tráfico. Correctas para E-E-A-T. |

### Conclusiones [E]

- **El sitio es fuerte en herramientas y débil en contenido.** Hay 3 guías frente a 16 herramientas. En las búsquedas laborales de Panamá, la primera página está dominada por artículos explicativos de prensa y blogs, más que por calculadoras.
- **Falta cobertura temática** en impuestos (ITBMS, renta anual), salario mínimo, empleo doméstico, maternidad, vivienda y calendario laboral (feriados). Son búsquedas recurrentes que ya tienen tráfico demostrado por la prensa.
- **Ventaja diferencial [C]:**
  - cálculos locales, sin registro;
  - fuentes oficiales citadas;
  - fecha de revisión de parámetros;
  - carga rápida (LCP < 1 s en las pruebas de CP-DESIGN-008).

  Los competidores no destacan estos puntos.

---

## 3. Competidores y posicionamiento

| Competidor | Qué cubre | Fortaleza | Hueco que podemos ocupar [E] |
|---|---|---|---|
| [finiquitojusto.com](https://finiquitojusto.com/) | Calculadoras de liquidación, décimo y vacaciones para Panamá, con muchas guías, incluida maternidad | Especializado, mucho contenido | Diseño y velocidad. No cubre impuestos, compras ni finanzas personales. |
| [toptrabajos.com/pa/blog](https://www.toptrabajos.com/pa/blog/licencia-maternidad-panama/) | Guías de décimo, finiquito, deducciones, vacaciones, horas extras, prima y maternidad | Autoridad de dominio (portal de empleo) | Sin calculadoras propias integradas. |
| Prensa: [La Prensa](https://www.prensa.com/economia/salario-minimo-2026-en-panama-estas-son-las-nuevas-tarifas-por-actividad-y-region/), La Estrella, Panamá América, TVN y Telemetro | «Cómo se calcula», fechas de pago, salario mínimo, combustible y tarifa eléctrica | Autoridad y actualidad | Notas efímeras, sin herramienta. Su contenido caduca y nosotros podemos ser la referencia permanente. |
| [Blog de Alegra](https://blog.alegra.com/panama/declaracion-de-renta-panama/) | ITBMS, declaración de renta y salario mínimo | Contenido fiscal para pymes | Orientado a empresas, no a asalariados. |
| ivacalculator.com/panama y otros genéricos | ITBMS | Herramienta simple | Contenido pobre y nada local. Fácil de superar. |
| [WageIndicator](https://wageindicator.org/es-pa/ai/trabajo-en-panama/salario-minimo/3707-comercio-al-por-menor-por-mayor-y-en-comisiones/) y Jibble | Salario mínimo por actividad | Tablas extensas | Tarifas por hora sin convertir a mensual; podemos hacerlo. |
| CSS «Mi Retiro Seguro» | Simulador oficial de pensión | Oficial: más de 203.000 consultas según La Estrella | No competir: explicar y enlazar. |

**Posicionamiento propuesto [E]:** «La referencia práctica del dinero del trabajador panameño: calcula, entiende y comprueba con la fuente oficial». Se trata de unir herramienta y guía en cada tema, que es lo que ningún competidor hace a la vez.

---

## 4. Necesidades cotidianas no cubiertas (hallazgos de la investigación)

| Necesidad | Dato de la investigación | Tipo |
|---|---|---|
| **Salario mínimo 2026-2027** | Decreto Ejecutivo 13 de 2025, vigente desde el 16 de enero de 2026. Tarifas **por hora** y por región: Región 1 (Panamá, Colón, San Miguelito, David, Santiago, La Chorrera, Arraiján…) y Región 2. Ejemplos: comercio al por mayor B/.3.02 / B/.2.48; construcción B/.3.51 / B/.3.30. Bloomberg Línea advierte que no se publicó la tabla de las 74 actividades. Fuentes: [La Prensa](https://www.prensa.com/economia/salario-minimo-2026-en-panama-estas-son-las-nuevas-tarifas-por-actividad-y-region/), [Bloomberg Línea](https://www.bloomberglinea.com/latinoamerica/panama/llegan-a-acuerdo-sobre-el-salario-minimo-2026-en-panama-asi-quedaron-algunas-tasas/) | [C] en prensa; **debe verificarse en la Gaceta Oficial** |
| **Declaración de renta, persona natural** | Plazo habitual: 15 de marzo, con prórrogas anuales. Obligados: ingresos superiores a B/.11.000. Devolución con plazo de 3 años. Fuentes: [DGI](https://dgi.mef.gob.pa/DInforme/D-IsRenta), [Alegra](https://blog.alegra.com/panama/declaracion-de-renta-panama/) | [C] en fuentes; fecha de 2027 sin confirmar |
| **ITBMS** | Tasas del 7 % general, 10 % y 15 %; ya existen calculadoras genéricas | [C] |
| **Combustible** | Desde octubre de 2025 los precios se actualizan cada **14 días**. Ejemplo: gasolina de 95 octanos a 90,6 centavos por litro del 20 de febrero al 6 de marzo de 2026. Fuentes: [Panamá América](https://www.panamaamerica.com.pa/economia/precio-de-la-gasolina-y-el-diesel-baja-un-centavo-por-15-dias-1154078), [La Prensa](https://www.prensa.com/economia/panama-vuelve-a-sentir-el-impacto-del-mercado-internacional-en-los-combustibles-con-alza-en-los-precios/) | [C] la frecuencia; precio vigente sin verificar |
| **Tarifa eléctrica** | Los hogares de hasta 300 kWh mensuales siguen protegidos del ajuste. Precio promedio en enero de 2026: 20,82 centavos por kWh. Pliego nuevo del 1 de septiembre al 31 de diciembre de 2026. Con el calor, muchos clientes superaron el umbral y perdieron el subsidio. Fuentes: [La Prensa](https://www.prensa.com/economia/tarifas-electricas-se-ajustan-a-partir-del-1-de-enero-de-2026-la-mayoria-de-los-usuarios-no-tendra-aumentos-en-su-factura/), [La Estrella](https://www.laestrella.com.pa/economia/ajuste-electrico-de-ensa-afectara-a-mas-de-150-mil-clientes-en-2026-DN18734227), [Telemetro](https://www.telemetro.com/nacionales/asep-aclara-que-aumento-facturas-luz-se-debe-al-mayor-consumo-electrico-n6082387) | [C] en prensa; pliego por distribuidora sin verificar |
| **Licencia de maternidad** | 14 semanas (6 antes del parto y 8 después). Requisito: 9 cuotas en los últimos 12 meses. **Las fuentes se contradicen** sobre la base de cálculo y sobre si el empleador paga la diferencia. Hay reformas de la CSS en 2025. Fuentes: [toptrabajos](https://www.toptrabajos.com/pa/blog/licencia-maternidad-panama/), [La Prensa](https://www.prensa.com/economia/reformas-a-la-css-cambios-en-coberturas-para-dependientes-subsidio-para-madres-adoptivas-y-razones-para-perder-pension/) | Contradictorio: **exige revisión jurídica** |
| **Hipoteca con interés preferencial** | Régimen cambiante: Ley 468 de 2025 suspendida, Ley 3 de 1985 restablecida hasta el 31 de diciembre de 2025 y ley nueva desde enero de 2026. No se encontró ninguna calculadora | [C] la volatilidad; norma vigente sin verificar |
| **Trabajo doméstico** | Salario mínimo de B/.350 (Región 1) y B/.320 (Región 2) | [C] en prensa; verificar en el decreto |
| **Jubilación CSS** | Simulador oficial en Mi Caja Digital, con reforma reciente | [C] |
| **Feriados y días hábiles** | Búsqueda anual previsible, con pico en diciembre y enero. La prensa publica la lista cada año | [E] |

Las búsquedas de Google Year in Search 2025 **no publicaron una lista para Panamá** en las fuentes encontradas [C]. Solo hay listas de México, Colombia y Perú ([blog de Google](https://blog.google/products/search/year-in-search-2025/)).

---

## 5. Diez herramientas nuevas propuestas

**Criterios:**
- **Tráfico:** potencial estimado [E].
- **Utilidad:** para el usuario panameño.
- **Dificultad:** incluye la verificación de datos y el riesgo legal, no solo el código.
- **Orden:** combina las tres. Arriba va lo que más rinde con menos riesgo.

| # | Herramienta | Ruta propuesta | Tráfico [E] | Utilidad | Dificultad | Por qué | Riesgo y datos que hay que verificar |
|---|---|---|---|---|---|---|---|
| 1 | **Calculadora de ITBMS** (agregar o quitar 7 %, 10 % o 15 %; precio con y sin impuesto) | `/impuestos/itbms/` | Alto | Alta | **Baja** | Consulta permanente de consumidores y pequeños comercios. Los competidores son genéricos | Bajo. Tasas en la Ley 8 de 2010, ya citada por el sitio |
| 2 | **Impuesto sobre la renta anual y devolución estimada** (asalariado) | `/impuestos/declaracion-de-renta/` | Alto (pico de enero a marzo) | Alta | Media | Reutiliza el motor de ISR de Salario neto. Lanzarla en enero de 2027 aprovecha la temporada | Medio. Deducciones admitidas y fecha de 2027 según la DGI. Advertir que no sustituye la declaración |
| 3 | **Salario mínimo por actividad y región**, con conversión de hora a mes y quincena | `/calculadoras/salario-minimo/` | Alto | Alta | Media | Las tablas existentes no convierten a mensual. Responde «¿cuánto es el salario mínimo?» | **Alto en datos.** Hay que transcribir el DE 13 de 2025 desde la Gaceta Oficial. La protección anti-bots de gacetaoficial.gob.pa **no se evadirá**: hará falta descarga manual o copia oficial |
| 4 | **Días hábiles y feriados 2027** (contador de días entre fechas, puentes) | `/vida-cotidiana/dias-feriados/` | Alto (estacional) | Media | **Baja** | Búsqueda anual previsible. También sirve para plazos de vacaciones y preaviso | Bajo. Lista oficial (Código de Trabajo y leyes de feriados), revisable cada año |
| 5 | **Interés de tarjeta de crédito y pago mínimo** (cuánto tardo y cuánto pago de intereses) | `/finanzas/tarjeta-de-credito/` | Medio | Alta | Baja | Reutiliza el motor de amortización de Préstamos. Gran valor educativo | Bajo. Fórmula general, sin datos legales |
| 6 | **Costo total de un empleado para el empleador** (CSS patronal, Seguro Educativo, riesgos profesionales, décimo y vacaciones) | `/calculadoras/costo-de-empleado/` | Medio | Alta | Media | Pymes y emprendedores. Abre una audiencia nueva | Medio. Tasas patronales tras la reforma de la CSS de 2025, por verificar en el texto único de la Ley 51 |
| 7 | **Pago de la trabajadora doméstica** (salario, décimo, vacaciones y CSS) | `/calculadoras/trabajo-domestico/` | Medio | Alta | Media | Reutiliza los motores existentes. Tema con poca oferta y mucha duda | Medio. Régimen especial del Código de Trabajo y salario mínimo propio |
| 8 | **Hipoteca con interés preferencial** (cuota con y sin tramo preferencial) | `/finanzas/hipoteca/` | Medio-alto | Alta | **Alta** | No se encontró ninguna calculadora. Decisión financiera de mucho valor | **Alto.** La ley cambió varias veces entre 2025 y 2026. Exige revisión jurídica y fecha de revisión visible |
| 9 | **Estimador de la factura de luz** (kWh → B/., aviso del umbral de 300 kWh) | Ampliar `/vida-cotidiana/consumo-electrico/` | Medio (pico con el calor) | Media | Alta | Aprovecha una URL existente. Picos de interés documentados | Alto en datos. El pliego tarifario de la ASEP cambia cada semestre y por distribuidora (ENSA, EDEMET, EDECHI) |
| 10 | **Licencia de maternidad: fechas y monto estimado** | `/calculadoras/licencia-de-maternidad/` | Medio | Alta | **Alta** | Necesidad clara y finiquitojusto ya la explota | **Alto.** Las fuentes se contradicen sobre la base de cálculo. No publicar sin confirmación de la CSS o revisión jurídica |

**Descartadas para herramienta [E]:**
- **Pensión CSS:** ya existe el simulador oficial, y una cifra nuestra podría inducir a error. Se cubre con un artículo (§6).
- **Precio vigente del combustible:** exige actualizar cada 14 días a mano, porque la CSP impide consultas externas. Mejor como dato con fecha dentro de *Combustible por viaje*, si se acepta el mantenimiento.

---

## 6. Diez artículos propuestos

Cada artículo enlaza a una herramienta existente o propuesta. Ese es el modelo de «calcula y entiende».

| # | Artículo | Herramienta enlazada | Tráfico [E] | Utilidad | Dificultad | Cuándo publicar |
|---|---|---|---|---|---|---|
| 1 | **Días feriados de Panamá 2027: calendario, puentes y pago si trabajas ese día** | Feriados (#4), Horas extras | Alto | Alta | Baja | **Primera semana de diciembre de 2026** |
| 2 | **Declaración de renta 2027 para asalariados: quién debe declarar, plazos, deducciones y devolución** | Renta anual (#2), Salario neto | Alto | Alta | Media | Enero de 2027 |
| 3 | **Salario mínimo 2026-2027 en Panamá: tabla por región y cómo pasarlo a sueldo mensual** | Salario mínimo (#3) | Alto | Alta | Media (datos) | En cuanto se verifique el decreto |
| 4 | **Horas extras en Panamá: recargos del 25 %, 50 % y 75 %, jornada nocturna y límites** | Horas extras (publicada) | Medio-alto | Alta | **Baja** | **Inmediato:** respalda la herramienta recién lanzada |
| 5 | **ITBMS en Panamá: tasas del 7 %, 10 % y 15 %, qué está exento y cómo calcularlo** | ITBMS (#1) | Alto | Media | Baja | Junto con la herramienta |
| 6 | **Renuncia en Panamá: preaviso, qué te pagan y cómo calcular tu liquidación** | Liquidación, Vacaciones, Décimo | Alto | Alta | Media | Enero de 2027 (rotación de inicio de año) |
| 7 | **Trabajo doméstico en Panamá: salario mínimo, décimo, vacaciones y CSS** | Trabajo doméstico (#7) | Medio | Alta | Media | Con la herramienta |
| 8 | **Jubilación en la CSS tras la reforma de 2025: edad, cuotas y cómo usar Mi Retiro Seguro** | Enlace al simulador oficial | Alto | Alta | Media-alta (legal) | Tras la revisión jurídica |
| 9 | **Licencia de maternidad en Panamá: duración, requisitos y cuánto paga la CSS** | Maternidad (#10) | Medio | Alta | Alta (legal) | Tras la confirmación oficial |
| 10 | **Interés preferencial hipotecario 2026: qué cambió y cuánto afecta a tu cuota** | Hipoteca (#8), Préstamos | Medio | Alta | Alta (legal) | Tras la revisión jurídica |

---

## 7. Hoja de ruta propuesta (para aprobar)

| Fase | Contenido | Por qué en ese orden |
|---|---|---|
| **0 · Medición** (ya) | Acceso y exportación de Search Console, limpieza del TXT duplicado, Bing Webmaster Tools. Sin código | Sustituye estimaciones por datos. Podría reordenar todo lo siguiente |
| **1 · Diciembre de 2026** | Artículo 4 (horas extras), artículo 1 y herramienta 4 (feriados 2027), herramienta 1 y artículo 5 (ITBMS) | Bajo riesgo legal y baja dificultad. Aprovecha la temporada de diciembre |
| **2 · Enero-febrero de 2027** | Herramienta 2 y artículo 2 (renta), artículo 6 (renuncia), herramienta 5 (tarjeta) | Temporada fiscal y de rotación laboral |
| **3 · Con datos verificados** | Herramienta 3 y artículo 3 (salario mínimo), herramientas 6 y 7, artículo 7 | Dependen de transcribir y verificar el decreto y las tasas patronales |
| **4 · Con revisión jurídica** | Herramientas 8, 9 y 10; artículos 8, 9 y 10 | Alto riesgo de dar una cifra errónea. Sin revisión no se publican |

**Reglas que se mantienen en todas las fases:**
- un PR por entrega y publicación solo con tu autorización;
- motores existentes sin cambios salvo aprobación expresa;
- publicidad desactivada;
- CSP estricta y cálculo local;
- fuentes oficiales y fecha de revisión en cada página;
- sin páginas duplicadas ni promesas de posición.

**Métricas de éxito [E, a fijar con la línea de base]:**
- impresiones y clics de Search Console por grupo temático;
- CTR de los títulos nuevos;
- número de consultas con posición inferior a 10.

Sin línea de base no propongo cifras objetivo.

---

## 8. Decisiones que necesito

1. **¿Apruebas la hoja de ruta** y el orden de las fases 1 a 4?
2. **Search Console:** ¿puedes darme una exportación (consultas y páginas, Panamá, 16 meses) o un acceso de solo lectura? ¿Cuál de los dos registros TXT corresponde a la cuenta de Blue Lab Studios?
3. **Analítica propia:** ¿se mantiene la política de no tener analítica (solo Search Console), o se evalúa una opción sin cookies?
4. **Nuevas secciones:** ¿se aprueba crear la categoría `/impuestos/`?
5. **Revisión jurídica externa** para la fase 4 (hipoteca, maternidad y jubilación): ¿se contrata o se aplaza esa fase?
