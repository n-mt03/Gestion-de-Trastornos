/**
 * RUTA DE RECUPERACIÓN - SVG CHARTS UTILITY
 * Renders responsive vector charts for craving progression and debt paydown
 */

class ChartRenderer {
  /**
   * Renders a sleek linear curve chart for craving progression over time
   * @param {string} containerId ID of container element
   * @param {Array<{date: string, craving: number, mood: string}>} data 
   */
  renderCravingChart(containerId, data = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-muted);font-size:13px;">
          No hay suficientes registros de check-in aún para graficar la evolución.
        </div>`;
      return;
    }

    const width = container.clientWidth || 500;
    const height = 180;
    const padX = 40;
    const padY = 25;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const maxVal = 10;
    const minVal = 0;
    const pointsCount = data.length;

    // Build SVG points
    const points = data.map((d, i) => {
      const x = padX + (i / Math.max(1, pointsCount - 1)) * chartW;
      const y = padY + chartH - (d.craving / maxVal) * chartH;
      return { x, y, ...d };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Smooth cubic bezier curve
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 2;
      const cpy1 = prev.y;
      const cpx2 = prev.x + (curr.x - prev.x) / 2;
      const cpy2 = curr.y;
      pathD += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

    // Horizontal gridlines
    let gridLines = '';
    [0, 2.5, 5, 7.5, 10].forEach(val => {
      const y = padY + chartH - (val / maxVal) * chartH;
      gridLines += `
        <line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3,3" />
        <text x="${padX - 8}" y="${y + 3.5}" fill="var(--text-dim)" font-size="9" text-anchor="end" font-family="sans-serif">${val}</text>
      `;
    });

    // Circles and tooltips
    let circles = '';
    points.forEach((p, idx) => {
      const color = p.craving >= 7 ? '#ef4444' : p.craving >= 4 ? '#f59e0b' : '#10b981';
      circles += `
        <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="${color}" stroke="#0f172a" stroke-width="2">
          <title>${p.date}: Deseo ${p.craving}/10 (${p.mood || 'Normal'})</title>
        </circle>
        <text x="${p.x}" y="${height - 8}" fill="var(--text-dim)" font-size="8.5" text-anchor="middle" font-family="sans-serif">
          ${p.date ? p.date.split('T')[0].substring(5) : `D${idx+1}`}
        </text>
      `;
    });

    container.innerHTML = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible;">
        <defs>
          <linearGradient id="cravingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaD}" fill="url(#cravingGrad)" />
        <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${circles}
      </svg>
    `;
  }

  /**
   * Renders Debt reduction donut / progress
   */
  renderDebtProgress(containerId, totalOriginal, totalCurrent) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const paid = Math.max(0, totalOriginal - totalCurrent);
    const pct = totalOriginal > 0 ? Math.round((paid / totalOriginal) * 100) : 100;

    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:18px;">
        <div style="position:relative;width:90px;height:90px;flex-shrink:0;">
          <svg viewBox="0 0 36 36" style="width:100%;height:100%;transform:rotate(-90deg);">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3.8"/>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" stroke-width="3.8" stroke-dasharray="${pct}, 100" stroke-linecap="round"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="font-size:16px;font-weight:800;color:#ffffff;line-height:1;">${pct}%</span>
            <span style="font-size:8.5px;color:var(--recovery-emerald-light);font-weight:700;">SALDADO</span>
          </div>
        </div>
        <div style="flex:1;">
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Deuda Inicial Documentada: <b style="color:#ffffff;">$${totalOriginal.toLocaleString()}</b></div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">Saldo Pendiente Actual: <b style="color:#f87171;">$${totalCurrent.toLocaleString()}</b></div>
          <div style="font-size:13px;font-weight:700;color:#34d399;">Total Amortizado: $${paid.toLocaleString()}</div>
        </div>
      </div>
    `;
  }
}

window.chartRenderer = new ChartRenderer();
