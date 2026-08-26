/**
 * RUTA DE RECUPERACIÓN - GOOGLE DOCS API INTEGRATION
 * Generates structured clinical evolution reports and family contracts in Google Docs
 */

class GoogleDocsSync {
  getHeaders() {
    return {
      Authorization: `Bearer ${window.googleAuth.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Creates a formal Clinical Evolution Document in the user's Google Drive
   */
  async generateClinicalDoc() {
    if (!window.googleAuth.accessToken) {
      window.appState.showToast('Por favor autentícate primero con Google para crear documentos en Google Docs.', 'warning');
      window.googleAuth.showSetupModal();
      return;
    }

    try {
      window.appState.showToast('Generando documento en Google Docs...', 'info');
      const patient = window.appState.getState().patient;
      const docTitle = `Informe_Clinico_Evolucion_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

      // 1. Create document
      const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ title: docTitle })
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error ? err.error.message : 'Error creando documento en Google Docs');
      }

      const doc = await createRes.json();
      const documentId = doc.documentId;

      // 2. Insert clinical text content
      const contentText = this.buildClinicalReportText();
      await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: contentText
              }
            }
          ]
        })
      });

      window.appState.showToast('¡Documento clínico creado con éxito en tu Google Drive!', 'success');
      window.open(`https://docs.google.com/document/d/${documentId}/edit`, '_blank');
      return documentId;
    } catch (err) {
      console.error('Google Docs Error:', err);
      window.appState.showToast('Error generando documento en Google Docs: ' + err.message, 'error');
    }
  }

  buildClinicalReportText() {
    const state = window.appState.getState();
    const p = state.patient;
    const debts = state.debts;
    const family = state.familyRoles;

    return `INFORME CLÍNICO DE EVOLUCIÓN Y ADHERENCIA TERAPÉUTICA
Trastorno por Juego de Apuestas (DSM-5-TR F63.0 / CIE-11 6C50)
Sistema Digital: Ruta de Recuperación
Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}

============================================================
1. DATOS DEL PACIENTE Y ESTADO DE ABSTINENCIA
============================================================
• Paciente: ${p.name}
• Teléfono: ${p.phone} | Email: ${p.email}
• Fecha de Inicio de Abstinencia: ${new Date(p.abstinenceStartDate).toLocaleString('es-ES')}
• Días Continuos Libres de Juego: ${p.daysClean || 0} días
• Estimación de Fondos Preservados: $${(p.moneySavedEstimated || 0).toLocaleString()}
• Horas de Vida Recuperadas: ${p.hoursSavedEstimated || 0} horas
• Contacto de Emergencia: ${p.emergencyContact}
• Acompañante de Guardia: ${p.guardCompanion} (${p.guardCompanionPhone})
• Estado Clínico Actual: ${p.status}

============================================================
2. MATRIZ SISTÉMICO-FAMILIAR DE COTERAPEUTAS
============================================================
${family.map(f => `• [Rol ${f.roleCode}: ${f.roleTitle}]
  - Responsable: ${f.memberName} (${f.relation || 'Familiar'}) - Tel: ${f.phone}
  - Responsabilidad: ${f.keyTask}
  - Compromisos Activos: ${(f.tasks || []).map(t => `${t.text} [${t.done ? 'COMPLETADO' : 'PENDIENTE'}]`).join(' | ')}
`).join('\n')}

============================================================
3. INVENTARIO DE DEUDAS Y ACUERDOS CON PRESTAMISTAS / BANCOS
============================================================
${debts.map(d => `• Acreedor: ${d.creditorName} (${d.debtType})
  - Contacto: ${d.phone} | Prioridad: ${d.priority} | Estado: ${d.status}
  - Monto Original: $${Number(d.amountBorrowed).toLocaleString()} | Saldo Adeudado Actual: $${Number(d.amountOwed).toLocaleString()}
  - Frecuencia de Pago: ${d.paymentFrequency} | Próximo Vencimiento: ${d.nextDueDate}
  - ACUERDO PACTADO: "${d.agreementTerms || 'Sin acuerdo formal documentado'}"
`).join('\n')}

============================================================
4. REGLAS FAMILIARES Y PROTOCOLO ANTI-BAILOUT
============================================================
1. NUNCA pagar deudas en secreto ni realizar rescates financieros encubiertos (evitar el efecto bailout).
2. La entrega de efectivo se limita estrictamente al presupuesto semanal tasado ($${p.weeklySupervisedBudget || 120}/semana) administrado por el Responsable Financiero.
3. Ante un deseo agudo de jugar (craving), se activa el Protocolo SOS en 1 clic y el ejercicio Urge Surfing.

Documento confidencial para uso del equipo terapéutico, psiquiátrico y familiar.
`;
  }
}

window.googleDocsSync = new GoogleDocsSync();
