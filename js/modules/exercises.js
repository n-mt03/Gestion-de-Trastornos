/**
 * RUTA DE RECUPERACIÓN - THERAPEUTIC EXERCISES MODULE
 * Guided Urge Surfing, Breathing Pacer, Cognitive ABC Register, and 5-4-3-2-1 Sensory Grounding
 */

class ExercisesModule {
  constructor() {
    this.pacerInterval = null;
    this.pacerSecondsRemaining = 480; // 8 minutes default
    this.isPacerRunning = false;
    this.currentPhase = 'inhale'; // 'inhale' (4s) | 'exhale' (6s)
    this.phaseTimeRemaining = 4;
  }

  init() {
    this.renderAbcRecords();
    this.setupSomaticItems();
  }

  // --- URGE SURFING & PACER ---
  startUrgeSurfing() {
    // Switch to exercises tab
    window.appRouter.switchTab('exercises');
    
    // Scroll to pacer
    const pacerCard = document.getElementById('urge-surfing-card');
    if (pacerCard) pacerCard.scrollIntoView({ behavior: 'smooth' });

    if (!this.isPacerRunning) {
      this.togglePacer();
    }
  }

  togglePacer() {
    const playBtn = document.getElementById('pacer-toggle-btn');
    if (this.isPacerRunning) {
      // Pause
      clearInterval(this.pacerInterval);
      this.isPacerRunning = false;
      if (playBtn) playBtn.innerHTML = '▶ Iniciar Surfear el Impulso (8 min)';
      window.appState.showToast('Ejercicio en pausa.', 'info');
    } else {
      // Start
      this.isPacerRunning = true;
      if (playBtn) playBtn.innerHTML = '⏸ Pausar Ejercicio';
      window.soundSynth.playBowlChime(432, 4);
      window.appState.showToast('Iniciando Urge Surfing. Respira al ritmo del círculo.', 'info');
      
      this.runPacerLoop();
      this.pacerInterval = setInterval(() => this.runPacerLoop(), 1000);
    }
  }

  runPacerLoop() {
    if (this.pacerSecondsRemaining <= 0) {
      clearInterval(this.pacerInterval);
      this.isPacerRunning = false;
      window.soundSynth.playMilestoneChime();
      alert('¡Excelente trabajo! Has surfeado la ola del impulso por 8 minutos completos. El pico de urgencia se ha extinguido fisiológicamente.');
      this.resetPacer();
      return;
    }

    this.pacerSecondsRemaining--;
    this.phaseTimeRemaining--;

    const bubble = document.getElementById('pacer-bubble');
    const phaseText = document.getElementById('pacer-phase-text');
    const timerText = document.getElementById('pacer-phase-timer');
    const totalTimerText = document.getElementById('pacer-total-timer');

    // Format remaining time MM:SS
    const mins = Math.floor(this.pacerSecondsRemaining / 60);
    const secs = this.pacerSecondsRemaining % 60;
    if (totalTimerText) totalTimerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (this.phaseTimeRemaining <= 0) {
      // Switch breathing phase
      if (this.currentPhase === 'inhale') {
        this.currentPhase = 'exhale';
        this.phaseTimeRemaining = 6;
        if (bubble) bubble.className = 'pacer-bubble exhale';
        if (phaseText) phaseText.textContent = 'EXHALA (6s)';
        window.soundSynth.playBreathCue(false);
      } else {
        this.currentPhase = 'inhale';
        this.phaseTimeRemaining = 4;
        if (bubble) bubble.className = 'pacer-bubble inhale';
        if (phaseText) phaseText.textContent = 'INHALA (4s)';
        window.soundSynth.playBreathCue(true);
      }
    }

    if (timerText) timerText.textContent = `${this.phaseTimeRemaining}s`;
  }

  resetPacer() {
    clearInterval(this.pacerInterval);
    this.isPacerRunning = false;
    this.pacerSecondsRemaining = 480;
    this.currentPhase = 'inhale';
    this.phaseTimeRemaining = 4;

    const playBtn = document.getElementById('pacer-toggle-btn');
    const bubble = document.getElementById('pacer-bubble');
    const phaseText = document.getElementById('pacer-phase-text');
    const timerText = document.getElementById('pacer-phase-timer');
    const totalTimerText = document.getElementById('pacer-total-timer');

    if (playBtn) playBtn.innerHTML = '▶ Iniciar Surfear el Impulso (8 min)';
    if (bubble) bubble.className = 'pacer-bubble';
    if (phaseText) phaseText.textContent = 'PREPARADO';
    if (timerText) timerText.textContent = '4s';
    if (totalTimerText) totalTimerText.textContent = '08:00';
  }

  setupSomaticItems() {
    const items = document.querySelectorAll('.somatic-item');
    items.forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('checked');
      });
    });
  }

  // --- COGNITIVE ABC RESTRUCTURING ---
  loadAbcTemplate(type) {
    const triggerInp = document.getElementById('abc-trigger-input');
    const thoughtInp = document.getElementById('abc-thought-input');
    const debateInp = document.getElementById('abc-debate-input');
    const actionInp = document.getElementById('abc-action-input');

    if (type === 'falacia') {
      triggerInp.value = 'Perdí 3 apuestas seguidas en el juego y me queda poco dinero.';
      thoughtInp.value = 'Por ley de probabilidades, la próxima mano o giro tiene que ser ganador obligatoriamente.';
      debateInp.value = 'Falacia del Jugador: Cada evento en el juego de azar es matemáticamente independiente. El azar no tiene memoria ni deudas conmigo; la ventaja siempre es del casino.';
      actionInp.value = 'Apagar el dispositivo, avisar al responsable financiero y realizar 10 minutos de respiración diafragmática.';
    } else if (type === 'control') {
      triggerInp.value = 'Estudio estadísticas deportivas o trucos de máquinas en YouTube.';
      thoughtInp.value = 'Si analizo mejor el sistema, podré predecir el resultado y tener control sobre las ganancias.';
      debateInp.value = 'Ilusión de Control: Los algoritmos RNG y los juegos de apuestas están diseñados para dar ventaja matemática a la casa sin importar el análisis personal.';
      actionInp.value = 'Desinstalar aplicaciones deportivas y salir a entrenar al aire libre.';
    } else if (type === 'chasing') {
      triggerInp.value = 'Llegó el estado de cuenta y veo las deudas acumuladas.';
      thoughtInp.value = 'La única forma rápida de pagar esta deuda es apostar una cantidad grande una última vez.';
      debateInp.value = 'Caza de Pérdidas: El juego nunca solucionó una deuda; siempre la multiplicó. La única salida real es el plan estructurado de amortización con mi familia.';
      actionInp.value = 'Revisar el libro de acuerdos en la app y comunicarme con mi Coordinador Familiar.';
    }
  }

  saveAbcRecord() {
    const trigger = document.getElementById('abc-trigger-input').value.trim();
    const thought = document.getElementById('abc-thought-input').value.trim();
    const debate = document.getElementById('abc-debate-input').value.trim();
    const action = document.getElementById('abc-action-input').value.trim();

    if (!trigger || !thought || !debate || !action) {
      alert('Por favor completa todos los campos del registro cognitivo ABC.');
      return;
    }

    const state = window.appState.getState();
    const newRecord = {
      id: 'abc-' + Date.now(),
      date: new Date().toISOString(),
      trigger,
      irrationalThought: thought,
      rationalDebate: debate,
      alternativeBehavior: action
    };

    const updated = [newRecord, ...state.abcRecords];
    window.appState.setState({ abcRecords: updated });

    // Clear inputs
    document.getElementById('abc-trigger-input').value = '';
    document.getElementById('abc-thought-input').value = '';
    document.getElementById('abc-debate-input').value = '';
    document.getElementById('abc-action-input').value = '';

    this.renderAbcRecords();
    window.soundSynth.playMilestoneChime();
    window.appState.showToast('¡Reestructuración cognitiva guardada exitosamente!', 'success');
  }

  renderAbcRecords() {
    const container = document.getElementById('abc-records-list');
    if (!container) return;

    const state = window.appState.getState();
    const records = state.abcRecords || [];

    if (records.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No hay registros ABC guardados aún.</div>`;
      return;
    }

    container.innerHTML = records.map(r => `
      <div style="background:var(--surface-navy);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:14px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:var(--text-dim);margin-bottom:8px;">
          <span>📅 ${new Date(r.date).toLocaleString('es-ES')}</span>
          <button class="btn btn-outline btn-sm" onclick="window.exercisesModule.deleteAbcRecord('${r.id}')" style="color:#f87171;padding:2px 6px;">🗑️</button>
        </div>
        <div style="font-size:12.5px;margin-bottom:6px;"><b style="color:var(--brand-blue-light);">A (Gatillo):</b> ${r.trigger}</div>
        <div style="font-size:12.5px;margin-bottom:6px;"><b style="color:var(--danger-crimson-light);">B (Pensamiento Irracional):</b> <i>"${r.irrationalThought}"</i></div>
        <div style="font-size:12.5px;margin-bottom:6px;"><b style="color:var(--recovery-emerald-light);">C (Debate Racional):</b> ${r.rationalDebate}</div>
        <div style="font-size:12.5px;"><b style="color:#ffffff;">D (Conducta Alternativa):</b> <span style="color:#38bdf8;">${r.alternativeBehavior}</span></div>
      </div>
    `).join('');
  }

  deleteAbcRecord(id) {
    if (!confirm('¿Deseas eliminar este registro ABC?')) return;
    const state = window.appState.getState();
    const filtered = state.abcRecords.filter(r => r.id !== id);
    window.appState.setState({ abcRecords: filtered });
    this.renderAbcRecords();
    window.appState.showToast('Registro eliminado.', 'info');
  }

  // --- SENSORY GROUNDING 5-4-3-2-1 ---
  saveGroundingSession() {
    window.soundSynth.playMilestoneChime();
    window.appState.showToast('¡Sesión de anclaje 5-4-3-2-1 completada! Tu sistema nervioso simpático ha descendido su activación.', 'success');
  }
}

window.exercisesModule = new ExercisesModule();
