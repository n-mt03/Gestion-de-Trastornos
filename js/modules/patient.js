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

  openEditPatientModal() {
    const modal = document.getElementById('patient-edit-modal');
    if (!modal) return;
    
    const state = window.appState.getState();
    const p = state.patient;
    
    document.getElementById('patient-edit-name').value = p.name || '';
    document.getElementById('patient-edit-phone').value = p.phone || '';
    document.getElementById('patient-edit-email').value = p.email || '';
    document.getElementById('patient-edit-gambling-avg').value = p.dailyGamblingAvg || 3500;
    document.getElementById('patient-edit-hours-avg').value = p.dailyHoursAvg || 3.5;
    document.getElementById('patient-edit-budget').value = p.weeklySupervisedBudget || 6000;
    
    if (p.abstinenceStartDate) {
      const d = new Date(p.abstinenceStartDate);
      const tzoffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d - tzoffset)).toISOString().slice(0,16);
      document.getElementById('patient-edit-date').value = localISOTime;
    }
    
    modal.classList.add('active');
  }

  closeEditPatientModal() {
    const modal = document.getElementById('patient-edit-modal');
    if (modal) modal.classList.remove('active');
  }

  savePatientEdit() {
    const state = window.appState.getState();
    const p = { ...state.patient };
    
    const name = document.getElementById('patient-edit-name').value.trim();
    if (!name) {
      window.appState.showToast('El nombre del paciente es obligatorio', 'error');
      return;
    }
    
    p.name = name;
    p.phone = document.getElementById('patient-edit-phone').value.trim();
    p.email = document.getElementById('patient-edit-email').value.trim();
    p.dailyGamblingAvg = Number(document.getElementById('patient-edit-gambling-avg').value) || 0;
    p.dailyHoursAvg = Number(document.getElementById('patient-edit-hours-avg').value) || 0;
    p.weeklySupervisedBudget = Number(document.getElementById('patient-edit-budget').value) || 0;
    
    const dateVal = document.getElementById('patient-edit-date').value;
    if (dateVal) {
      p.abstinenceStartDate = new Date(dateVal).toISOString();
    }
    
    window.appState.setState({ patient: p });
    this.closeEditPatientModal();
    this.renderHeroStats();
    window.appState.showToast('Perfil de paciente actualizado exitosamente', 'success');
    
    this.updateClock();
    this.renderMilestones();
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
