/**
 * RUTA DE RECUPERACIÓN - CENTRAL STATE MANAGEMENT
 * Reactive state store with LocalStorage persistence and event emitter
 */

class AppState {
  constructor() {
    this.storageKey = 'ruta_recuperacion_v1_state';
    this.listeners = [];
    this.state = this.loadInitialState();
  }

  loadInitialState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved state, generating default state:', e);
      }
    }
    return this.generateDefaultClinicalState();
  }

  generateDefaultClinicalState() {
    const today = new Date();
    // Default 18 days of clean recovery
    const startDate = new Date();
    startDate.setDate(today.getDate() - 18);
    startDate.setHours(8, 0, 0, 0);

    return {
      currentView: 'patient', // 'patient' | 'family' | 'specialist'
      activeTab: 'dashboard',  // 'dashboard' | 'family' | 'debts' | 'exercises' | 'psychoeducation' | 'google'
      
      patient: {
        id: 'pat-001',
        name: 'Roberto Gómez',
        phone: '+1 (809) 555-2468',
        email: 'roberto.recuperacion@gmail.com',
        abstinenceStartDate: startDate.toISOString(),
        dailyGamblingAvg: 65, // Average daily loss before stopping
        dailyHoursAvg: 3.5,   // Average daily hours spent gambling
        emergencyContact: 'Laura Gómez (Esposa) - +1 (809) 555-0199',
        guardCompanion: 'Carlos Gómez (Hermano)',
        guardCompanionPhone: '+1 (809) 555-0144',
        guardCompanionWhatsapp: '18095550144',
        weeklySupervisedBudget: 120, // $120 weekly cash pocket money
        status: 'En Fase 2 (Intervención TCC)'
      },

      cravingHistory: [
        { id: 'cr-1', date: new Date(Date.now() - 86400000 * 5).toISOString(), craving: 8, mood: 'Ansioso', sleepHours: 5, triggers: ['Día de cobro', 'Estrés laboral'], notes: 'Surfeé el impulso con respiración 4-6.' },
        { id: 'cr-2', date: new Date(Date.now() - 86400000 * 4).toISOString(), craving: 6, mood: 'Inquieto', sleepHours: 6, triggers: ['Soledad'], notes: 'Caminata de 30 min con mi hermano.' },
        { id: 'cr-3', date: new Date(Date.now() - 86400000 * 3).toISOString(), craving: 4, mood: 'Estable', sleepHours: 7, triggers: [], notes: 'Buen día sin ganas fuertes.' },
        { id: 'cr-4', date: new Date(Date.now() - 86400000 * 2).toISOString(), craving: 5, mood: 'Cansado', sleepHours: 6.5, triggers: ['Discusión menor'], notes: 'Hice registro cognitivo ABC.' },
        { id: 'cr-5', date: new Date(Date.now() - 86400000 * 1).toISOString(), craving: 3, mood: 'Tranquilo', sleepHours: 8, triggers: [], notes: 'Reunión familiar de 15 min completada.' },
        { id: 'cr-6', date: new Date().toISOString(), craving: 2, mood: 'Optimista', sleepHours: 7.5, triggers: [], notes: 'Check-in matutino.' }
      ],

      familyRoles: [
        {
          id: 'coord',
          roleTitle: 'Coordinador Familiar',
          roleCode: '1',
          memberName: 'Laura Gómez',
          relation: 'Esposa',
          phone: '+1 (809) 555-0199',
          keyTask: 'Interlocutor con psicólogo tratante; coordina citas y convoca reuniones de 15 min.',
          tasks: [
            { id: 't-1', text: 'Confirmar cita de psicoterapia del jueves 4:00 PM', done: true, dueDate: '2026-08-28' },
            { id: 't-2', text: 'Convocar reunión familiar breve de 15 min el domingo', done: false, dueDate: '2026-08-30' }
          ]
        },
        {
          id: 'fin',
          roleTitle: 'Responsable Financiero Temporal',
          roleCode: '2',
          memberName: 'Carlos Gómez',
          relation: 'Hermano',
          phone: '+1 (809) 555-0144',
          keyTask: 'Custodia de tarjetas, claves bancarias, entrega de presupuesto tasado y libro de deudas.',
          tasks: [
            { id: 't-3', text: 'Entregar presupuesto semanal tasado en efectivo ($120)', done: true, dueDate: '2026-08-25' },
            { id: 't-4', text: 'Auditar extracto bancario y validar cero solicitudes de préstamos', done: true, dueDate: '2026-08-24' },
            { id: 't-5', text: 'Efectuar pago pactado quincenal al Banco Nacional', done: false, dueDate: '2026-08-30' }
          ]
        },
        {
          id: 'risk',
          roleTitle: 'Acompañante en Riesgo',
          roleCode: '3',
          memberName: 'Marcos Peña',
          relation: 'Amigo / Coterapeuta',
          phone: '+1 (809) 555-0177',
          keyTask: 'Acompañamiento en franjas vulnerables (1:00 AM - 5:00 AM, cobro de nómina) y ocio.',
          tasks: [
            { id: 't-6', text: 'Programar salida al parque/gimnasio el sábado por la tarde', done: false, dueDate: '2026-08-29' },
            { id: 't-7', text: 'Monitoreo nocturno activo en fin de semana', done: true, dueDate: '2026-08-23' }
          ]
        },
        {
          id: 'emo',
          roleTitle: 'Apoyo Emocional',
          roleCode: '4',
          memberName: 'Ana Mercedes',
          relation: 'Madre',
          phone: '+1 (809) 555-0122',
          keyTask: 'Escucha activa sin juicio ni reproches, desescalada de crisis y validación de logros.',
          tasks: [
            { id: 't-8', text: 'Llamada diaria de 10 min de aliento y validación de abstinencia', done: true, dueDate: '2026-08-25' }
          ]
        },
        {
          id: 'med',
          roleTitle: 'Enlace Médico / Psiquiátrico',
          roleCode: '5',
          memberName: 'Dra. Patricia Reyes',
          relation: 'Psiquiatra de Enlace',
          phone: '+1 (809) 555-0155',
          keyTask: 'Supervisar toma de Naltrexona, monitoreo de sueño y registro de efectos secundarios.',
          tasks: [
            { id: 't-9', text: 'Verificar toma matutina de Naltrexona (50mg)', done: true, dueDate: '2026-08-25' },
            { id: 't-10', text: 'Reportar reporte de insomnio/cefalea en la app', done: false, dueDate: '2026-08-27' }
          ]
        }
      ],

      debts: [
        {
          id: 'd-1',
          creditorName: 'Banco Nacional (Tarjeta Crédito Visa)',
          phone: '+1 (809) 555-8000',
          debtType: 'Entidad Bancaria / Tarjeta',
          amountBorrowed: 4500,
          amountOwed: 2900,
          interestRate: '18% anual (Congelado por acuerdo)',
          paymentFrequency: 'Mensual',
          nextDueDate: '2026-09-05',
          priority: 'Alta',
          status: 'Al Día',
          agreementTerms: 'Acuerdo pactado con el gestor de cobranza: Congelación total de intereses por 12 meses condicionado a pagos fijos de $250 mensuales. El familiar financiero Carlos Gómez figura como interlocutor verificado.',
          amortizations: [
            { id: 'am-1', date: '2026-08-05', amount: 250, note: 'Cuota agosto pagada vía transferencia bancaria', receiptUrl: '' }
          ]
        },
        {
          id: 'd-2',
          creditorName: 'Don Aurelio (Prestamista Informal)',
          phone: '+1 (809) 555-9231',
          debtType: 'Prestamista Informal / Usura',
          amountBorrowed: 1800,
          amountOwed: 900,
          interestRate: '0% (Eliminado tras reunión familiar)',
          paymentFrequency: 'Quincenal',
          nextDueDate: '2026-08-30',
          priority: 'Alta',
          status: 'Al Día',
          agreementTerms: 'Acuerdo firmado presencialmente con el responsable financiero: Cese inmediato de intereses abusivos. Se acordó liquidar el capital restante en 6 cuotas quincenales de $150 entregadas únicamente por Carlos Gómez.',
          amortizations: [
            { id: 'am-2', date: '2026-08-15', amount: 150, note: 'Cuota quincena 1 agosto pagada con recibo físico', receiptUrl: '' }
          ]
        },
        {
          id: 'd-3',
          creditorName: 'Tío Roberto (Familiar)',
          phone: '+1 (809) 555-3412',
          debtType: 'Familiar / Amistad',
          amountBorrowed: 1200,
          amountOwed: 800,
          interestRate: '0%',
          paymentFrequency: 'Mensual',
          nextDueDate: '2026-09-15',
          priority: 'Media',
          status: 'Al Día',
          agreementTerms: 'Acuerdo de transparencia familiar: Pago de $100 mensuales a partir de consolidar 30 días limpios de juego. Sin penalizaciones.',
          amortizations: [
            { id: 'am-3', date: '2026-08-10', amount: 100, note: 'Abono mensual en cuenta', receiptUrl: '' }
          ]
        }
      ],

      abcRecords: [
        {
          id: 'abc-1',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          trigger: 'Recibí un mensaje de texto promocional de una casa de apuestas online mientras estaba solo en casa.',
          irrationalThought: 'Si deposito solo $20, puedo recuperar lo del mes pasado rápidamente y nadie lo sabrá.',
          rationalDebate: 'El juego nunca ha recuperado nada, solo ha destruido mis finanzas y la confianza familiar. Las probabilidades matemáticas siempre me dejarán en cero.',
          alternativeBehavior: 'Eliminé y bloqueé el número, llamé a mi hermano Carlos y salí a caminar 25 minutos con mi perro.'
        }
      ],

      contingencyContract: {
        signed: true,
        signDate: '2026-08-10',
        termsAccepted: true
      },

      googleAuth: {
        isSignedIn: false,
        userEmail: '',
        userName: '',
        userAvatar: '',
        lastSync: '',
        spreadsheetId: '',
        documentId: ''
      }
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.saveState();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(fn => {
      try {
        fn(this.state);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '🛑';

    toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.25s reverse forwards';
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  }
}

window.appState = new AppState();
