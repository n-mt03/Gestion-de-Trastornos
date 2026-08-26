/**
 * RUTA DE RECUPERACIÓN - DEBT REGISTRY & FINANCIAL AUDIT MODULE
 * Manages debt ledger in Dominican Pesos (RD$), negotiated lender agreements, amortizations, and weekly cash budget
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

    if (bEl) bEl.textContent = `RD$ ${totalBorrowed.toLocaleString('es-DO')}`;
    if (oEl) oEl.textContent = `RD$ ${totalOwed.toLocaleString('es-DO')}`;
    if (pEl) pEl.textContent = `RD$ ${totalPaid.toLocaleString('es-DO')}`;

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
              <div style="font-size:15px;font-weight:700;color:#ffffff;">RD$ ${Number(d.amountBorrowed).toLocaleString('es-DO')}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-dim);font-weight:600;">SALDO ADEUDADO</div>
              <div style="font-size:16px;font-weight:800;color:var(--danger-crimson-light);">RD$ ${Number(d.amountOwed).toLocaleString('es-DO')}</div>
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

          <!-- PROGRESS BAR OF PAYMENT -->
          <div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:4px;">
              <span>Amortizado: <b>${paidPct}%</b> (RD$ ${paidAmt.toLocaleString('es-DO')})</span>
              <span>Saldo: <b>RD$ ${Number(d.amountOwed).toLocaleString('es-DO')}</b></span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: ${paidPct}%;"></div>
            </div>
          </div>

          <!-- AMORTIZATION HISTORY LIST -->
          ${d.amortizations && d.amortizations.length > 0 ? `
            <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;margin-bottom:12px;">
              <div style="font-size:12px;font-weight:600;color:var(--text-dim);margin-bottom:6px;">HISTORIAL DE ABONOS:</div>
              ${d.amortizations.map(am => `
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:4px 0;border-bottom:1px dashed rgba(255,255,255,0.04);">
                  <div>📅 ${am.date} &bull; ${am.note || 'Abono a capital'}</div>
                  <div style="font-weight:700;color:var(--recovery-emerald-light);">+ RD$ ${Number(am.amount).toLocaleString('es-DO')}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- ACTIONS -->
          <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="window.debtsModule.openEditDebtModal('${d.id}')">✏️ Editar Términos</button>
            <button class="btn btn-success btn-sm" onclick="window.debtsModule.openAmortizeModal('${d.id}')">💵 Registrar Abono</button>
            <button class="btn btn-danger btn-sm" onclick="window.debtsModule.deleteDebt('${d.id}')">🗑️ Eliminar</button>
          </div>
        </div>
      `;
    }).join('');
  }

  openNewDebtModal() {
    document.getElementById('debt-modal-title').textContent = 'Registrar Nueva Deuda y Acuerdo';
    document.getElementById('debt-form-id').value = '';
    document.getElementById('debt-creditor-input').value = '';
    document.getElementById('debt-phone-input').value = '';
    document.getElementById('debt-type-select').value = 'Entidad Bancaria / Tarjeta';
    document.getElementById('debt-priority-select').value = 'Alta';
    document.getElementById('debt-borrowed-input').value = '';
    document.getElementById('debt-owed-input').value = '';
    document.getElementById('debt-rate-input').value = '0% (Congelado)';
    document.getElementById('debt-freq-select').value = 'Mensual';
    document.getElementById('debt-due-input').value = '';
    document.getElementById('debt-agreement-input').value = '';

    const modal = document.getElementById('debt-modal');
    if (modal) modal.classList.add('active');
  }

  openEditDebtModal(debtId) {
    const state = window.appState.getState();
    const debt = (state.debts || []).find(d => d.id === debtId);
    if (!debt) return;

    document.getElementById('debt-modal-title').textContent = `Editar Deuda: ${debt.creditorName}`;
    document.getElementById('debt-form-id').value = debt.id;
    document.getElementById('debt-creditor-input').value = debt.creditorName || '';
    document.getElementById('debt-phone-input').value = debt.phone || '';
    document.getElementById('debt-type-select').value = debt.debtType || 'Entidad Bancaria / Tarjeta';
    document.getElementById('debt-priority-select').value = debt.priority || 'Alta';
    document.getElementById('debt-borrowed-input').value = debt.amountBorrowed || '';
    document.getElementById('debt-owed-input').value = debt.amountOwed || '';
    document.getElementById('debt-rate-input').value = debt.interestRate || '';
    document.getElementById('debt-freq-select').value = debt.paymentFrequency || 'Mensual';
    document.getElementById('debt-due-input').value = debt.nextDueDate || '';
    document.getElementById('debt-agreement-input').value = debt.agreementTerms || '';

    const modal = document.getElementById('debt-modal');
    if (modal) modal.classList.add('active');
  }

  closeDebtModal() {
    const modal = document.getElementById('debt-modal');
    if (modal) modal.classList.remove('active');
  }

  saveDebt() {
    const id = document.getElementById('debt-form-id').value;
    const creditorName = document.getElementById('debt-creditor-input').value.trim();
    const phone = document.getElementById('debt-phone-input').value.trim();
    const debtType = document.getElementById('debt-type-select').value;
    const priority = document.getElementById('debt-priority-select').value;
    const amountBorrowed = Number(document.getElementById('debt-borrowed-input').value);
    const amountOwed = Number(document.getElementById('debt-owed-input').value);
    const interestRate = document.getElementById('debt-rate-input').value.trim();
    const paymentFrequency = document.getElementById('debt-freq-select').value;
    const nextDueDate = document.getElementById('debt-due-input').value;
    const agreementTerms = document.getElementById('debt-agreement-input').value.trim();

    if (!creditorName || isNaN(amountBorrowed) || isNaN(amountOwed)) {
      window.appState.showToast('Por favor completa el nombre del acreedor y los montos en RD$.', 'warning');
      return;
    }

    const state = window.appState.getState();
    let debts = [...(state.debts || [])];

    if (id) {
      // Edit
      debts = debts.map(d => {
        if (d.id === id) {
          return {
            ...d,
            creditorName,
            phone,
            debtType,
            priority,
            amountBorrowed,
            amountOwed,
            interestRate,
            paymentFrequency,
            nextDueDate,
            agreementTerms,
            status: amountOwed === 0 ? 'Liquidada' : d.status
          };
        }
        return d;
      });
    } else {
      // Create
      const newDebt = {
        id: 'd-' + Date.now(),
        creditorName,
        phone,
        debtType,
        priority,
        amountBorrowed,
        amountOwed,
        interestRate,
        paymentFrequency,
        nextDueDate,
        agreementTerms,
        status: 'Al Día',
        amortizations: []
      };
      debts.push(newDebt);
    }

    window.appState.setState({ debts });
    this.closeDebtModal();
    this.renderDebtsList();
    this.renderFinancialSummary();
    window.appState.showToast('Deuda y acuerdo guardados exitosamente.', 'success');

    // Auto-sync
    if (window.googleAuth && window.googleAuth.accessToken) {
      window.googleAuth.triggerInitialSync();
    }
  }

  deleteDebt(debtId) {
    if (!confirm('¿Estás seguro de eliminar este registro de deuda?')) return;

    const state = window.appState.getState();
    const debts = (state.debts || []).filter(d => d.id !== debtId);

    window.appState.setState({ debts });
    this.renderDebtsList();
    this.renderFinancialSummary();
    window.appState.showToast('Deuda eliminada del inventario.', 'info');

    // Auto-sync
    if (window.googleAuth && window.googleAuth.accessToken) {
      window.googleAuth.triggerInitialSync();
    }
  }

  openAmortizeModal(debtId) {
    const state = window.appState.getState();
    const debt = (state.debts || []).find(d => d.id === debtId);
    if (!debt) return;

    document.getElementById('amortize-debt-id').value = debt.id;
    document.getElementById('amortize-creditor-name').textContent = debt.creditorName;
    document.getElementById('amortize-current-owed').textContent = `RD$ ${Number(debt.amountOwed).toLocaleString('es-DO')}`;
    document.getElementById('amortize-amount-input').value = '';
    document.getElementById('amortize-note-input').value = '';

    const modal = document.getElementById('amortize-modal');
    if (modal) modal.classList.add('active');
  }

  closeAmortizeModal() {
    const modal = document.getElementById('amortize-modal');
    if (modal) modal.classList.remove('active');
  }

  saveAmortization() {
    const debtId = document.getElementById('amortize-debt-id').value;
    const amount = Number(document.getElementById('amortize-amount-input').value);
    const note = document.getElementById('amortize-note-input').value.trim();

    if (isNaN(amount) || amount <= 0) {
      window.appState.showToast('Ingresa un monto de abono válido en RD$.', 'warning');
      return;
    }

    const state = window.appState.getState();
    const debts = (state.debts || []).map(d => {
      if (d.id === debtId) {
        const newOwed = Math.max(0, Number(d.amountOwed) - amount);
        const newAmortization = {
          id: 'am-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount: amount,
          note: note || 'Abono realizado por el Responsable Financiero'
        };
        return {
          ...d,
          amountOwed: newOwed,
          status: newOwed === 0 ? 'Liquidada' : 'Al Día',
          amortizations: [...(d.amortizations || []), newAmortization]
        };
      }
      return d;
    });

    window.appState.setState({ debts });
    this.closeAmortizeModal();
    this.renderDebtsList();
    this.renderFinancialSummary();
    window.appState.showToast('¡Abono registrado y saldo recalculado!', 'success');

    // Auto-sync
    if (window.googleAuth && window.googleAuth.accessToken) {
      window.googleAuth.triggerInitialSync();
    }
  }
}

window.debtsModule = new DebtsModule();
