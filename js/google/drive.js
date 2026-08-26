/**
 * RUTA DE RECUPERACIÓN - GOOGLE DRIVE API INTEGRATION
 * Manages backup uploads and application folder structure
 */

class GoogleDriveSync {
  getHeaders() {
    return {
      Authorization: `Bearer ${window.googleAuth.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async getOrCreateFolder() {
    const folderName = 'Ruta de Recuperación';
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(folderName)}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchRes = await fetch(searchUrl, { headers: this.getHeaders() });
    
    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (res.ok) {
      const folder = await res.json();
      return folder.id;
    }
    return null;
  }

  async backupStateToDrive() {
    if (!window.googleAuth.accessToken) {
      window.appState.showToast('Autentícate con Google para respaldar en Google Drive.', 'warning');
      window.googleAuth.showSetupModal();
      return;
    }

    try {
      window.appState.showToast('Subiendo copia de seguridad a Google Drive...', 'info');
      const folderId = await this.getOrCreateFolder();
      const state = window.appState.getState();
      const filename = `Backup_RutaRecuperacion_${new Date().toISOString().split('T')[0]}.json`;

      const metadata = {
        name: filename,
        mimeType: 'application/json',
        parents: folderId ? [folderId] : []
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));

      const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${window.googleAuth.accessToken}` },
        body: form
      });

      if (uploadRes.ok) {
        window.appState.showToast('¡Copia de seguridad guardada exitosamente en tu Google Drive!', 'success');
      } else {
        throw new Error('Error al subir archivo a Drive');
      }
    } catch (err) {
      console.error('Drive backup error:', err);
      window.appState.showToast('Error respaldando en Drive: ' + err.message, 'error');
    }
  }
}

window.googleDriveSync = new GoogleDriveSync();
