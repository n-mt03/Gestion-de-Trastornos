/**
 * RUTA DE RECUPERACIÓN - CENTRAL STATE MANAGEMENT
 * Reactive state store with LocalStorage persistence and event emitter
 * Currency: Pesos Dominicanos (DOP / RD$)
 */

class AppState {
  constructor() {
    this.storageKey = 'ruta_recuperacion_v3_state';
    this.listeners = [];
    this.state = this.loadInitialState();
  }

  loadInitialState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure currency is set to DOP
        parsed.currency = 'DOP';
        return parsed;
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
      currency: 'DOP',
      currencySymbol: 'RD$',
      currentView: 'patient', // 'patient' | 'family' | 'specialist'
      activeTab: 'dashboard',  // 'dashboard' | 'family' | 'debts' | 'exercises' | 'psychoeducation' | 'google'
      
      patient: {
        id: 'pat-001',
        name: 'Lourdes Mejia De Mata',
        phone: '',
        email: '',
        abstinenceStartDate: startDate.toISOString(),
        dailyGamblingAvg: 3500, // Average daily loss in RD$ before stopping
        dailyHoursAvg: 3.5,     // Average daily hours spent gambling
        emergencyContact: 'Norberto Mata (Hijo) - +1 (809) 555-0001',
        guardCompanion: 'Norberto B. Mata (Esposo)',
        guardCompanionPhone: '+1 (809) 555-0002',
        guardCompanionWhatsapp: '18095550002',
        weeklySupervisedBudget: 6000, // RD$ 6,000 weekly cash pocket money
        status: 'En Fase 2 (Intervención TCC)'
      },

      cravingHistory: [],

      familyRoles: [
        {
          id: 'coord',
          roleTitle: 'Coordinador Familiar',
          roleCode: '1',
          memberName: 'Norberto Mata',
          relation: 'Hijo',
          phone: '+1 (809) 555-0001',
          keyTask: 'Interlocutor con psicólogo tratante; coordina citas y convoca reuniones de 15 min.',
          tasks: []
        },
        {
          id: 'fin',
          roleTitle: 'Responsable Financiero Temporal',
          roleCode: '2',
          memberName: 'Alberto Mata',
          relation: 'Hijo',
          phone: '+1 (809) 555-0003',
          keyTask: 'Custodia de tarjetas, claves bancarias, entrega de presupuesto tasado y libro de deudas.',
          tasks: []
        },
        {
          id: 'risk',
          roleTitle: 'Acompañante en Riesgo',
          roleCode: '3',
          memberName: 'Norberto B. Mata',
          relation: 'Esposo',
          phone: '+1 (809) 555-0002',
          keyTask: 'Acompañamiento en franjas vulnerables (1:00 AM - 5:00 AM, cobro de nómina) y ocio.',
          tasks: []
        },
        {
          id: 'emo',
          roleTitle: 'Apoyo Emocional',
          roleCode: '4',
          memberName: 'Norberto B. Mata',
          relation: 'Esposo',
          phone: '+1 (809) 555-0002',
          keyTask: 'Escucha activa sin juicio ni reproches, desescalada de crisis y validación de logros.',
          tasks: []
        },
        {
          id: 'med',
          roleTitle: 'Enlace Médico / Psiquiátrico',
          roleCode: '5',
          memberName: 'Ana Massiel',
          relation: 'Hija',
          phone: '+1 (809) 555-0004',
          keyTask: 'Supervisar toma de Naltrexona, monitoreo de sueño y registro de efectos secundarios.',
          tasks: []
        }
      ],

      debts: [],

      abcRecords: [],

      milestones: [
        { id: 'm-1', days: 1, title: '24 Horas Limpio', icon: '🌱', desc: 'Primer día de blindaje consciente', unlocked: true },
        { id: 'm-2', days: 7, title: '1 Semana Serena', icon: '🌿', desc: 'Desactivación inicial del circuito impulsivo', unlocked: true },
        { id: 'm-3', days: 14, title: '2 Semanas Claras', icon: '🌳', desc: 'Consolidación de rutinas sin apuestas', unlocked: true },
        { id: 'm-4', days: 30, title: '1 Mes Protector', icon: '🛡️', desc: 'Primera victoria de desensibilización dopaminérgica', unlocked: false },
        { id: 'm-5', days: 90, title: '90 Días de Hábito', icon: '⭐', desc: 'Reestructuración cognitiva y control del córtex prefrontal', unlocked: false },
        { id: 'm-6', days: 180, title: '6 Meses de Vida', icon: '💎', desc: 'Restauración vincular familiar y orden financiero', unlocked: false },
        { id: 'm-7', days: 365, title: '1 Año de Libertad', icon: '👑', desc: 'Año completo en sobriedad y transformación vital', unlocked: false }
      ],

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

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.persist();
    this.notify();
  }

  persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error persisting app state:', e);
    }
  }

  saveState() {
    this.persist();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (e) {
        console.error('State listener error:', e);
      }
    });
  }

  formatMoney(amount) {
    return `RD$ ${Number(amount || 0).toLocaleString('es-DO')}`;
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

window.appState = new AppState();
