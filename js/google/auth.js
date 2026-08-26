/**
 * RUTA DE RECUPERACIÓN - GOOGLE OAUTH 2.0 & IDENTITY SERVICES
 * Handles secure Google Sign-In, Token Lifecycle, and Scope Permissions
 */

class GoogleAuthManager {
  constructor() {
    this.clientId = localStorage.getItem('google_client_id') || '';
    this.tokenClient = null;
    this.accessToken = localStorage.getItem('google_access_token') || null;
    this.tokenExpiry = localStorage.getItem('google_token_expiry') || null;
    this.scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive.file',
      'email',
      'profile'
    ].join(' ');
  }

  init() {
    this.updateSyncUI();
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < Number(this.tokenExpiry)) {
      this.fetchUserProfile();
    } else if (this.accessToken) {
      this.accessToken = null;
      localStorage.removeItem('google_access_token');
      this.updateSyncUI();
    }
  }

  setClientId(clientId) {
    this.clientId = clientId.trim();
    localStorage.setItem('google_client_id', this.clientId);
    window.appState.showToast('Client ID de Google configurado correctamente.', 'success');
  }

  /**
   * Triggers Google OAuth 2.0 Token flow
   */
  signIn() {
    if (!this.clientId) {
      this.showSetupModal();
      return;
    }

    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes,
        callback: (response) => {
          if (response.error !== undefined) {
            console.error('Google Auth Error:', response);
            window.appState.showToast('Error en la autenticación de Google: ' + response.error, 'error');
            return;
          }
          this.accessToken = response.access_token;
          const expiresIn = (response.expires_in || 3600) * 1000;
          this.tokenExpiry = Date.now() + expiresIn;

          localStorage.setItem('google_access_token', this.accessToken);
          localStorage.setItem('google_token_expiry', this.tokenExpiry);

          window.appState.showToast('¡Autenticado con Google exitosamente!', 'success');
          this.fetchUserProfile();
          this.triggerInitialSync();
        },
      });
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Fallback if Google Script hasn't loaded (e.g. offline)
      window.appState.showToast('El servicio de Google Identity no está disponible actualmente (modo fuera de línea).', 'warning');
    }
  }

  signOut() {
    if (this.accessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
      google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log('Google token revoked');
      });
    }
    this.accessToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');

    const state = window.appState.getState();
    window.appState.setState({
      googleAuth: {
        isSignedIn: false,
        userEmail: '',
        userName: '',
        userAvatar: '',
        lastSync: '',
        spreadsheetId: '',
        documentId: ''
      }
    });

    window.appState.showToast('Sesión de Google cerrada.', 'info');
    this.updateSyncUI();
  }

  async fetchUserProfile() {
    if (!this.accessToken) return;
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (res.ok) {
        const profile = await res.json();
        const state = window.appState.getState();
        window.appState.setState({
          googleAuth: {
            ...state.googleAuth,
            isSignedIn: true,
            userEmail: profile.email || '',
            userName: profile.name || '',
            userAvatar: profile.picture || '',
            lastSync: new Date().toLocaleTimeString('es-ES')
          }
        });
        this.updateSyncUI();
      }
    } catch (e) {
      console.warn('Error fetching Google profile:', e);
    }
  }

  async triggerInitialSync() {
    const syncDot = document.getElementById('sync-dot');
    const syncText = document.getElementById('sync-status-text');
    if (syncDot) syncDot.className = 'sync-dot syncing';
    if (syncText) syncText.textContent = 'Sincronizando con Google...';

    try {
      if (window.googleSheetsSync) {
        await window.googleSheetsSync.syncAllData();
      }
      const state = window.appState.getState();
      window.appState.setState({
        googleAuth: {
          ...state.googleAuth,
          lastSync: new Date().toLocaleTimeString('es-ES')
        }
      });
      if (syncDot) syncDot.className = 'sync-dot synced';
      if (syncText) syncText.textContent = 'Sincronizado con Google';
      window.appState.showToast('Base de datos sincronizada con Google Sheets en tu Drive.', 'success');
    } catch (err) {
      console.error('Initial sync error:', err);
      if (syncDot) syncDot.className = 'sync-dot error';
      if (syncText) syncText.textContent = 'Error de sincronización';
    }
  }

  updateSyncUI() {
    const syncBadge = document.getElementById('sync-badge');
    const syncDot = document.getElementById('sync-dot');
    const syncText = document.getElementById('sync-status-text');
    const state = window.appState.getState();

    if (!syncBadge || !syncDot || !syncText) return;

    if (this.accessToken && state.googleAuth.isSignedIn) {
      syncDot.className = 'sync-dot synced';
      syncText.textContent = `Google: ${state.googleAuth.userEmail ? state.googleAuth.userEmail.split('@')[0] : 'Conectado'}`;
    } else {
      syncDot.className = 'sync-dot';
      syncText.textContent = 'Modo Local (Conectar Google)';
    }
  }

  showSetupModal() {
    const modal = document.getElementById('google-setup-modal');
    if (modal) modal.classList.add('active');
  }
}

window.googleAuth = new GoogleAuthManager();
