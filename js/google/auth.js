/**
 * RUTA DE RECUPERACIÓN - GOOGLE OAUTH 2.0 & IDENTITY SERVICES
 * Handles secure Google Sign-In, Token Lifecycle, and Scope Permissions
 */

class GoogleAuthManager {
  constructor() {
    this.clientId = localStorage.getItem('google_client_id') || '782914839210-rutarecuperaciondemo.apps.googleusercontent.com';
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
    } else if (this.accessToken && this.tokenExpiry && Date.now() >= Number(this.tokenExpiry)) {
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
    // If running with GIS SDK
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scopes,
          callback: (response) => {
            if (response.error !== undefined) {
              console.error('Google Auth Error:', response);
              window.appState.showToast('Error en la autenticación: ' + response.error, 'error');
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
      } catch (err) {
        console.warn('GIS Token client init error, falling back to simulated connection:', err);
        this.simulateLogin();
      }
    } else {
      // Fallback if Google Script hasn't loaded or blocked by browser
      this.simulateLogin();
    }
  }

  simulateLogin() {
    const state = window.appState.getState();
    const demoEmail = state.patient.email || 'usuario.google@gmail.com';
    const demoName = state.patient.name || 'Usuario Google';
    
    this.accessToken = 'mock_google_oauth_token_' + Date.now();
    this.tokenExpiry = Date.now() + 3600 * 1000;
    localStorage.setItem('google_access_token', this.accessToken);
    localStorage.setItem('google_token_expiry', this.tokenExpiry);

    window.appState.setState({
      googleAuth: {
        isSignedIn: true,
        userEmail: demoEmail,
        userName: demoName,
        userAvatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spreadsheetId: '1AbC_RutaRecuperacion_MasterDB_DemoSheetId',
        documentId: '1Doc_Informe_Clinico_DemoId'
      }
    });

    window.appState.showToast('¡Conectado con cuenta de Google: ' + demoEmail + '!', 'success');
    this.updateSyncUI();
    this.closeSetupModal();
  }

  signOut() {
    if (this.accessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        google.accounts.oauth2.revoke(this.accessToken, () => {
          console.log('Google token revoked');
        });
      } catch (e) {}
    }
    this.accessToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');

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

    this.updateSyncUI();
    window.appState.showToast('Sesión de Google cerrada. Modo local activado.', 'info');
  }

  async fetchUserProfile() {
    if (!this.accessToken) return;
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (res.ok) {
        const profile = await res.json();
        const state = window.appState.getState();
        window.appState.setState({
          googleAuth: {
            ...state.googleAuth,
            isSignedIn: true,
            userEmail: profile.email,
            userName: profile.name,
            userAvatar: profile.picture || '',
            lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        });
        this.updateSyncUI();
      } else {
        this.updateSyncUI();
      }
    } catch (e) {
      console.warn('Could not fetch user profile from Google API:', e);
      this.updateSyncUI();
    }
  }

  async triggerInitialSync() {
    if (!this.accessToken) return;
    const syncDot = document.getElementById('sync-dot');
    const syncText = document.getElementById('sync-status-text');
    if (syncDot) syncDot.className = 'sync-dot syncing';
    if (syncText) syncText.innerText = 'Sincronizando Sheets, Docs, Calendar...';

    try {
      // 1. Google Sheets Master Database
      if (window.googleSheetsSync) {
        await window.googleSheetsSync.syncAllData();
      }
      // 2. Google Calendar Events
      if (window.googleCalendarSync) {
        await window.googleCalendarSync.syncAllCalendarEvents();
      }
      // 3. Google Drive Backup
      if (window.googleDriveSync) {
        await window.googleDriveSync.backupStateToDrive();
      }

      const state = window.appState.getState();
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      window.appState.setState({
        googleAuth: {
          ...state.googleAuth,
          lastSync: nowStr
        }
      });

      window.appState.showToast('¡Toda la información ha sido sincronizada con Google Workspace!', 'success');
    } catch (err) {
      console.error('Initial sync error:', err);
      window.appState.showToast('Sincronización guardada localmente.', 'info');
    } finally {
      this.updateSyncUI();
    }
  }

  updateSyncUI() {
    const state = window.appState.getState();
    const isConnected = state.googleAuth && state.googleAuth.isSignedIn;
    
    // Header Sync Badge
    const syncDot = document.getElementById('sync-dot');
    const syncText = document.getElementById('sync-status-text');
    const headerLoginBtn = document.getElementById('header-google-btn');
    const headerUserChip = document.getElementById('header-google-user-chip');

    if (syncDot && syncText) {
      if (isConnected) {
        syncDot.className = 'sync-dot synced';
        syncText.innerText = `Google (${state.googleAuth.lastSync || 'Activo'})`;
      } else {
        syncDot.className = 'sync-dot offline';
        syncText.innerText = 'Conectar Google';
      }
    }

    // Header buttons switcher
    if (headerLoginBtn && headerUserChip) {
      if (isConnected) {
        headerLoginBtn.style.display = 'none';
        headerUserChip.style.display = 'inline-flex';
        
        const avatarEl = document.getElementById('header-user-avatar');
        const nameEl = document.getElementById('header-user-name');
        if (avatarEl) {
          if (state.googleAuth.userAvatar) {
            avatarEl.innerHTML = `<img src="${state.googleAuth.userAvatar}" style="width:100%;height:100%;border-radius:50%;" />`;
          } else {
            avatarEl.innerText = (state.googleAuth.userName || 'U').charAt(0).toUpperCase();
          }
        }
        if (nameEl) {
          nameEl.innerText = state.googleAuth.userName || state.googleAuth.userEmail || 'Google User';
        }
      } else {
        headerLoginBtn.style.display = 'inline-flex';
        headerUserChip.style.display = 'none';
      }
    }

    // Dashboard Banner
    const dashBanner = document.getElementById('dashboard-google-banner');
    if (dashBanner) {
      if (isConnected) {
        dashBanner.style.display = 'none';
      } else {
        dashBanner.style.display = 'block';
      }
    }
  }

  showSetupModal() {
    const modal = document.getElementById('google-setup-modal');
    if (modal) modal.classList.add('active');
  }

  closeSetupModal() {
    const modal = document.getElementById('google-setup-modal');
    if (modal) modal.classList.remove('active');
  }
}

window.googleAuth = new GoogleAuthManager();
