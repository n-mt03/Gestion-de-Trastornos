/**
 * RUTA DE RECUPERACIÓN - PATIENT & PROGRESS MODULE
 * Handles live recovery clock, daily craving check-in, savings calculator, and milestone badges
 */

class PatientModule {
  constructor() {
    this.timerInterval = null;
  }

  init() {
    this.startLiveCounter();
    this.renderHeroStats();
    this.renderMilestones();
    this.renderCravingChart();
    this.setupCheckinModal();
  }

  startLiveCounter() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.updateClock();
    this.timerInterval = setInterval(() => this.updateClock(), 1000);
  }

  updateClock() {
    const state = window.appState.getState();
    const startDate = new Date(state.patient.abstinenceStartDate);
    const now = new Date();
    const diffMs = Math.max(0, now - startDate);

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Update DOM
    const dEl = document.getElementById('count-days');
    const hEl = document.getElementById('count-hours');
    const mEl = document.getElementById('count-minutes');
    const sEl = document.getElementById('count-seconds');

    if (dEl) dEl.textContent = days;
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = String(seconds).padStart(2, '0');

    // Update estimated money and time saved
    const dailyGambling = state.patient.dailyGamblingAvg || 65;
    const dailyHours = state.patient.dailyHoursAvg || 3.5;
    const totalDaysFloat = totalSeconds / 86400;

    const moneySaved = Math.round(totalDaysFloat * dailyGambling);
    const hoursSaved = Math.round(totalDaysFloat * dailyHours);

    const moneyEl = document.getElementById('metric-money-saved');
    const hoursEl = document.getElementById('metric-hours-saved');

    if (moneyEl) moneyEl.textContent = `$${moneySaved.toLocaleString()}`;
    if (hoursEl) hoursEl.textContent = `${hoursSaved.toLocaleString()} hrs`;

    // Update patient object in state without triggering continuous redraw
    state.patient.daysClean = days;
    state.patient.moneySavedEstimated = moneySaved;
    state.patient.hoursSavedEstimated = hoursSaved;
  }

  renderHeroStats() {
    const state = window.appState.getState();
    const patientNameEl = document.getElementById('hero-patient-name');
    const patientStatusEl = document.getElementById('hero-patient-status');
    const patientAvatarEl = document.getElementById('hero-patient-avatar');

    if (patientNameEl) patientNameEl.textContent = state.patient.name;
    if (patientStatusEl) patientStatusEl.textContent = `${state.patient.status} • Contacto: ${state.patient.emergencyContact}`;
    if (patientAvatarEl) patientAvatarEl.textContent = state.patient.name.charAt(0).toUpperCase();
  }

  renderMilestones() {
    const container = document.getElementById('milestones-grid');
    if (!container) return;

    const state = window.appState.getState();
    const days = state.patient.daysClean || 0;

    const badges = [
      { id: 'b-24h', name: 'Primeras 24 Horas', desc: 'Paso 1: Contención inicial', reqDays: 1, icon: '🌱' },
      { id: 'b-1w', name: '1 Semana Limpia', desc: 'Desintoxicación dopaminérgica', reqDays: 7, icon: '🌿' },
      { id: 'b-2w', name: '2 Semanas', desc: 'Estabilidad y rutina familiar', reqDays: 14, icon: '🛡️' },
      { id: 'b-1m', name: '1 Mes de Claridad', desc: 'Freno a la caza de pérdidas', reqDays: 30, icon: '⭐' },
      { id: 'b-90d', name: '90 Días de Libertad', desc: 'Reconfiguración de hábitos', reqDays: 90, icon: '💎' },
      { id: 'b-6m', name: '6 Meses', desc: 'Rehabilitación y autonomía', reqDays: 180, icon: '🏆' },
      { id: 'b-1y', name: '1 Año de Renacimiento', desc: 'Proyecto vital consolidado', reqDays: 365, icon: '👑' }
    ];

    container.innerHTML = badges.map(b => {
      const isUnlocked = days >= b.reqDays;
      return `
        <div class="milestone-badge ${isUnlocked ? 'unlocked' : ''}">
          <div class="badge-icon-wrap">${b.icon}</div>
          <div class="badge-name">${b.name}</div>
          <div class="badge-desc">${isUnlocked ? '¡Desbloqueado!' : `Meta: ${b.reqDays} días`}</div>
        </div>
      `;
    }).join('');
  }

  renderCravingChart() {
    const state = window.appState.getState();
    if (window.chartRenderer) {
      window.chartRenderer.renderCravingChart('craving-chart-container', state.cravingHistory);
    }
  }

  setupCheckinModal() {
    const slider = document.getElementById('checkin-craving-slider');
    const badge = document.getElementById('checkin-craving-badge');

    if (slider && badge) {
      slider.addEventListener('input', (e) => {
        const val = e.target.value;
        badge.textContent = `${val} / 10`;
        if (val >= 7) {
          badge.style.background = 'var(--danger-crimson)';
          badge.style.color = '#ffffff';
        } else if (val >= 4) {
          badge.style.background = 'var(--warning-amber)';
          badge.style.color = '#0f172a';
        } else {
          badge.style.background = 'var(--recovery-emerald)';
          badge.style.color = '#ffffff';
        }
      });
    }
  }

  openCheckinModal() {
    const modal = document.getElementById('checkin-modal');
    if (modal) modal.classList.add('active');
  }

  closeCheckinModal() {
    const modal = document.getElementById('checkin-modal');
    if (modal) modal.classList.remove('active');
  }

  saveCheckin() {
    const slider = document.getElementById('checkin-craving-slider');
    const moodSelect = document.getElementById('checkin-mood-select');
    const sleepInput = document.getElementById('checkin-sleep-input');
    const notesInput = document.getElementById('checkin-notes-input');

    // Trigger checkboxes
    const triggerBoxes = document.querySelectorAll('input[name="checkin-trigger"]:checked');
    const triggers = Array.from(triggerBoxes).map(b => b.value);

    const cravingVal = Number(slider.value);
    const newCheckin = {
      id: 'cr-' + Date.now(),
      date: new Date().toISOString(),
      craving: cravingVal,
      mood: moodSelect.value,
      sleepHours: Number(sleepInput.value) || 7,
      triggers: triggers,
      notes: notesInput.value.trim()
    };

    const state = window.appState.getState();
    const updatedHistory = [...state.cravingHistory, newCheckin];
    window.appState.setState({ cravingHistory: updatedHistory });

    this.closeCheckinModal();
    this.renderCravingChart();
    window.appState.showToast('¡Check-in diario registrado exitosamente!', 'success');

    // If craving is high, suggest Urge Surfing
    if (cravingVal >= 6) {
      if (confirm('Se detectó un nivel de deseo elevado. ¿Deseas iniciar ahora el ejercicio guiado de Urge Surfing para surfear el impulso?')) {
        window.exercisesModule.startUrgeSurfing();
      }
    }
  }
}

window.patientModule = new PatientModule();
