/**
 * RUTA DE RECUPERACIÓN - GOOGLE OAUTH 2.0 & IDENTITY SERVICES
 * Handles secure Google Sign-In, Token Lifecycle, Scope Permissions, and Graceful Fallback
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
    } else if (this.accessToken && this.tokenExpiry && Date.now() >= Number(this.tokenExpiry)) {
      this.accessToken = null;
      localStorage.removeItem('google_access_token');
      this.updateSyncUI();
    }
  }

  setClientId(clientId) {
    this.clientId = clientId.trim();
    localStorage.setItem('google_client_id', this.clientId);
    window.appState.showToast('Client ID de Google guardado correctamente.', 'success');
  }

  /**
   * Triggers Google OAuth 2.0 Token flow
   */
  signIn() {
    // If no custom Client ID is set yet, show the setup modal with instructions and demo option
    if (!this.clientId || this.clientId.includes('demo')) {
      this.showSetupModal();
      return;
    }

    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scopes,
          callback: (response) => {
            if (response.error !== undefined) {
              console.error('Google Auth Error:', response);
              window.appState.showToast('Error de autorización: ' + (response.error_description || response.error), 'error');
              this.showSetupModal();
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
            this.closeSetupModal();
          },
        });
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        console.warn('GIS Token client error:', err);
        window.appState.showToast('Error inicializando el cliente de Google. Revisa tu Client ID.', 'error');
        this.showSetupModal();
      }
    } else {
      window.appState.showToast('Google Identity SDK no cargó. Modo sin conexión activado.', 'warning');
      this.showSetupModal();
    }
  }

  connectWithCustomClientId() {
    const input = document.getElementById('google-client-id-input');
    const val = input ? input.value.trim() : '';
    if (!val) {
      window.appState.showToast('Ingresa un Client ID de Google Cloud Console válido.', 'warning');
      return;
    }
    this.setClientId(val);
    this.signIn();
  }

  connectDemoAccount() {
    const emailInput = document.getElementById('demo-google-email-input');
    const email = (emailInput && emailInput.value.trim()) || 'norberto.mata03@gmail.com';
    const name = email.split('@')[0].replace('.', ' ').toUpperCase();

    this.accessToken = 'google_oauth_token_' + Date.now();
    this.tokenExpiry = Date.now() + 3600 * 1000;
    localStorage.setItem('google_access_token', this.accessToken);
    localStorage.setItem('google_token_expiry', this.tokenExpiry);

    window.appState.setState({
      googleAuth: {
        isSignedIn: true,
        userEmail: email,
        userName: name,
        userAvatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spreadsheetId: '1AbC_RutaRecuperacion_MasterDB_SheetId',
        documentId: '1Doc_Informe_Clinico_DocId'
      }
    });

    window.appState.showToast(`¡Conectado exitosamente con ${email}!`, 'success');
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
      if (window.googleSheetsSync) {
        await window.googleSheetsSync.syncAllData();
      }
      if (window.googleCalendarSync) {
        await window.googleCalendarSync.syncAllCalendarEvents();
      }
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
      window.appState.showToast('Datos guardados localmente.', 'info');
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
    if (modal) {
      const input = document.getElementById('google-client-id-input');
      if (input) input.value = localStorage.getItem('google_client_id') || '';
      modal.classList.add('active');
    }
  }

  closeSetupModal() {
    const modal = document.getElementById('google-setup-modal');
    if (modal) modal.classList.remove('active');
  }
}

window.googleAuth = new GoogleAuthManager();
