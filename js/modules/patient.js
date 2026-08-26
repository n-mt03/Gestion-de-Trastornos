/**
 * RUTA DE RECUPERACIÓN - PATIENT & PROGRESS MODULE
 * Handles live recovery clock, daily craving check-in, savings calculator (DOP), and milestone badges
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

    // Update estimated money and time saved in Pesos Dominicanos (RD$)
    const dailyGambling = state.patient.dailyGamblingAvg || 3500;
    const dailyHours = state.patient.dailyHoursAvg || 3.5;
    const totalDaysFloat = totalSeconds / 86400;

    const moneySaved = Math.round(totalDaysFloat * dailyGambling);
    const hoursSaved = Math.round(totalDaysFloat * dailyHours);

    const moneyEl = document.getElementById('metric-money-saved');
    const hoursEl = document.getElementById('metric-hours-saved');

    if (moneyEl) moneyEl.textContent = `RD$ ${moneySaved.toLocaleString('es-DO')}`;
    if (hoursEl) hoursEl.textContent = `${hoursSaved.toLocaleString()} hrs`;
  }

  renderHeroStats() {
    const state = window.appState.getState();
    const nameEl = document.getElementById('hero-patient-name');
    const statusEl = document.getElementById('hero-patient-status');
    const avatarEl = document.getElementById('hero-patient-avatar');

    if (nameEl) nameEl.textContent = state.patient.name;
    if (statusEl) statusEl.textContent = `${state.patient.status} • Contacto: ${state.patient.emergencyContact}`;
    if (avatarEl) avatarEl.textContent = (state.patient.name || 'P').charAt(0).toUpperCase();
  }

  renderMilestones() {
    const container = document.getElementById('milestones-grid');
    if (!container) return;

    const state = window.appState.getState();
    const startDate = new Date(state.patient.abstinenceStartDate);
    const daysClean = Math.floor((new Date() - startDate) / 86400000);

    const milestones = state.milestones || [];
    container.innerHTML = milestones.map(m => {
      const isUnlocked = daysClean >= m.days;
      return `
        <div class="milestone-badge ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon">${m.icon}</div>
          <div class="badge-title">${m.title}</div>
          <div class="badge-days">${m.days} ${m.days === 1 ? 'día' : 'días'} sin jugar</div>
          <div class="badge-desc">${m.desc}</div>
          <span class="badge ${isUnlocked ? 'badge-emerald' : 'badge-blue'}" style="margin-top:6px;font-size:10px;">
            ${isUnlocked ? '✓ Desbloqueado' : '⏳ En progreso'}
          </span>
        </div>
      `;
    }).join('');
  }

  renderCravingChart() {
    const state = window.appState.getState();
    if (window.chartRenderer) {
      window.chartRenderer.renderCravingTrend('craving-chart-container', state.cravingHistory || []);
    }
  }

  setupCheckinModal() {
    const slider = document.getElementById('checkin-craving-slider');
    const badge = document.getElementById('checkin-craving-badge');

    if (slider && badge) {
      slider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        badge.textContent = `${val} / 10`;
        badge.className = 'slider-val-badge';
        if (val <= 3) badge.classList.add('low');
        else if (val <= 6) badge.classList.add('mid');
        else badge.classList.add('high');
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
    const craving = Number(document.getElementById('checkin-craving-slider').value);
    const mood = document.getElementById('checkin-mood-select').value;
    const sleepHours = Number(document.getElementById('checkin-sleep-input').value);
    const notes = document.getElementById('checkin-notes-input').value.trim();

    const checkboxes = document.querySelectorAll('input[name="checkin-trigger"]:checked');
    const triggers = Array.from(checkboxes).map(cb => cb.value);

    const newRecord = {
      id: 'cr-' + Date.now(),
      date: new Date().toISOString(),
      craving: craving,
      mood: mood,
      sleepHours: sleepHours,
      triggers: triggers,
      notes: notes
    };

    const state = window.appState.getState();
    const updatedHistory = [...(state.cravingHistory || []), newRecord];

    window.appState.setState({ cravingHistory: updatedHistory });

    this.closeCheckinModal();
    this.renderCravingChart();
    window.appState.showToast('¡Check-in diario registrado exitosamente!', 'success');

    // Auto-sync if signed in with Google
    if (window.googleAuth && window.googleAuth.accessToken) {
      window.googleAuth.triggerInitialSync();
    }
  }
}

window.patientModule = new PatientModule();
