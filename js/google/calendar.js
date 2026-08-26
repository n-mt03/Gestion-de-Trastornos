/**
 * RUTA DE RECUPERACIÓN - GOOGLE CALENDAR API INTEGRATION
 * Synchronizes therapy appointments, weekly 15-min family meetings, and debt due dates
 */

class GoogleCalendarSync {
  getHeaders() {
    return {
      Authorization: `Bearer ${window.googleAuth.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async syncAllCalendarEvents() {
    if (!window.googleAuth.accessToken) {
      window.appState.showToast('Autentícate con Google para sincronizar tu Google Calendar.', 'warning');
      window.googleAuth.showSetupModal();
      return;
    }

    try {
      window.appState.showToast('Sincronizando eventos con Google Calendar...', 'info');
      const state = window.appState.getState();
      let createdCount = 0;

      // 1. Sync Weekly Family Meeting (15 min)
      await this.createEvent({
        summary: '👥 Reunión Familiar de Seguimiento (15 min) - Ruta de Recuperación',
        description: 'Reunión breve semanal convocada por el Coordinador Familiar para revisar acuerdos, gastos y avances sin reproches.',
        start: { dateTime: new Date(Date.now() + 86400000 * 2).toISOString() },
        end: { dateTime: new Date(Date.now() + 86400000 * 2 + 15 * 60000).toISOString() }
      });
      createdCount++;

      // 2. Sync Debt Due Dates
      for (const debt of state.debts) {
        if (debt.nextDueDate && debt.status !== 'Liquidada') {
          const dueStart = new Date(debt.nextDueDate + 'T10:00:00');
          const dueEnd = new Date(debt.nextDueDate + 'T10:30:00');
          await this.createEvent({
            summary: `💳 Pago de Acuerdo: ${debt.creditorName} ($${debt.amountOwed})`,
            description: `Vencimiento de cuota según acuerdo pactado.\nInterlocutor: Responsable Financiero.\nTérminos: ${debt.agreementTerms || ''}`,
            start: { dateTime: dueStart.toISOString() },
            end: { dateTime: dueEnd.toISOString() }
          });
          createdCount++;
        }
      }

      window.appState.showToast(`¡${createdCount} eventos sincronizados con tu Google Calendar!`, 'success');
    } catch (err) {
      console.error('Google Calendar error:', err);
      window.appState.showToast('Error en Google Calendar: ' + err.message, 'error');
    }
  }

  async createEvent(eventPayload) {
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(eventPayload)
    });
    if (!res.ok) {
      const err = await res.json();
      console.warn('Calendar item error:', err);
    }
  }
}

window.googleCalendarSync = new GoogleCalendarSync();
