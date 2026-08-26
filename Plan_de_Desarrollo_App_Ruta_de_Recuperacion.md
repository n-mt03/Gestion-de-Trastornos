# Plan Maestro de Desarrollo: Aplicación Android "Ruta de Recuperación"
## Sistema de Gestión, Seguimiento Clínico y Soporte Sistémico-Familiar para el Trastorno por Juego (Ludopatía)

---

**Fecha de Creación:** 25 de Agosto de 2026 (Actualizado con Centro de Ayuda y Fichas Descriptivas de Ejercicios)  
**Documento:** Plan de Especificación, Organización y Arquitectura del Sistema  
**Clasificación Clínica:** DSM-5-TR (F63.0) / CIE-11 (6C50)  
**Plataforma Objetivo:** Android (Arquitectura Móvil Offline-First con sincronización en la nube)  
**Integraciones Principales:** Google Sign-In (OAuth 2.0), Google Sheets API, Google Docs API, Google Calendar API y Google Drive API  

---

## 1. Introducción y Fundamentación Clínica

El **Trastorno por Juego de Apuestas** (anteriormente denominado juego patológico o ludopatía) está reconocido en las nosologías internacionales oficiales (**DSM-5-TR** y **CIE-11**) como una **adicción conductual no relacionada con sustancias**. Esta condición no obedece a un fallo moral ni a una simple mala administración monetaria, sino a una disfunción neurobiológica severa que altera los circuitos cerebrales de recompensa dopaminérgica, la valoración del riesgo y el control inhibitorio de impulsos.

### 1.1 Objetivos de la Aplicación
1. **Estabilización Inmediata y Protección:** Blindar al paciente del acceso descontrolado a dinero y plataformas de juego.
2. **Soporte Sistémico-Familiar Estructurado:** Transformar el entorno familiar en una red de coterapeutas funcionales mediante la asignación de roles definidos, evitando dinámicas de co-dependencia y rescates financieros encubiertos (*bailouts*).
3. **Gestión Financiera Rigurosa y Transparente:** Registrar detalladamente todas las deudas, acreedores, condiciones y **acuerdos formales de pago pactados con prestamistas o entidades**, monitoreando la amortización sin sobreendeudamiento.
4. **Intervención Cognitivo-Conductual y Ejercicios Terapéuticos con Fichas Descriptivas:** Proporcionar herramientas interactivas de autorregulación emocional (*Urge Surfing*, reestructuración cognitiva ABC, anclaje 5-4-3-2-1, EPR e higiene del sueño) acompañadas de descripciones clínicas claras sobre su objetivo, funcionamiento y momentos de aplicación.
5. **Psicoeducación y Centro de Ayuda Integral:** Capacitar al paciente y a su familia con un centro de ayuda interactivo que describe la aplicación módulo por módulo, facilitando el uso autónomo de la plataforma.
6. **Integración con Google Workspace:** Centralizar y respaldar de manera segura y transparente toda la información en las herramientas de Google del usuario (**Sheets, Docs, Calendar, Drive**).

---

## 2. Arquitectura General y Ecosistema Tecnológico

```
+-------------------------------------------------------------------------------+
|                       USUARIO (Paciente / Familiares)                         |
+-------------------------------------------------------------------------------+
                                        |
                         [Google Sign-In / OAuth 2.0]
                                        |
+-------------------------------------------------------------------------------+
|                 APLICACIÓN ANDROID: "RUTA DE RECUPERACIÓN"                     |
|  - UI Táctil Nativa / Modo Oscuro Terapéutico / PWA / Capacitor               |
|  - Motor de Base de Datos Local (IndexedDB / LocalStorage - 100% Offline)     |
|  - Centro de Ayuda Integrado y Fichas Descriptivas de Cada Módulo            |
+-------------------------------------------------------------------------------+
      |                   |                  |                  |
[Módulo Paciente]  [Módulo Familiar]  [Módulo Deudas]  [Módulo Ejercicios]
      |                   |                  |                  |
+-------------------------------------------------------------------------------+
|             MOTOR DE SINCRONIZACIÓN EN LA NUBE (Google APIs)                   |
+-------------------------------------------------------------------------------+
      |                   |                  |                  |
      v                   v                  v                  v
[Google Sheets]     [Google Docs]     [Google Calendar]   [Google Drive]
- Tablas Maestras   - Informes        - Citas Clínicas    - Respaldos
- Deudas y Pagos      Clínicos        - Reuniones 15min   - Comprobantes
- Check-ins Craving - Contratos       - Vencimientos        Auditoría
```

---

## 3. Integración con el Ecosistema Google Workspace

### 3.1 Autenticación Google (Google Sign-In & OAuth 2.0)
- Inicio de sesión seguro con la cuenta de Google del usuario.
- Gestión granular de alcances (*scopes*):
  - `https://www.googleapis.com/auth/spreadsheets` (Lectura y escritura en Google Sheets)
  - `https://www.googleapis.com/auth/documents` (Creación y actualización en Google Docs)
  - `https://www.googleapis.com/auth/calendar` (Gestión de eventos en Google Calendar)
  - `https://www.googleapis.com/auth/drive.file` (Gestión de carpeta y respaldos en Google Drive)
- Indicador visual de estado de sincronización en tiempo real (*Sincronizado*, *Sincronizando...*, *Modo Local*).

### 3.2 Google Sheets API: Base de Datos Centralizada
La aplicación genera y actualiza en tiempo real una hoja de cálculo denominada **`Ruta_de_Recuperacion_MasterDB`** con 6 pestañas estructuradas:
1. **`01_Paciente_Progreso`**: Registro general, fecha de inicio de abstinencia, días acumulados, dinero ahorrado estimado, estado de adherencia.
2. **`02_Diario_Craving_Checkins`**: Registro diario matutino y vespertino, escala analógica de deseo (0-10), horas de sueño, nivel de estrés y detonantes activos.
3. **`03_Inventario_Deudas`**: Nombre del acreedor, teléfono, tipología (Familiar, Banco, Prestamista informal, Empeño), monto prestado original, saldo adeudado a la fecha, tasa/interés, frecuencia de pago, fecha de vencimiento, prioridad y **Términos detallados del Acuerdo Pactado**.
4. **`04_Historial_Amortizaciones`**: Registro de pagos efectuados a cada acreedor, fecha, comprobante de pago y nuevo balance adeudado.
5. **`05_Roles_y_Tareas_Familiares`**: Asignación de familiares a los 5 roles, teléfono de contacto, lista de tareas asignadas, fechas límite y estado (*Pendiente / Completado / Verificado*).
6. **`06_Registros_ABC_Cognitivos`**: Antecedente / Situación gatillo (A), Pensamiento irracional o distorsión (B), Debate racional (C) y Conducta alternativa realizada.

### 3.3 Google Docs API, Calendar API y Drive API
- **Google Docs:** Generación automática de `Informe_Clinico_Evolucion_[Fecha].docx` y `Contrato_de_Contingencias_Familiar.docx`.
- **Google Calendar:** Sincronización de citas terapéuticas, reuniones familiares breves de 15 minutos y fechas límite de pagos de acuerdos de deuda.
- **Google Drive:** Carpeta `Google Drive / Ruta de Recuperación /` para copias de seguridad en JSON y comprobantes auditados.

---

## 4. Módulos Clínicos con Fichas Descriptivas

### MÓDULO 1: Registro del Paciente, Seguimiento y Métricas de Progreso
- Contador de días limpios en vivo (días, horas, minutos, segundos).
- Estimador de dinero preservado y horas de vida ganadas.
- **Craving Tracker** diario con escala visual analógica (0 a 10) y gráfica SVG de tendencias temporales.
- Sistema de insignias de hito (24 horas a 1 año).

---

### MÓDULO 2: Matriz Sistémico-Familiar de Roles y Asignación de Tareas
- **5 Roles Asignados:** *Coordinador Familiar*, *Responsable Financiero*, *Acompañante en Riesgo*, *Apoyo Emocional*, *Enlace Médico*.
- Tablero de tareas familiares con verificación y fechas límite.
- Guía interactiva de límites *Lo que la familia SÍ vs NUNCA debe hacer (Protocolo Anti-Bailout)*.

---

### MÓDULO 3: Registro y Gestión Estructurada de Deudas y Finanzas (Moneda: DOP / RD$)
- Inventario completo de acreedores, categorías, montos prestados y saldos actuales en Pesos Dominicanos.
- **Espacio Extenso y Destacado para el Acuerdo Pactado con el Prestamista:** Términos acordados, quitas, congelación de intereses y familiar financiero garante.
- Registro de amortizaciones con recálculo en vivo y gráfico de progreso.
- Presupuesto semanal supervisado en efectivo (RD$ 6,000 / semana).

---

### MÓDULO 4: Catálogo de Ejercicios Terapéuticos con Descripciones Breves

| Ejercicio Clínico | Descripción Breve & Mecanismo | Objetivo Terapéutico | Cuándo Aplicarlo |
| :--- | :--- | :--- | :--- |
| **1. Urge Surfing (Surfear la Ola)** | Técnica de Mindfulness basada en que el deseo opera como una ola que alcanza su pico en 3-7 minutos y se extingue sola si no se retroalimenta. Utiliza pacer respiratorio (4s inhalar / 6s exhalar) y escáner somático. | Desactivar la necesidad urgente de apostar tolerando el malestar temporal hasta que la curva de tensión descienda a niveles basales. | En momentos de deseo intenso (*craving*), tras cobros de sueldo o ante impulsos de fuga. |
| **2. Registro Cognitivo ABC** | Herramienta de la Terapia Cognitivo-Conductual (TCC) para atrapar y desarmar pensamientos automáticos distorsionados (*Falacia del Jugador, Ilusión de Control, Chasing*). | Identificar el gatillo (A), rebatir la creencia irracional con datos objetivos de probabilidad (B &rarr; C) y ejecutar una conducta saludable sustitutiva (D). | Ante pensamientos de "rescate financiero rápido", justificaciones para apostar o autoengaño. |
| **3. Anclaje Sensorial 5-4-3-2-1** | Técnica somatosensorial de modulación del sistema nervioso simpático nombrando 5 objetos vistos, 4 cosas tocadas, 3 sonidos, 2 olores y 1 sensación interna agradable. | Frenar la disociación psicológica, hiperactivación y rumiación obsesiva antes de que desemboquen en una recaída. | En estados de agitación aguda, taquicardia, ansiedad o inquietud psicomotriz. |
| **4. Exposición Gradual (EPR)** | Técnica conductual de desensibilización sistemática transitando rutas controladas cerca de salas de juego acompañado por el coterapeuta familiar sin apostar. | Extinguir la reactividad fisiológica condicionada ante estímulos ambientales del juego. | En Fase 2 y 3 del tratamiento clínico bajo supervisión del acompañante en riesgo. |
| **5. Higiene del Sueño & Desconexión** | Protocolo nocturno de desactivación de pantallas 90 minutos antes de dormir para restaurar la melatonina y reducir la impulsividad diurna del lóbulo prefrontal. | Proteger los ritmos circadianos y evitar sesiones de juego nocturno solitario (01:00-05:00 AM). | Todas las noches antes de las 10:30 PM. |

---

### MÓDULO 5: Psicoeducación Clínica e Información Especializada
- Bases neurobiológicas (dopamina, refuerzo intermitente, desmaterialización digital).
- Cuestionario de cribado y evaluación de los **9 Criterios Clínicos DSM-5-TR (F63.0)**.
- Ruta escalonada en las 4 fases clínicas (Protección &rarr; Intervención TCC &rarr; Rehabilitación &rarr; Mantenimiento).

---

### MÓDULO 6: Protocolo SOS de Emergencia y Vistas Multiusuario
- Botón de Pánico SOS en 1-clic con protocolo de 3 pasos: llamada/WhatsApp al acompañante de guardia, lanzador de Urge Surfing y líneas oficiales 24/7.
- Conmutador entre *Vista Paciente*, *Vista Familiar* y *Vista Especialista*.
- Exportación del informe clínico formal en formato imprimible / PDF.

---

### MÓDULO 7: Centro de Ayuda & Manual de Operación Módulo por Módulo
Un módulo dedicado y accesible de forma permanente desde la barra superior y de navegación que detalla:
1. **Propósito y Visión General de la App.**
2. **Cómo realizar los Check-ins diarios y leer la curva de craving.**
3. **Cómo asignar y coordinar los 5 roles familiares y sus compromisos.**
4. **Cómo inventariar acreedores, registrar acuerdos pactados y abonos.**
5. **Cómo ejecutar cada ejercicio terapéutico paso a paso.**
6. **Cómo interpretar la autoevaluación diagnóstica del DSM-5-TR.**
7. **Cómo activar el protocolo de emergencia SOS.**
8. **Cómo sincronizar con Google Workspace y operar en modo Offline-First.**

---

## 5. Estructura y Organización de Carpetas del Proyecto

```
Gestion de Trastornos/
│
├── Documentos fuentes/                                    # Manuales y guías clínicas originales
├── Plan_de_Desarrollo_App_Ruta_de_Recuperacion.md         # Plan Maestro en Markdown
├── Plan_de_Desarrollo_App_Ruta_de_Recuperacion.pdf        # Plan Maestro Oficial en PDF
│
├── index.html                                            # Shell principal con todos los módulos y Centro de Ayuda
├── manifest.json                                         # Manifiesto de Aplicación Web Android
├── sw.js                                                 # Service Worker para modo Offline-First
│
├── css/                                                  # Sistema de Diseño Clínico y Temas
│   ├── main.css                                          # Tokens de diseño, layout y variables
│   ├── components.css                                    # Modales, tarjetas, formularios y badges
│   ├── dashboard.css                                     # Contador de días, pacer y gráficas
│   └── mobile.css                                        # Optimización táctil y diseño Android
│
├── js/                                                   # Lógica y Controladores de la App
│   ├── app.js                                            # Enrutador SPA y gestor de vistas
│   ├── state.js                                          # Estado centralizado reactivo (IndexedDB)
│   │
│   ├── google/                                           # Conectores Google Workspace
│   │   ├── auth.js                                       # Google Sign-In & OAuth 2.0
│   │   ├── sheets.js                                     # Google Sheets API (6 pestañas)
│   │   ├── docs.js                                       # Google Docs API (informes clínicos)
│   │   ├── calendar.js                                   # Google Calendar API (agenda y pagos)
│   │   └── drive.js                                      # Google Drive API (respaldos)
│   │
│   ├── modules/                                          # Módulos Funcionales
│   │   ├── patient.js                                    # Paciente, días limpios y check-in
│   │   ├── family.js                                     # Roles familiares, tareas y reglas
│   │   ├── debts.js                                      # Libro de deudas, acuerdos y amortizaciones
│   │   ├── exercises.js                                  # Urge Surfing, ABC, 5-4-3-2-1, EPR
│   │   ├── psychoeducation.js                            # Base teórica, criterios DSM-5 y fases
│   │   └── sos.js                                        # Botón SOS y protocolo de crisis
│   │
│   └── utils/                                            # Utilidades
│       ├── sound.js                                      # Síntesis sonora Web Audio API (432Hz)
│       ├── charts.js                                     # Gráficas dinámicas SVG
│       └── export.js                                     # Exportador PDF e informes clínicos
│
└── assets/                                               # Recursos Multimedia
    ├── icons/                                            # Iconos de alta resolución Android
    └── audio/                                            # Recursos de audio
```

---

## 6. Conclusión

La aplicación **Ruta de Recuperación** está completamente construida, verificada y documentada, incorporando las descripciones breves de cada ejercicio y el Centro de Ayuda modular para brindar máxima autonomía y claridad a pacientes y familiares.
