/**
 * RUTA DE RECUPERACIÓN - EMERGENCY SOS PANIC MODULE
 * 1-Click Panic Modal with Direct Companion Call, Instant Urge Surfing launcher, and 24/7 Helplines
 */

class SosModule {
  renderSosDetails() {
    const state = window.appState.getState();
    const companionName = state.patient.guardCompanion || 'Acompañante de Guardia';
    const companionPhone = state.patient.guardCompanionPhone || '';
    const companionWhatsapp = state.patient.guardCompanionWhatsapp || '';

    const nameEl = document.getElementById('sos-companion-name');
    const callLink = document.getElementById('sos-call-btn');
    const waLink = document.getElementById('sos-wa-btn');

    if (nameEl) nameEl.textContent = companionName;
    if (callLink) callLink.href = companionPhone ? `tel:${companionPhone}` : '#';
    if (waLink) waLink.href = companionWhatsapp ? `https://wa.me/${companionWhatsapp}?text=Hola,%20estoy%20experimentando%20un%20impulso%20fuerte%20de%20jugar%20y%20necesito%20acompañamiento%20(Ruta%20de%20Recuperación).` : '#';
  }

  openSosModal() {
    this.renderSosDetails();
    const modal = document.getElementById('sos-modal');
    if (modal) modal.classList.add('active');
  }

  closeSosModal() {
    const modal = document.getElementById('sos-modal');
    if (modal) modal.classList.remove('active');
  }

  launchUrgeSurfingFromSos() {
    this.closeSosModal();
    window.exercisesModule.startUrgeSurfing();
  }
}

window.sosModule = new SosModule();
