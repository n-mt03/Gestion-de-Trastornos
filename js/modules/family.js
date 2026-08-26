/**
 * RUTA DE RECUPERACIÓN - SYSTEMIC FAMILY MODULE
 * Manages 5 cotherapist roles, family tasks, anti-bailout rules, and contingency contract
 */

class FamilyModule {
  init() {
    this.renderRolesGrid();
    this.renderTasksBoard();
  }

  renderRolesGrid() {
    const container = document.getElementById('family-roles-container');
    if (!container) return;

    const state = window.appState.getState();
    const roles = state.familyRoles;

    const roleClassMap = {
      'coord': 'role-coord',
      'fin': 'role-fin',
      'risk': 'role-risk',
      'emo': 'role-emo',
      'med': 'role-med'
    };

    container.innerHTML = roles.map(r => {
      const cls = roleClassMap[r.id] || '';
      return `
        <div class="role-card ${cls}">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="badge badge-blue">Rol ${r.roleCode}</span>
              <button class="btn btn-outline btn-sm" onclick="window.familyModule.editRole('${r.id}')" title="Editar asignación">✏️ Editar</button>
            </div>
            <div style="font-size:15px;font-weight:700;margin-top:8px;color:#ffffff;">${r.roleTitle}</div>
            <div class="role-assigned-name">👤 ${r.memberName || 'Sin asignar'} <span style="font-size:11.5px;color:var(--text-dim);">(${r.relation || 'Familiar'})</span></div>
            <a href="tel:${r.phone}" class="role-phone-link">📞 ${r.phone || 'Sin teléfono'}</a>
            <p style="font-size:12px;color:var(--text-muted);margin-top:8px;">${r.keyTask}</p>
          </div>
          <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;">
            <div style="font-size:11px;font-weight:700;color:var(--text-dim);margin-bottom:6px;">COMPROMISOS ACTIVOS (${(r.tasks || []).filter(t => t.done).length}/${(r.tasks || []).length}):</div>
            ${(r.tasks || []).slice(0, 2).map(t => `
              <div style="font-size:11.5px;display:flex;align-items:center;gap:6px;margin-bottom:3px;color:${t.done ? 'var(--recovery-emerald-light)' : 'var(--text-muted)'};">
                <span>${t.done ? '✓' : '○'}</span>
                <span style="${t.done ? 'text-decoration:line-through;' : ''}">${t.text}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  renderTasksBoard() {
    const container = document.getElementById('family-tasks-tbody');
    if (!container) return;

    const state = window.appState.getState();
    const rows = [];

    state.familyRoles.forEach(r => {
      (r.tasks || []).forEach(t => {
        rows.push({
          roleId: r.id,
          roleTitle: r.roleTitle,
          memberName: r.memberName,
          taskId: t.id,
          text: t.text,
          dueDate: t.dueDate,
          done: t.done
        });
      });
    });

    if (rows.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No hay tareas familiares asignadas. Haz clic en "Nueva Tarea" para agregar una.</td></tr>`;
      return;
    }

    container.innerHTML = rows.map(item => `
      <tr>
        <td>
          <input type="checkbox" ${item.done ? 'checked' : ''} onchange="window.familyModule.toggleTask('${item.roleId}', '${item.taskId}')" style="width:16px;height:16px;cursor:pointer;accent-color:var(--recovery-emerald);" />
        </td>
        <td>
          <div style="font-weight:600;color:${item.done ? 'var(--text-dim)' : '#ffffff'};${item.done ? 'text-decoration:line-through;' : ''}">
            ${item.text}
          </div>
        </td>
        <td>
          <span class="badge badge-gray">${item.roleTitle}</span>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${item.memberName}</div>
        </td>
        <td>${item.dueDate || 'Sin fecha'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="window.familyModule.deleteTask('${item.roleId}', '${item.taskId}')" style="color:#f87171;padding:3px 8px;">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  toggleTask(roleId, taskId) {
    const state = window.appState.getState();
    const role = state.familyRoles.find(r => r.id === roleId);
    if (!role) return;

    const task = (role.tasks || []).find(t => t.id === taskId);
    if (task) {
      task.done = !task.done;
      window.appState.saveState();
      this.renderRolesGrid();
      this.renderTasksBoard();
      if (task.done) {
        window.soundSynth.playMilestoneChime();
        window.appState.showToast('Compromiso familiar completado y verificado.', 'success');
      }
    }
  }

  deleteTask(roleId, taskId) {
    if (!confirm('¿Deseas eliminar esta tarea familiar?')) return;
    const state = window.appState.getState();
    const role = state.familyRoles.find(r => r.id === roleId);
    if (role) {
      role.tasks = (role.tasks || []).filter(t => t.id !== taskId);
      window.appState.saveState();
      this.renderRolesGrid();
      this.renderTasksBoard();
      window.appState.showToast('Tarea eliminada.', 'info');
    }
  }

  openAddTaskModal() {
    const select = document.getElementById('task-role-select');
    if (select) {
      const state = window.appState.getState();
      select.innerHTML = state.familyRoles.map(r => `
        <option value="${r.id}">${r.roleTitle} (${r.memberName || 'Sin nombre'})</option>
      `).join('');
    }
    const modal = document.getElementById('add-task-modal');
    if (modal) modal.classList.add('active');
  }

  closeAddTaskModal() {
    const modal = document.getElementById('add-task-modal');
    if (modal) modal.classList.remove('active');
  }

  saveNewTask() {
    const roleId = document.getElementById('task-role-select').value;
    const text = document.getElementById('task-text-input').value.trim();
    const dueDate = document.getElementById('task-due-input').value;

    if (!text) {
      alert('Por favor ingresa la descripción de la tarea.');
      return;
    }

    const state = window.appState.getState();
    const role = state.familyRoles.find(r => r.id === roleId);
    if (role) {
      role.tasks = role.tasks || [];
      role.tasks.push({
        id: 't-' + Date.now(),
        text: text,
        dueDate: dueDate || '',
        done: false
      });
      window.appState.saveState();
      this.closeAddTaskModal();
      this.renderRolesGrid();
      this.renderTasksBoard();
      window.appState.showToast('Nueva tarea familiar asignada.', 'success');
    }
  }

  editRole(roleId) {
    const state = window.appState.getState();
    const role = state.familyRoles.find(r => r.id === roleId);
    if (!role) return;

    document.getElementById('edit-role-id').value = role.id;
    document.getElementById('edit-role-title').textContent = role.roleTitle;
    document.getElementById('edit-role-name').value = role.memberName || '';
    document.getElementById('edit-role-relation').value = role.relation || '';
    document.getElementById('edit-role-phone').value = role.phone || '';

    const modal = document.getElementById('edit-role-modal');
    if (modal) modal.classList.add('active');
  }

  closeEditRoleModal() {
    const modal = document.getElementById('edit-role-modal');
    if (modal) modal.classList.remove('active');
  }

  saveRoleEdit() {
    const roleId = document.getElementById('edit-role-id').value;
    const name = document.getElementById('edit-role-name').value.trim();
    const relation = document.getElementById('edit-role-relation').value.trim();
    const phone = document.getElementById('edit-role-phone').value.trim();

    const state = window.appState.getState();
    const role = state.familyRoles.find(r => r.id === roleId);
    if (role) {
      role.memberName = name;
      role.relation = relation;
      role.phone = phone;

      // Update emergency contacts if relevant
      if (role.id === 'risk') {
        state.patient.guardCompanion = name;
        state.patient.guardCompanionPhone = phone;
      }

      window.appState.saveState();
      this.closeEditRoleModal();
      this.renderRolesGrid();
      this.renderTasksBoard();
      window.appState.showToast('Asignación de rol familiar actualizada.', 'success');
    }
  }
}

window.familyModule = new FamilyModule();
