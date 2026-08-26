/**
 * RUTA DE RECUPERACIÓN - DEBT REGISTRY & FINANCIAL AUDIT MODULE
 * Manages debt ledger, negotiated lender agreements, amortizations, and weekly cash budget
 */

class DebtsModule {
  init() {
    this.renderDebtsList();
    this.renderFinancialSummary();
  }

  renderFinancialSummary() {
    const state = window.appState.getState();
    const debts = state.debts || [];

    const totalBorrowed = debts.reduce((acc, d) => acc + Number(d.amountBorrowed || 0), 0);
    const totalOwed = debts.reduce((acc, d) => acc + Number(d.amountOwed || 0), 0);
    const totalPaid = Math.max(0, totalBorrowed - totalOwed);

    const bEl = document.getElementById('stat-total-borrowed');
    const oEl = document.getElementById('stat-total-owed');
    const pEl = document.getElementById('stat-total-paid');

    if (bEl) bEl.textContent = `$${totalBorrowed.toLocaleString()}`;
    if (oEl) oEl.textContent = `$${totalOwed.toLocaleString()}`;
    if (pEl) pEl.textContent = `$${totalPaid.toLocaleString()}`;

    if (window.chartRenderer) {
      window.chartRenderer.renderDebtProgress('debt-progress-container', totalBorrowed, totalOwed);
    }
  }

  renderDebtsList() {
    const container = document.getElementById('debts-container');
    if (!container) return;

    const state = window.appState.getState();
    const debts = state.debts || [];

    if (debts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-muted);">
          <div style="font-size:32px;margin-bottom:8px;">💳</div>
          <div style="font-weight:700;font-size:16px;color:#ffffff;">No hay deudas registradas</div>
          <p style="font-size:13px;margin-top:4px;">Haz clic en "+ Registrar Nueva Deuda" para inventariar acreedores y documentar acuerdos pactados.</p>
        </div>`;
      return;
    }

    container.innerHTML = debts.map(d => {
      const priorityBadge = d.priority === 'Alta' ? 'badge-crimson' : d.priority === 'Media' ? 'badge-amber' : 'badge-emerald';
      const statusBadge = d.status === 'Liquidada' ? 'badge-emerald' : d.status === 'Atrasada' ? 'badge-crimson' : 'badge-blue';
      const paidAmt = Number(d.amountBorrowed || 0) - Number(d.amountOwed || 0);
      const paidPct = d.amountBorrowed > 0 ? Math.round((paidAmt / d.amountBorrowed) * 100) : 100;

      return `
        <div class="card" style="border-left: 4px solid ${d.priority === 'Alta' ? 'var(--danger-crimson)' : 'var(--brand-blue)'};">
          <div class="card-header">
            <div class="card-title-group">
              <div class="card-icon blue">🏛️</div>
              <div>
                <div class="card-title">${d.creditorName}</div>
                <div class="card-subtitle">📞 ${d.phone || 'Sin teléfono'} &bull; Categoría: <b>${d.debtType}</b></div>
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
              <span class="badge ${priorityBadge}">Prioridad ${d.priority}</span>
              <span class="badge ${statusBadge}">${d.status}</span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px;background:var(--surface-navy);padding:12px 14px;border-radius:var(--radius-md);margin-bottom:14px;">
            <div>
              <div style="font-size:11px;color:var(--text-dim);font-weight:600;">MONTO TOMADO</div>
              <div style="font-size:15px;font-weight:700;color:#ffffff;">$${Number(d.amountBorrowed).toLocaleString()}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-dim);font-weight:600;">SALDO ADEUDADO</div>
              <div style="font-size:16px;font-weight:800;color:var(--danger-crimson-light);">$${Number(d.amountOwed).toLocaleString()}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-dim);font-weight:600;">FRECUENCIA PAGO</div>
              <div style="font-size:14px;font-weight:600;color:var(--text-main);">${d.paymentFrequency}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-dim);font-weight:600;">PRÓXIMO PAGO</div>
              <div style="font-size:14px;font-weight:600;color:var(--brand-blue-light);">${d.nextDueDate || 'Por definir'}</div>
            </div>
          </div>

          <!-- ACUERDO PACTADO DESTACADO -->
          <div style="background:rgba(2, 132, 199, 0.08);border:1px solid rgba(56, 189, 248, 0.25);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--brand-blue-light);margin-bottom:4px;">
              <span>🤝</span> ACUERDO PACTADO CON EL PRESTAMISTA / ENTIDAD:
            </div>
            <p style="font-size:13px;color:#ffffff;line-height:1.4;margin:0;">
              ${d.agreementTerms ? d.agreementTerms : '<i style="color:var(--text-dim);">No se ha documentado un acuerdo formal aún. Usa el botón "Editar Deuda" para agregar los términos pactados.</i>'}
            </p>
          </div>

          <!-- Amortization Progress Bar -->
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-muted);margin-bottom:4px;">
              <span>Progreso de Amortización: <b>${paidPct}%</b></span>
              <span>Amortizado: <b>$${paidAmt.toLocaleString()}</b> de $${Number(d.amountBorrowed).toLocaleString()}</span>
            </div>
            <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
              <div style="width:${paidPct}%;height:100%;background:linear-gradient(90deg, #0284c7, #10b981);border-radius:3px;"></div>
            </div>
          </div>

          <!-- Card Actions -->
          <div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="window.debtsModule.openAmortizeModal('${d.id}')">💵 Registrar Abono</button>
            <button class="btn btn-outline btn-sm" onclick="window.debtsModule.openEditModal('${d.id}')">✏️ Editar / Acuerdo</button>
            <button class="btn btn-outline btn-sm" onclick="window.debtsModule.deleteDebt('${d.id}')" style="color:#f87171;">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  openNewDebtModal() {
    document.getElementById('debt-form-id').value = '';
    document.getElementById('debt-creditor-input').value = '';
    document.getElementById('debt-phone-input').value = '';
    document.getElementById('debt-type-select').value = 'Entidad Bancaria / Tarjeta';
    document.getElementById('debt-borrowed-input').value = '';
    document.getElementById('debt-owed-input').value = '';
    document.getElementById('debt-rate-input').value = '0%';
    document.getElementById('debt-freq-select').value = 'Mensual';
    document.getElementById('debt-due-input').value = '';
    document.getElementById('debt-priority-select').value = 'Alta';
    document.getElementById('debt-agreement-input').value = '';
    
    document.getElementById('debt-modal-title').textContent = 'Registrar Nueva Deuda y Acuerdo';
    document.getElementById('debt-modal').classList.add('active');
  }

  openEditModal(debtId) {
    const state = window.appState.getState();
    const d = state.debts.find(item => item.id === debtId);
    if (!d) return;

    document.getElementById('debt-form-id').value = d.id;
    document.getElementById('debt-creditor-input').value = d.creditorName;
    document.getElementById('debt-phone-input').value = d.phone || '';
    document.getElementById('debt-type-select').value = d.debtType;
    document.getElementById('debt-borrowed-input').value = d.amountBorrowed;
    document.getElementById('debt-owed-input').value = d.amountOwed;
    document.getElementById('debt-rate-input').value = d.interestRate || '';
    document.getElementById('debt-freq-select').value = d.paymentFrequency;
    document.getElementById('debt-due-input').value = d.nextDueDate || '';
    document.getElementById('debt-priority-select').value = d.priority;
    document.getElementById('debt-agreement-input').value = d.agreementTerms || '';

    document.getElementById('debt-modal-title').textContent = 'Editar Deuda y Acuerdo Pactado';
    document.getElementById('debt-modal').classList.add('active');
  }

  closeDebtModal() {
    document.getElementById('debt-modal').classList.remove('active');
  }

  saveDebt() {
    const id = document.getElementById('debt-form-id').value;
    const creditor = document.getElementById('debt-creditor-input').value.trim();
    const phone = document.getElementById('debt-phone-input').value.trim();
    const type = document.getElementById('debt-type-select').value;
    const borrowed = Number(document.getElementById('debt-borrowed-input').value) || 0;
    const owed = Number(document.getElementById('debt-owed-input').value) || 0;
    const rate = document.getElementById('debt-rate-input').value.trim();
    const freq = document.getElementById('debt-freq-select').value;
    const dueDate = document.getElementById('debt-due-input').value;
    const priority = document.getElementById('debt-priority-select').value;
    const agreement = document.getElementById('debt-agreement-input').value.trim();

    if (!creditor || borrowed <= 0) {
      alert('Por favor ingresa el nombre del acreedor y el monto original tomado prestado.');
      return;
    }

    const state = window.appState.getState();
    let debts = [...state.debts];

    if (id) {
      // Edit existing
      debts = debts.map(d => {
        if (d.id === id) {
          return {
            ...d,
            creditorName: creditor,
            phone,
            debtType: type,
            amountBorrowed: borrowed,
            amountOwed: owed,
            interestRate: rate,
            paymentFrequency: freq,
            nextDueDate: dueDate,
            priority,
            agreementTerms: agreement,
            status: owed <= 0 ? 'Liquidada' : d.status
          };
        }
        return d;
      });
      window.appState.showToast('Deuda y acuerdo actualizados.', 'success');
    } else {
      // Create new
      debts.push({
        id: 'd-' + Date.now(),
        creditorName: creditor,
        phone,
        debtType: type,
        amountBorrowed: borrowed,
        amountOwed: owed,
        interestRate: rate,
        paymentFrequency: freq,
        nextDueDate: dueDate,
        priority,
        status: owed <= 0 ? 'Liquidada' : 'Al Día',
        agreementTerms: agreement,
        amortizations: []
      });
      window.appState.showToast('Nueva deuda registrada en el libro maestro.', 'success');
    }

    window.appState.setState({ debts });
    this.closeDebtModal();
    this.renderDebtsList();
    this.renderFinancialSummary();
  }

  deleteDebt(debtId) {
    if (!confirm('¿Estás seguro de eliminar este registro de deuda?')) return;
    const state = window.appState.getState();
    const debts = state.debts.filter(d => d.id !== debtId);
    window.appState.setState({ debts });
    this.renderDebtsList();
    this.renderFinancialSummary();
    window.appState.showToast('Deuda eliminada del registro.', 'info');
  }

  // --- AMORTIZATION LOGIC ---
  openAmortizeModal(debtId) {
    const state = window.appState.getState();
    const d = state.debts.find(item => item.id === debtId);
    if (!d) return;

    document.getElementById('amortize-debt-id').value = d.id;
    document.getElementById('amortize-creditor-name').textContent = d.creditorName;
    document.getElementById('amortize-current-owed').textContent = `$${Number(d.amountOwed).toLocaleString()}`;
    document.getElementById('amortize-amount-input').value = '';
    document.getElementById('amortize-note-input').value = '';

    document.getElementById('amortize-modal').classList.add('active');
  }

  closeAmortizeModal() {
    document.getElementById('amortize-modal').classList.remove('active');
  }

  saveAmortization() {
    const debtId = document.getElementById('amortize-debt-id').value;
    const amount = Number(document.getElementById('amortize-amount-input').value) || 0;
    const note = document.getElementById('amortize-note-input').value.trim();

    if (amount <= 0) {
      alert('Por favor ingresa un monto válido de abono.');
      return;
    }

    const state = window.appState.getState();
    const debts = state.debts.map(d => {
      if (d.id === debtId) {
        const newOwed = Math.max(0, Number(d.amountOwed) - amount);
        const newAmort = {
          id: 'am-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount: amount,
          note: note
        };
        return {
          ...d,
          amountOwed: newOwed,
          status: newOwed === 0 ? 'Liquidada' : d.status,
          amortizations: [...(d.amortizations || []), newAmort]
        };
      }
      return d;
    });

    window.appState.setState({ debts });
    this.closeAmortizeModal();
    this.renderDebtsList();
    this.renderFinancialSummary();
    window.soundSynth.playMilestoneChime();
    window.appState.showToast(`¡Abono de $${amount.toLocaleString()} registrado con éxito!`, 'success');
  }
}

window.debtsModule = new DebtsModule();
