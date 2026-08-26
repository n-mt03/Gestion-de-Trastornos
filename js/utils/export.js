/**
 * RUTA DE RECUPERACIÓN - CLINICAL EXPORT & BACKUP UTILITIES
 * Generates formatted printable clinical reports and JSON backups
 */

class ExportUtility {
  /**
   * Generates and prints a complete clinical evolution report
   */
  exportClinicalReport() {
    const state = window.appState.getState();
    const patient = state.patient;
    const debts = state.debts;
    const family = state.familyRoles;
    const checkins = state.cravingHistory;
    const abc = state.abcRecords;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor habilita las ventanas emergentes en el navegador para exportar el informe clínico.');
      return;
    }

    const totalBorrowed = debts.reduce((acc, d) => acc + Number(d.amountBorrowed || 0), 0);
    const totalOwed = debts.reduce((acc, d) => acc + Number(d.amountOwed || 0), 0);
    const totalPaid = totalBorrowed - totalOwed;

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Informe Clínico de Evolución - ${patient.name}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.45; font-size: 10pt; margin: 0; padding: 20px; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
          .header h1 { margin: 0 0 4px 0; color: #0f172a; font-size: 18pt; }
          .header p { margin: 0; color: #64748b; font-size: 9.5pt; }
          .badge { background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-size: 8pt; font-weight: bold; }
          h2 { font-size: 12pt; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; }
          .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 14px; font-size: 9pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 14px; font-size: 8.5pt; }
          th { background: #0f172a; color: #ffffff; text-align: left; padding: 6px 8px; border: 1px solid #0f172a; font-weight: 600; }
          td { padding: 6px 8px; border: 1px solid #e2e8f0; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          .agreement-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 3px solid #10b981; padding: 6px 10px; border-radius: 4px; font-size: 8pt; }
          .footer { margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 8pt; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <span class="badge">HISTORIA CLÍNICA &bull; TRASTORNO POR JUEGO (DSM-5-TR F63.0)</span>
            <h1>Informe de Evolución y Adherencia</h1>
            <p>Sistema Digital Ruta de Recuperación &bull; Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:14pt;font-weight:bold;color:#10b981;">${patient.daysClean || 0} DÍAS LIMPIOS</div>
            <div style="font-size:8.5pt;color:#64748b;">Inicio: ${new Date(patient.abstinenceStartDate).toLocaleDateString('es-ES')}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div><b>Paciente:</b> ${patient.name}</div>
          <div><b>Contacto Emergencia:</b> ${patient.emergencyContact || 'No asignado'}</div>
          <div><b>Acompañante de Guardia:</b> ${patient.guardCompanion || 'Asignado'}</div>
          <div><b>Ahorro Preservado Est.:</b> $${(patient.moneySavedEstimated || 0).toLocaleString()}</div>
          <div><b>Horas de Vida Ganadas:</b> ${patient.hoursSavedEstimated || 0} hrs</div>
          <div><b>Nivel Craving Promedio:</b> ${this.calculateAvgCraving(checkins)} / 10</div>
        </div>

        <h2>1. Matriz Sistémico-Familiar de Coterapeutas</h2>
        <table>
          <thead>
            <tr>
              <th>Rol Asignado</th>
              <th>Familiar Responsable</th>
              <th>Contacto</th>
              <th>Tareas Clave</th>
            </tr>
          </thead>
          <tbody>
            ${family.map(f => `
              <tr>
                <td><b>${f.roleTitle}</b></td>
                <td>${f.memberName || 'Por asignar'}</td>
                <td>${f.phone || '-'}</td>
                <td>${f.keyTask}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>2. Estado Financiero y Acuerdos con Prestamistas/Bancos</h2>
        <div style="margin-bottom:8px;font-size:9pt;">
          <b>Total Original Prestado:</b> $${totalBorrowed.toLocaleString()} &nbsp;|&nbsp;
          <b>Saldo Pendiente Actual:</b> $${totalOwed.toLocaleString()} &nbsp;|&nbsp;
          <b>Total Amortizado:</b> $${totalPaid.toLocaleString()}
        </div>
        <table>
          <thead>
            <tr>
              <th>Acreedor / Entidad</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Prestado</th>
              <th>Adeudado</th>
              <th>Frecuencia</th>
              <th>Acuerdo Pactado con el Prestamista</th>
            </tr>
          </thead>
          <tbody>
            ${debts.map(d => `
              <tr>
                <td><b>${d.creditorName}</b></td>
                <td>${d.phone || '-'}</td>
                <td>${d.debtType}</td>
                <td>$${Number(d.amountBorrowed).toLocaleString()}</td>
                <td><b style="color:#b91c1c;">$${Number(d.amountOwed).toLocaleString()}</b></td>
                <td>${d.paymentFrequency}</td>
                <td><div class="agreement-box">${d.agreementTerms || 'Sin acuerdo documentado'}</div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>3. Últimos Check-ins de Deseo (Craving Tracker 0-10)</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Nivel Deseo</th>
              <th>Estado Emocional</th>
              <th>Horas Sueño</th>
              <th>Detonantes Identificados</th>
            </tr>
          </thead>
          <tbody>
            ${checkins.slice(0, 10).map(c => `
              <tr>
                <td>${new Date(c.date).toLocaleString('es-ES')}</td>
                <td><b>${c.craving}/10</b></td>
                <td>${c.mood}</td>
                <td>${c.sleepHours || '-'} hrs</td>
                <td>${(c.triggers || []).join(', ') || 'Ninguno detectado'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>4. Reestructuraciones Cognitivas ABC Recientes</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Gatillo (A)</th>
              <th>Pensamiento Irracional (B)</th>
              <th>Debate Racional (C)</th>
              <th>Conducta Alternativa (D)</th>
            </tr>
          </thead>
          <tbody>
            ${abc.slice(0, 5).map(a => `
              <tr>
                <td>${new Date(a.date).toLocaleDateString('es-ES')}</td>
                <td>${a.trigger}</td>
                <td><i>"${a.irrationalThought}"</i></td>
                <td>${a.rationalDebate}</td>
                <td><b>${a.alternativeBehavior}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Documento generado por la Plataforma Digital <b>Ruta de Recuperación</b> &bull; Información protegida y confidencial para uso médico-terapéutico.
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  }

  calculateAvgCraving(checkins = []) {
    if (!checkins || checkins.length === 0) return 0;
    const sum = checkins.reduce((acc, c) => acc + Number(c.craving || 0), 0);
    return (sum / checkins.length).toFixed(1);
  }

  /**
   * Exports full app state to a JSON backup file
   */
  exportBackupJSON() {
    const state = window.appState.getState();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Ruta_Recuperacion_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    window.appState.showToast("Copia de seguridad descargada en formato JSON.", "success");
  }

  /**
   * Imports backup JSON file
   */
  importBackupJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.patient && parsed.debts && parsed.familyRoles) {
          window.appState.setState(parsed);
          window.appState.showToast("Datos restaurados exitosamente desde la copia de seguridad.", "success");
          window.location.reload();
        } else {
          alert("El archivo JSON no tiene la estructura requerida de Ruta de Recuperación.");
        }
      } catch (err) {
        alert("Error al leer el archivo JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}

window.exportUtility = new ExportUtility();
