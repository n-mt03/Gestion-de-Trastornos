/**
 * RUTA DE RECUPERACIÓN - GOOGLE SHEETS API INTEGRATION
 * Manages two-way sync of clinical, family, and debt data in a master spreadsheet
 */

class GoogleSheetsSync {
  constructor() {
    this.sheetTitle = 'Ruta_de_Recuperacion_MasterDB';
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${window.googleAuth.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async syncAllData() {
    if (!window.googleAuth.accessToken) {
      throw new Error('No hay sesión de Google activa');
    }

    let spreadsheetId = window.appState.getState().googleAuth.spreadsheetId;
    if (!spreadsheetId) {
      spreadsheetId = await this.findOrCreateSpreadsheet();
      const state = window.appState.getState();
      window.appState.setState({
        googleAuth: {
          ...state.googleAuth,
          spreadsheetId: spreadsheetId
        }
      });
    }

    // Push data to the 6 tabs
    await this.updatePatientSheet(spreadsheetId);
    await this.updateCravingSheet(spreadsheetId);
    await this.updateDebtsSheet(spreadsheetId);
    await this.updateAmortizationsSheet(spreadsheetId);
    await this.updateFamilySheet(spreadsheetId);
    await this.updateAbcSheet(spreadsheetId);

    return spreadsheetId;
  }

  async findOrCreateSpreadsheet() {
    // 1. Search if file already exists in Drive
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(this.sheetTitle)}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const searchRes = await fetch(searchUrl, { headers: this.getHeaders() });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }
    }

    // 2. Create new spreadsheet with the 6 sheets
    const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    const payload = {
      properties: { title: this.sheetTitle },
      sheets: [
        { properties: { title: '01_Pacientes_Progreso' } },
        { properties: { title: '02_Diario_Craving_Checkins' } },
        { properties: { title: '03_Inventario_Deudas' } },
        { properties: { title: '04_Historial_Amortizaciones' } },
        { properties: { title: '05_Roles_y_Tareas_Familiares' } },
        { properties: { title: '06_Registros_ABC_Cognitivos' } }
      ]
    };

    const res = await fetch(createUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ? err.error.message : 'Error creando hoja en Google Sheets');
    }

    const data = await res.json();
    return data.spreadsheetId;
  }

  async updateSheetRange(spreadsheetId, range, values) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ range, values })
    });
  }

  async updatePatientSheet(spreadsheetId) {
    const patient = window.appState.getState().patient;
    const values = [
      ['ID', 'Nombre del Paciente', 'Teléfono', 'Email', 'Inicio Abstinencia', 'Gasto Diario Promedio ($)', 'Horas Diarias Juego', 'Contacto Emergencia', 'Acompañante de Guardia', 'Presupuesto Semanal Tasado ($)', 'Estado Clínico'],
      [
        patient.id,
        patient.name,
        patient.phone,
        patient.email,
        patient.abstinenceStartDate,
        patient.dailyGamblingAvg,
        patient.dailyHoursAvg,
        patient.emergencyContact,
        patient.guardCompanion,
        patient.weeklySupervisedBudget,
        patient.status
      ]
    ];
    await this.updateSheetRange(spreadsheetId, '01_Pacientes_Progreso!A1:K2', values);
  }

  async updateCravingSheet(spreadsheetId) {
    const history = window.appState.getState().cravingHistory;
    const values = [
      ['ID', 'Marca Temporal (Fecha/Hora)', 'Nivel de Deseo (0-10)', 'Estado Emocional', 'Horas de Sueño', 'Detonantes Activos', 'Observaciones / Conducta'],
      ...history.map(c => [
        c.id,
        c.date,
        c.craving,
        c.mood,
        c.sleepHours,
        (c.triggers || []).join('; '),
        c.notes || ''
      ])
    ];
    await this.updateSheetRange(spreadsheetId, `02_Diario_Craving_Checkins!A1:G${values.length}`, values);
  }

  async updateDebtsSheet(spreadsheetId) {
    const debts = window.appState.getState().debts;
    const values = [
      ['ID', 'Acreedor / Entidad Financiera', 'Teléfono', 'Categoría de Deuda', 'Monto Tomado Prestado ($)', 'Saldo Adeudado a la Fecha ($)', 'Tasa de Interés / Cargos', 'Frecuencia de Pago', 'Próximo Vencimiento', 'Nivel de Prioridad', 'Estado de la Deuda', 'Términos del Acuerdo Pactado con el Prestamista'],
      ...debts.map(d => [
        d.id,
        d.creditorName,
        d.phone,
        d.debtType,
        d.amountBorrowed,
        d.amountOwed,
        d.interestRate,
        d.paymentFrequency,
        d.nextDueDate,
        d.priority,
        d.status,
        d.agreementTerms || ''
      ])
    ];
    await this.updateSheetRange(spreadsheetId, `03_Inventario_Deudas!A1:L${values.length}`, values);
  }

  async updateAmortizationsSheet(spreadsheetId) {
    const debts = window.appState.getState().debts;
    const amortRows = [];
    debts.forEach(d => {
      (d.amortizations || []).forEach(am => {
        amortRows.push([
          am.id,
          am.date,
          d.id,
          d.creditorName,
          am.amount,
          am.note || ''
        ]);
      });
    });

    const values = [
      ['ID Pago', 'Fecha de Abono', 'ID Deuda', 'Acreedor', 'Monto Abonado ($)', 'Notas / Comprobante'],
      ...amortRows
    ];
    await this.updateSheetRange(spreadsheetId, `04_Historial_Amortizaciones!A1:F${Math.max(2, values.length)}`, values);
  }

  async updateFamilySheet(spreadsheetId) {
    const family = window.appState.getState().familyRoles;
    const rows = [];
    family.forEach(f => {
      (f.tasks || []).forEach(t => {
        rows.push([
          f.roleTitle,
          f.memberName,
          f.relation,
          f.phone,
          t.id,
          t.text,
          t.dueDate || '',
          t.done ? 'Completado' : 'Pendiente'
        ]);
      });
    });

    const values = [
      ['Rol Familiar', 'Nombre del Familiar', 'Parentesco', 'Teléfono', 'ID Tarea', 'Descripción del Compromiso', 'Fecha Límite', 'Estado'],
      ...rows
    ];
    await this.updateSheetRange(spreadsheetId, `05_Roles_y_Tareas_Familiares!A1:H${Math.max(2, values.length)}`, values);
  }

  async updateAbcSheet(spreadsheetId) {
    const abc = window.appState.getState().abcRecords;
    const values = [
      ['ID', 'Fecha', 'Antecedente / Gatillo (A)', 'Pensamiento Irracional (B)', 'Debate Racional (C)', 'Conducta Alternativa (D)'],
      ...abc.map(a => [
        a.id,
        a.date,
        a.trigger,
        a.irrationalThought,
        a.rationalDebate,
        a.alternativeBehavior
      ])
    ];
    await this.updateSheetRange(spreadsheetId, `06_Registros_ABC_Cognitivos!A1:F${Math.max(2, values.length)}`, values);
  }
}

window.googleSheetsSync = new GoogleSheetsSync();
