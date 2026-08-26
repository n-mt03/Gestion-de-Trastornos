# -*- coding: utf-8 -*-
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#0284c7"))
        
        # Running Header (pages after page 1)
        if self._pageNumber > 1:
            self.drawString(40, 762, "RUTA DE RECUPERACIÓN")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(145, 762, "— Plan Maestro de Desarrollo, Fichas de Ejercicios y Centro de Ayuda")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(40, 755, 572, 755)
        
        # Running Footer
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        footer_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(572, 28, footer_text)
        self.drawString(40, 28, "Confidencial • Sistema Clínico-Familiar para Trastorno por Juego (DSM-5-TR / CIE-11)")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 38, 572, 38)
        
        self.restoreState()

def create_plan_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    C_NAVY = colors.HexColor("#0f172a")
    C_BLUE = colors.HexColor("#0284c7")
    C_LIGHT_BLUE = colors.HexColor("#f0f9ff")
    C_EMERALD = colors.HexColor("#059669")
    C_LIGHT_GREEN = colors.HexColor("#f0fdf4")
    C_LIGHT_RED = colors.HexColor("#fef2f2")
    C_TEXT = colors.HexColor("#1e293b")
    C_MUTED = colors.HexColor("#64748b")
    C_BORDER = colors.HexColor("#cbd5e1")
    C_BG_ROW = colors.HexColor("#f8fafc")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=18, leading=22,
        textColor=colors.white, spaceAfter=3
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9.5, leading=13,
        textColor=colors.HexColor("#94a3b8"), spaceAfter=8
    )
    
    badge_style = ParagraphStyle(
        'BadgeText', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=7.5, leading=9,
        textColor=colors.HexColor("#38bdf8")
    )
    
    meta_val_style = ParagraphStyle(
        'MetaVal', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=7.5, leading=10,
        textColor=colors.white
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=13.5,
        textColor=C_NAVY, spaceBefore=8, spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom', parent=styles['Normal'],
        fontName='Helvetica', fontSize=7.8, leading=10.5,
        textColor=C_TEXT, spaceAfter=4
    )

    card_text_style = ParagraphStyle(
        'CardText', parent=styles['Normal'],
        fontName='Helvetica', fontSize=7.4, leading=9.8,
        textColor=C_TEXT
    )

    card_title_style = ParagraphStyle(
        'CardTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=7.8, leading=10,
        textColor=C_NAVY, spaceAfter=2
    )

    th_style = ParagraphStyle(
        'TableHeader', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=7.5, leading=9,
        textColor=colors.white
    )

    td_style = ParagraphStyle(
        'TableCell', parent=styles['Normal'],
        fontName='Helvetica', fontSize=7.2, leading=9,
        textColor=C_TEXT
    )

    td_bold_style = ParagraphStyle(
        'TableCellBold', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=7.2, leading=9,
        textColor=C_NAVY
    )

    story = []

    # -------------------------------------------------------------
    # COVER HEADER
    # -------------------------------------------------------------
    cover_data = [
        [Paragraph("ESPECIFICACIÓN MAESTRA DE ARQUITECTURA &middot; PLATAFORMA ANDROID & GOOGLE WORKSPACE", badge_style)],
        [Paragraph("Ruta de Recuperación", title_style)],
        [Paragraph("Sistema Clínico-Psicopatológico, Saneamiento de Deudas, Ejercicios TCC y Centro de Ayuda Modular (Ludopatía)", subtitle_style)],
        [
            Table([
                [
                    Paragraph("CLASIFICACIÓN CLÍNICA<br/><b>DSM-5-TR F63.0 / CIE-11 6C50</b>", meta_val_style),
                    Paragraph("PLATAFORMA OBJETIVO<br/><b>Android (Offline-First)</b>", meta_val_style),
                    Paragraph("CLOUD INTEGRATION<br/><b>Google Workspace API Suite</b>", meta_val_style),
                    Paragraph("ESTADO<br/><b>Completado & Verificado</b>", meta_val_style)
                ]
            ], colWidths=[130, 130, 140, 120])
        ]
    ]

    cover_table = Table(cover_data, colWidths=[532])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_NAVY),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,2), (0,2), 0.5, colors.HexColor("#334155")),
    ]))
    story.append(cover_table)
    story.append(Spacer(1, 5))

    # -------------------------------------------------------------
    # 1. INTRODUCCIÓN Y FUNDAMENTACIÓN CLÍNICA
    # -------------------------------------------------------------
    story.append(Paragraph("1. Fundamentación Clínica y Objetivos", h1_style))
    story.append(Paragraph(
        "El <b>Trastorno por Juego de Apuestas</b> está clasificado en el DSM-5-TR (código F63.0) y en la CIE-11 (código 6C50) como una <b>adicción conductual no relacionada con sustancias</b>. No se trata de una 'falta de voluntad' ni de una simple mala administración del dinero, sino de una alteración psicobiológica que compromete los circuitos cerebrales de recompensa dopaminérgica, la valoración del riesgo y el control inhibitorio de impulsos.",
        body_style
    ))

    card1_data = [[
        Table([
            [Paragraph("Mecanismos Neurobiológicos Clave", card_title_style)],
            [Paragraph("&bull; <b>Sensibilización Dopaminérgica:</b> Desensibilización a reforzadores naturales y búsqueda compulsiva del estímulo.<br/>&bull; <b>Refuerzo Intermitente Variable:</b> Los 'casi aciertos' (near-misses) activan dopamina similar a una victoria real.<br/>&bull; <b>Chasing (Caza de pérdidas):</b> La creencia de que volver a jugar recuperará el dinero perdido, desatando una espiral de ruina.", card_text_style)]
        ], colWidths=[255]),
        Table([
            [Paragraph("Objetivos Terapéuticos de la App", card_title_style)],
            [Paragraph("&bull; <b>Protección y Contención Inmediata:</b> Bloqueo de accesos financieros y de plataformas de apuestas.<br/>&bull; <b>Red de Coterapeutas Familiares:</b> Asignación de 5 roles para evitar la co-dependencia y rescates encubiertos.<br/>&bull; <b>Saneamiento de Deudas:</b> Registro y seguimiento estricto de acuerdos pactados con prestamistas y bancos.<br/>&bull; <b>Regulación Emocional:</b> Urge Surfing, Registro ABC y Anclaje 5-4-3-2-1.", card_text_style)]
        ], colWidths=[255])
    ]]
    card_table = Table(card1_data, colWidths=[266, 266])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), C_LIGHT_BLUE),
        ('BACKGROUND', (1,0), (1,0), C_LIGHT_GREEN),
        ('BOX', (0,0), (0,0), 0.5, colors.HexColor("#bae6fd")),
        ('BOX', (1,0), (1,0), 0.5, colors.HexColor("#bbf7d0")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(card_table)
    story.append(Spacer(1, 5))

    # -------------------------------------------------------------
    # 2. INTEGRACIÓN GOOGLE WORKSPACE & ARQUITECTURA ANDROID
    # -------------------------------------------------------------
    story.append(Paragraph("2. Arquitectura de la Solución e Integración con Google Workspace", h1_style))
    
    g_table_data = [
        [Paragraph("Servicio Google", th_style), Paragraph("Propósito Funcional en la App", th_style), Paragraph("Estructura de Datos Sincronizados", th_style)],
        [
            Paragraph("<b>Google Sheets API</b>", td_bold_style),
            Paragraph("Base de datos centralizada, auditable y compartida entre paciente y coterapeutas.", td_style),
            Paragraph("Hoja maestra <code>Ruta_de_Recuperacion_MasterDB</code> con 6 pestañas:<br/>1. <i>Pacientes_Progreso</i> | 2. <i>Diario_Craving_Checkins</i><br/>3. <i>Inventario_Deudas</i> | 4. <i>Historial_Amortizaciones</i><br/>5. <i>Roles_y_Tareas_Familiares</i> | 6. <i>Registros_ABC_Cognitivos</i>", td_style)
        ],
        [
            Paragraph("<b>Google Docs API</b>", td_bold_style),
            Paragraph("Generación automatizada de reportes clínicos y contratos de contingencias.", td_style),
            Paragraph("Generación de documentos:<br/>&bull; <code>Informe_Clinico_Evolucion_[Fecha].docx</code> (para psicólogo/psiquiatra con métricas, craving y adherencia).<br/>&bull; <code>Contrato_de_Contingencias_Familiar.docx</code> (firmas digitales y compromisos).", td_style)
        ],
        [
            Paragraph("<b>Google Calendar API</b>", td_bold_style),
            Paragraph("Coordinación de la agenda clínica, reuniones familiares y alertas de riesgo.", td_style),
            Paragraph("&bull; Citas de psicoterapia y psiquiatría.<br/>&bull; Reuniones familiares breves semanales (15 min).<br/>&bull; Vencimientos de pagos pactados con prestamistas.<br/>&bull; Notificaciones preventivas en franjas horarias vulnerables.", td_style)
        ],
        [
            Paragraph("<b>Google Drive API</b>", td_bold_style),
            Paragraph("Almacenamiento seguro en la nube y respaldos periódicos.", td_style),
            Paragraph("Carpeta dedicada <code>Google Drive / Ruta de Recuperación /</code> para copias de seguridad de la base de datos (JSON) y comprobantes de pago auditados.", td_style)
        ]
    ]

    g_table = Table(g_table_data, colWidths=[105, 180, 247])
    g_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_ROW]),
    ]))
    story.append(g_table)
    story.append(Spacer(1, 5))

    # -------------------------------------------------------------
    # 3. MATRIZ SISTÉMICO-FAMILIAR DE ROLES Y TAREAS
    # -------------------------------------------------------------
    story.append(Paragraph("3. Matriz Sistémico-Familiar de Roles y Asignación de Compromisos", h1_style))
    
    roles_data = [
        [Paragraph("Rol Asignado", th_style), Paragraph("Responsabilidades Clínicas y Operativas", th_style), Paragraph("Herramientas en la App", th_style)],
        [
            Paragraph("<b>1. Coordinador Familiar</b>", td_bold_style),
            Paragraph("Interlocutor principal con el equipo tratante (psicólogo/psiquiatra); gestión de citas y convocatoria de reuniones familiares breves (15 min/semana).", td_style),
            Paragraph("Tablero de compromisos, calendario integrado con Google Calendar y exportación de informes clínicos.", td_style)
        ],
        [
            Paragraph("<b>2. Responsable Financiero</b>", td_bold_style),
            Paragraph("Custodia de tarjetas y claves; administración temporal de ingresos; asignación de presupuesto semanal en efectivo tasado; control del libro de deudas.", td_style),
            Paragraph("Módulo de presupuesto supervisado, balance de pasivos, escáner de comprobantes y validación obligatoria de gastos.", td_style)
        ],
        [
            Paragraph("<b>3. Acompañante en Riesgo</b>", td_bold_style),
            Paragraph("Acompañamiento presencial/digital en franjas vulnerables (cobro de nómina, fines de semana, 01:00-05:00 AM); fomento de ocio saludable.", td_style),
            Paragraph("Botón directo de enlace SOS, agenda de actividades compartidas y alertas preventivas.", td_style)
        ],
        [
            Paragraph("<b>4. Apoyo Emocional</b>", td_bold_style),
            Paragraph("Escucha activa sin juicios ni reproches retrospectivos; desescalada durante crisis agudas de deseo; validación de logros diarios.", td_style),
            Paragraph("Canal de refuerzo positivo, notas de aliento predefinidas y registro de conversaciones asertivas.", td_style)
        ],
        [
            Paragraph("<b>5. Enlace Médico/Psiquiátrico</b>", td_bold_style),
            Paragraph("Supervisión de toma rigurosa de psicofármacos (naltrexona, estabilizadores); monitoreo de higiene del sueño y efectos secundarios.", td_style),
            Paragraph("Pastillero virtual con recordatorios cruzados y registro de ritmos circadianos.", td_style)
        ]
    ]

    roles_table = Table(roles_data, colWidths=[115, 225, 192])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_ROW]),
    ]))
    story.append(roles_table)
    story.append(Spacer(1, 5))

    # -------------------------------------------------------------
    # 4. FICHAS DESCRIPTIVAS DE EJERCICIOS TERAPÉUTICOS
    # -------------------------------------------------------------
    story.append(Paragraph("4. Fichas Descriptivas del Catálogo de Ejercicios Terapéuticos", h1_style))
    
    ex_data = [
        [Paragraph("Ejercicio Clínico", th_style), Paragraph("Descripción Breve & Mecanismo", th_style), Paragraph("Objetivo Terapéutico", th_style), Paragraph("Cuándo Aplicarlo", th_style)],
        [
            Paragraph("<b>1. Urge Surfing (Surfear la Ola)</b>", td_bold_style),
            Paragraph("Mindfulness somático. El deseo opera como una ola que alcanza un pico en 3-7 minutos y se extingue fisiológicamente. Pacer 4s inhalar / 6s exhalar y escáner corporal.", td_style),
            Paragraph("Desactivar la urgencia de apostar tolerando el malestar temporal hasta que la tensión corporal disminuya a niveles basales.", td_style),
            Paragraph("Deseo agudo (*craving*), días de cobro o impulsos de fuga.", td_style)
        ],
        [
            Paragraph("<b>2. Registro Cognitivo ABC</b>", td_bold_style),
            Paragraph("Terapia Cognitivo-Conductual (TCC). Desarticula en tiempo real la <i>Falacia del Jugador</i>, <i>Ilusión de Control</i> y la <i>Caza de Pérdidas (Chasing)</i>.", td_style),
            Paragraph("Identificar el gatillo (A), rebatir la creencia irracional con datos objetivos de probabilidad (B &rarr; C) y ejecutar una conducta saludable (D).", td_style),
            Paragraph("Ante pensamientos de 'rescate rápido' o justificaciones para apostar.", td_style)
        ],
        [
            Paragraph("<b>3. Anclaje Sensorial 5-4-3-2-1</b>", td_bold_style),
            Paragraph("Técnica somatosensorial de modulación simpática nombrando 5 objetos vistos, 4 cosas tocadas, 3 sonidos, 2 olores y 1 sensación interna agradable.", td_style),
            Paragraph("Frenar la disociación psicológica, hiperactivación y rumiación obsesiva antes de que desemboquen en una recaída.", td_style),
            Paragraph("En estados de agitación aguda, taquicardia, ansiedad o inquietud.", td_style)
        ],
        [
            Paragraph("<b>4. Exposición Gradual (EPR)</b>", td_bold_style),
            Paragraph("Técnica conductual de desensibilización sistemática transitando rutas controladas cerca de salas de juego acompañado por el coterapeuta sin apostar.", td_style),
            Paragraph("Extinguir la reactividad fisiológica condicionada ante estímulos ambientales del juego.", td_style),
            Paragraph("Fase 2 y 3 bajo supervisión del acompañante en riesgo.", td_style)
        ],
        [
            Paragraph("<b>5. Higiene del Sueño & Desconexión</b>", td_bold_style),
            Paragraph("Protocolo nocturno de desactivación de pantallas 90 minutos antes de dormir para restaurar la melatonina y reducir la impulsividad diurna.", td_style),
            Paragraph("Proteger ritmos circadianos y evitar sesiones de juego nocturno solitario (01:00-05:00 AM).", td_style),
            Paragraph("Todas las noches antes de las 10:30 PM.", td_style)
        ]
    ]

    ex_table = Table(ex_data, colWidths=[105, 165, 155, 107])
    ex_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_ROW]),
    ]))
    story.append(ex_table)
    story.append(Spacer(1, 5))

    # -------------------------------------------------------------
    # 5. CENTRO DE AYUDA Y MANUAL MÓDULO POR MÓDULO
    # -------------------------------------------------------------
    story.append(Paragraph("5. Centro de Ayuda & Manual de Operación Módulo por Módulo", h1_style))
    
    help_data = [
        [Paragraph("Módulo de la App", th_style), Paragraph("Propósito y Contenido en el Centro de Ayuda", th_style), Paragraph("Instrucciones de Uso Clave", th_style)],
        [
            Paragraph("<b>Módulo 1: Tablero de Recuperación</b>", td_bold_style),
            Paragraph("Reloj de días limpios en vivo, estimador de ahorro y gráfico de craving (0-10).", td_style),
            Paragraph("Completar el check-in matutino y vespertino. Monitorear la curva para anticipar picos.", td_style)
        ],
        [
            Paragraph("<b>Módulo 2: Roles Familiares & Tareas</b>", td_bold_style),
            Paragraph("Matriz de los 5 roles familiares, asignación de tareas y regla anti-bailout.", td_style),
            Paragraph("Asignar nombres a los roles y marcar las tareas cumplidas en el tablero auditable.", td_style)
        ],
        [
            Paragraph("<b>Módulo 3: Registro de Deudas (DOP / RD$)</b>", td_bold_style),
            Paragraph("Inventario de acreedores en RD$, sección del acuerdo pactado y presupuesto semanal (RD$ 6,000).", td_style),
            Paragraph("Documentar términos del acuerdo con cada prestamista y registrar abonos en tiempo real.", td_style)
        ],
        [
            Paragraph("<b>Módulo 4: Ejercicios Terapéuticos</b>", td_bold_style),
            Paragraph("Fichas interactivas: Urge Surfing, Registro ABC, 5-4-3-2-1, EPR y sueño.", td_style),
            Paragraph("Iniciar el temporizador pacer con audio de 432Hz o rellenar el formulario ABC ante impulsos.", td_style)
        ],
        [
            Paragraph("<b>Módulo 5: Psicoeducación & DSM-5</b>", td_bold_style),
            Paragraph("Neurobiología dopaminérgica, 9 criterios diagnósticos y 4 fases clínicas.", td_style),
            Paragraph("Evaluar los criterios marcados para conocer el grado de severidad y fase de recuperación.", td_style)
        ],
        [
            Paragraph("<b>Módulo 6: Protocolo SOS de Emergencia</b>", td_bold_style),
            Paragraph("Botón de pánico en 1-clic con protocolo tripartito de contención rápida.", td_style),
            Paragraph("Pulsar SOS en barra superior para llamar al acompañante de guardia o líneas 24/7.", td_style)
        ],
        [
            Paragraph("<b>Módulo 7: Google Workspace & Offline</b>", td_bold_style),
            Paragraph("Sincronización en la nube con Sheets, Docs, Calendar y Drive.", td_style),
            Paragraph("Autenticarse con Google OAuth 2.0. Los datos se guardan offline y se sincronizan al conectar.", td_style)
        ]
    ]

    help_table = Table(help_data, colWidths=[120, 205, 207])
    help_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_ROW]),
    ]))
    story.append(help_table)
    story.append(Spacer(1, 5))

    # -------------------------------------------------------------
    # 6. ESTRUCTURA Y ORGANIZACIÓN DE CARPETAS
    # -------------------------------------------------------------
    story.append(Paragraph("6. Estructura y Organización de Carpetas del Proyecto", h1_style))
    
    folders_data = [
        [Paragraph("Directorio / Archivo", th_style), Paragraph("Propósito y Contenido", th_style), Paragraph("Componentes / Archivos Clave", th_style)],
        [Paragraph("<b><code>css/</code></b>", td_bold_style), Paragraph("Sistema de diseño clínico, tokens de interfaz y modo oscuro.", td_style), Paragraph("<code>main.css</code>, <code>components.css</code>, <code>dashboard.css</code>, <code>mobile.css</code>", td_style)],
        [Paragraph("<b><code>js/google/</code></b>", td_bold_style), Paragraph("Autenticación y conectores REST con Google Workspace.", td_style), Paragraph("<code>auth.js</code>, <code>sheets.js</code>, <code>docs.js</code>, <code>calendar.js</code>, <code>drive.js</code>", td_style)],
        [Paragraph("<b><code>js/modules/</code></b>", td_bold_style), Paragraph("Lógica de negocio clínica, familiar, deudas, ejercicios y SOS.", td_style), Paragraph("<code>patient.js</code>, <code>family.js</code>, <code>debts.js</code>, <code>exercises.js</code>, <code>psychoeducation.js</code>, <code>sos.js</code>", td_style)],
        [Paragraph("<b><code>js/utils/</code></b>", td_bold_style), Paragraph("Herramientas auxiliares, audio Web Audio API, gráficas SVG y exportador.", td_style), Paragraph("<code>sound.js</code>, <code>charts.js</code>, <code>export.js</code>", td_style)],
        [Paragraph("<b><code>Raíz</code></b>", td_bold_style), Paragraph("Shell SPA Android con Centro de Ayuda, manifiesto PWA y Service Worker.", td_style), Paragraph("<code>index.html</code>, <code>manifest.json</code>, <code>sw.js</code>, <code>js/app.js</code>, <code>js/state.js</code>", td_style)]
    ]

    folders_table = Table(folders_data, colWidths=[110, 220, 202])
    folders_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_ROW]),
    ]))
    story.append(folders_table)

    # Build Document with Running Headers and Footers
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully updated with help center & exercise descriptions at: {output_path}")

if __name__ == '__main__':
    target = os.path.abspath("Plan_de_Desarrollo_App_Ruta_de_Recuperacion.pdf")
    create_plan_pdf(target)
