/**
 * RUTA DE RECUPERACIÓN - MAIN APPLICATION CONTROLLER & ROUTER
 */

class AppRouter {
  constructor() {
    this.activeTab = 'dashboard';
    this.currentView = 'patient';
  }

  init() {
    this.setupNavigation();
    this.setupViewSwitcher();
    this.registerServiceWorker();
    this.initializeModules();
    this.setupGoogleModal();

    // Listen to global state changes
    window.appState.subscribe((state) => {
      this.handleStateChange(state);
    });

    console.log('Ruta de Recuperación initialized successfully.');
  }

  initializeModules() {
    if (window.googleAuth) window.googleAuth.init();
    if (window.patientModule) window.patientModule.init();
    if (window.familyModule) window.familyModule.init();
    if (window.debtsModule) window.debtsModule.init();
    if (window.exercisesModule) window.exercisesModule.init();
    if (window.psychoeducationModule) window.psychoeducationModule.init();
  }

  setupNavigation() {
    // Top Nav tabs
    const navButtons = document.querySelectorAll('.nav-tab');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Mobile Bottom Nav items
    const bottomNavButtons = document.querySelectorAll('.bottom-nav-item');
    bottomNavButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });
  }

  setupViewSwitcher() {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (view) this.switchView(view);
      });
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Desktop Nav
    document.querySelectorAll('.nav-tab').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });

    // Update Mobile Nav
    document.querySelectorAll('.bottom-nav-item').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });

    // Update Tab View Containers
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `tab-view-${tabId}`);
    });

    // Redraw charts if switching to dashboard or debts
    if (tabId === 'dashboard' && window.patientModule) {
      setTimeout(() => window.patientModule.renderCravingChart(), 50);
    } else if (tabId === 'debts' && window.debtsModule) {
      setTimeout(() => window.debtsModule.renderFinancialSummary(), 50);
    }
  }

  switchView(viewId) {
    this.currentView = viewId;

    document.querySelectorAll('.view-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-view') === viewId);
    });

    const state = window.appState.getState();
    window.appState.setState({ currentView: viewId });

    if (viewId === 'patient') {
      window.appState.showToast('Vista de Paciente: Foco en abstinencia, check-ins y ejercicios.', 'info');
      this.switchTab('dashboard');
    } else if (viewId === 'family') {
      window.appState.showToast('Vista Familiar: Foco en tareas asignadas, finanzas y acuerdos.', 'info');
      this.switchTab('family');
    } else if (viewId === 'specialist') {
      window.appState.showToast('Vista Especialista / Terapeuta: Resumen clínico y reportes.', 'info');
      this.switchTab('specialist');
    }
  }

  setupGoogleModal() {
    const saveBtn = document.getElementById('save-google-client-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const inp = document.getElementById('google-client-id-input');
        if (inp && inp.value.trim()) {
          window.googleAuth.setClientId(inp.value.trim());
          this.closeGoogleSetupModal();
          window.googleAuth.signIn();
        } else {
          alert('Por favor ingresa un Client ID válido de Google Cloud.');
        }
      });
    }
  }

  openGoogleSetupModal() {
    const inp = document.getElementById('google-client-id-input');
    if (inp) inp.value = window.googleAuth.clientId || '';
    const modal = document.getElementById('google-setup-modal');
    if (modal) modal.classList.add('active');
  }

  closeGoogleSetupModal() {
    const modal = document.getElementById('google-setup-modal');
    if (modal) modal.classList.remove('active');
  }

  handleStateChange(state) {
    if (window.googleAuth) window.googleAuth.updateSyncUI();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('[PWA] Service Worker registered with scope:', reg.scope))
        .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appRouter = new AppRouter();
  window.appRouter.init();
});
