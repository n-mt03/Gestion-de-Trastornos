/**
 * RUTA DE RECUPERACIÓN - PSYCHOEDUCATION & CLINICAL CRITERIA MODULE
 * DSM-5-TR F63.0 / CIE-11 6C50 criteria, Neurobiology, 4 Clinical Phases, and SOGS screening
 */

class PsychoeducationModule {
  init() {
    this.setupAccordion();
  }

  setupAccordion() {
    // Setup interactive accordion clicks if any
  }

  evaluateSogs() {
    const checkboxes = document.querySelectorAll('input[name="dsm-criterion"]:checked');
    const count = checkboxes.length;
    const resultBox = document.getElementById('dsm-result-box');
    const resultText = document.getElementById('dsm-result-text');

    if (!resultBox || !resultText) return;

    resultBox.style.display = 'block';

    if (count >= 8) {
      resultBox.className = 'alert-box danger';
      resultText.innerHTML = `<b>Nivel Grave (${count}/9 Criterios Positivos):</b> Cumple criterios clínicos severos de Trastorno por Juego según el DSM-5-TR. Se requiere contención financiera inmediata de choque y tratamiento multidisciplinar (psicoterapia TCC y psiquiatría).`;
    } else if (count >= 6) {
      resultBox.className = 'alert-box danger';
      resultText.innerHTML = `<b>Nivel Moderado (${count}/9 Criterios Positivos):</b> Cumple criterios de Trastorno por Juego. Deterioro significativo en áreas financieras y relacionales. Se recomienda activación completa de la matriz de roles familiares.`;
    } else if (count >= 4) {
      resultBox.className = 'alert-box warning';
      resultText.innerHTML = `<b>Nivel Leve / Umbral Clínico (${count}/9 Criterios Positivos):</b> Alcanza el criterio diagnóstico formal del DSM-5-TR (mínimo 4 criterios). Urge implementar la Fase 1 de Protección y control del dinero.`;
    } else if (count >= 1) {
      resultBox.className = 'alert-box info';
      resultText.innerHTML = `<b>Juego de Riesgo / Subclínico (${count}/9 Criterios):</b> Aunque no cumple el umbral completo de 4 criterios, presenta señales de vulnerabilidad y pérdida de control incipiente.`;
    } else {
      resultBox.className = 'alert-box success';
      resultText.innerHTML = `<b>Sin Criterios Activos (0/9):</b> No se identifican criterios activos de ludopatía en este momento. Mantener pautas de prevención.`;
    }
  }
}

window.psychoeducationModule = new PsychoeducationModule();
