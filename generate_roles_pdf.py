# -*- coding: utf-8 -*-
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.pdfgen import canvas

def create_roles_pdf(output_path):
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
    C_TEXT = colors.HexColor("#1e293b")
    C_BORDER = colors.HexColor("#cbd5e1")
    C_BG_ROW = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=16, leading=20,
        textColor=C_NAVY, spaceAfter=15, alignment=1
    )
    
    h1_style = ParagraphStyle(
        'Heading1', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=12, leading=14,
        textColor=C_BLUE, spaceBefore=10, spaceAfter=5
    )

    body_style = ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10, leading=13,
        textColor=C_TEXT, spaceAfter=5
    )

    th_style = ParagraphStyle(
        'TableHeader', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9, leading=11,
        textColor=colors.white
    )

    td_style = ParagraphStyle(
        'TableCell', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9, leading=12,
        textColor=C_TEXT
    )

    td_bold_style = ParagraphStyle(
        'TableCellBold', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9, leading=12,
        textColor=C_NAVY
    )

    story = []

    # Title
    story.append(Paragraph("Asignación de Roles Familiares - Ruta de Recuperación", title_style))
    story.append(Spacer(1, 10))

    # Intro
    story.append(Paragraph("Este documento detalla los roles asignados a los miembros de la familia, las recomendaciones para cumplir dichos roles de manera efectiva y ejemplos prácticos de tareas que ayudarán en el proceso de recuperación del paciente.", body_style))
    story.append(Spacer(1, 10))

    # Matriz de Roles
    story.append(Paragraph("Matriz de Roles y Tareas", h1_style))
    
    roles_data = [
        [Paragraph("Familiar & Rol", th_style), Paragraph("Responsabilidades y Recomendaciones", th_style), Paragraph("Ejemplos de Tareas", th_style)],
        
        # Norberto Mata
        [
            Paragraph("<b>Norberto Mata</b><br/>Hijo<br/><br/><b>Coordinador Familiar</b>", td_bold_style),
            Paragraph("<b>Responsabilidad:</b> Gestión de citas, coordinación de reuniones familiares y comunicación principal.<br/><b>Recomendación:</b> Mantener un calendario compartido (ej. Google Calendar) para todas las citas. Establecer un día y hora fijos para reuniones familiares de 15 minutos enfocadas en revisión de compromisos sin reproches.", td_style),
            Paragraph("&bull; Programar las citas psicológicas y psiquiátricas.<br/>&bull; Enviar recordatorios de las reuniones por WhatsApp al grupo familiar.<br/>&bull; Moderar la reunión semanal familiar para evitar conflictos.", td_style)
        ],
        
        # Alberto Mata
        [
            Paragraph("<b>Alberto Mata</b><br/>Hijo<br/><br/><b>Responsable Financiero</b>", td_bold_style),
            Paragraph("<b>Responsabilidad:</b> Manejo temporal de deudas, recolección de fondos económicos familiares y control estricto de dinero.<br/><b>Recomendación:</b> Buen control emocional para no ceder a manipulaciones. Llevar un registro escrito de deudas y aportes. No entregar efectivo sobrante ni 'rescates' de emergencia.", td_style),
            Paragraph("&bull; Consolidar el listado de deudas con los prestamistas.<br/>&bull; Recolectar las cuotas aportadas por cada familiar.<br/>&bull; Realizar pagos directamente a las deudas sin pasar el dinero por las manos del paciente.<br/>&bull; Asignar el presupuesto semanal estrictamente calculado.", td_style)
        ],
        
        # Ana Massiel
        [
            Paragraph("<b>Ana Massiel</b><br/>Hija<br/><br/><b>Enlace Médico / Psiquiátrico</b>", td_bold_style),
            Paragraph("<b>Responsabilidad:</b> Seguimiento de la medicación y control del estado de salud del paciente, convive con el paciente y su hija Gabriela.<br/><b>Recomendación:</b> Usar un pastillero organizado semanalmente. Administrar la medicación en mano (no dejar frascos a disposición libre). Aislar a la niña Gabriela de situaciones estresantes o conflictos en la casa.", td_style),
            Paragraph("&bull; Dar la medicación a las horas indicadas y supervisar la toma.<br/>&bull; Reportar efectos secundarios o alteraciones de sueño al psiquiatra.<br/>&bull; Controlar rutinas de higiene del sueño, limitando uso de pantallas nocturnas.", td_style)
        ],
        
        # Norberto B. Mata
        [
            Paragraph("<b>Norberto B. Mata</b><br/>Esposo<br/><br/><b>Acompañante en Riesgo / Apoyo Emocional</b>", td_bold_style),
            Paragraph("<b>Responsabilidad:</b> Acompañamiento del paciente para evitar aislamiento, apoyo moral y contención en crisis.<br/><b>Recomendación:</b> Recibir terapia individual para prevenir desgaste emocional y soportar el proceso. Apoyarse en los hijos. No juzgar, escuchar activamente.", td_style),
            Paragraph("&bull; Planificar salidas cortas o actividades manuales conjuntas para ocupar el tiempo libre.<br/>&bull; Estar físicamente presente en horas de alto riesgo (noches, fines de semana).<br/>&bull; Aplicar técnicas de Anclaje Sensorial (5-4-3-2-1) cuando el paciente sienta ansiedad.", td_style)
        ]
    ]

    roles_table = Table(roles_data, colWidths=[120, 240, 172])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_ROW]),
    ]))
    story.append(roles_table)
    story.append(Spacer(1, 15))

    doc.build(story)
    print(f"PDF successfully generated at: {output_path}")

if __name__ == '__main__':
    target = os.path.abspath("Roles_Familiares_Ruta_Recuperacion.pdf")
    create_roles_pdf(target)
