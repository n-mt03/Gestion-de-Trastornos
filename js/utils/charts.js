/**
 * RUTA DE RECUPERACIÓN - CHARTS & VECTOR VISUALIZATIONS
 * Pure SVG vector charting for Craving trends and Debt amortization progress (DOP / RD$)
 */

class ChartRenderer {
  /**
   * Renders the Craving Trend Area Chart (0-10) with bezier curves
   */
  renderCravingTrend(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px;">No hay registros de deseo aún. Realiza tu primer check-in.</div>';
      return;
    }

    const width = 500;
    const height = 180;
    const padX = 35;
    const padY = 25;

    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const maxPoints = Math.min(14, data.length);
    const slice = data.slice(-maxPoints);

    const stepX = slice.length > 1 ? chartW / (slice.length - 1) : chartW;

    const points = slice.map((d, i) => {
      const x = padX + i * stepX;
      const craving = Math.max(0, Math.min(10, Number(d.craving || 0)));
      const y = height - padY - (craving / 10) * chartH;
      return { x, y, craving, date: d.date, mood: d.mood };
    });

    if (points.length === 1) {
      points.push({ ...points[0], x: padX + chartW });
    }

    // Build smooth SVG path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpx1 = curr.x + (next.x - curr.x) / 2;
      const cpy1 = curr.y;
      const cpx2 = curr.x + (next.x - curr.x) / 2;
      const cpy2 = next.y;
      pathD += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${next.x} ${next.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

    // Horizontal grid lines (0, 5, 10)
    const gridLines = [0, 5, 10].map(val => {
      const y = height - padY - (val / 10) * chartH;
      return `
        <line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3,3" />
        <text x="${padX - 8}" y="${y + 3.5}" fill="var(--text-dim)" font-size="9" text-anchor="end" font-family="sans-serif">${val}</text>
      `;
    }).join('');

    // Data points
    const circles = points.map((p, idx) => {
      const color = p.craving <= 3 ? '#10b981' : p.craving <= 6 ? '#f59e0b' : '#ef4444';
      return `
        <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="${color}" stroke="#0f172a" stroke-width="2">
          <title>${p.date ? p.date.split('T')[0] : ''}: Deseo ${p.craving}/10 (${p.mood || 'Normal'})</title>
        </circle>
        <text x="${p.x}" y="${height - 8}" fill="var(--text-dim)" font-size="8.5" text-anchor="middle" font-family="sans-serif">
          ${p.date ? p.date.split('T')[0].substring(5) : `D${idx+1}`}
        </text>
      `;
    }).join('');

    container.innerHTML = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible;">
        <defs>
          <linearGradient id="cravingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0" />
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
   * Renders the Donut Progress Chart for Debt Saneamiento in Pesos Dominicanos (RD$)
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
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Deuda Inicial Documentada: <b style="color:#ffffff;">RD$ ${totalOriginal.toLocaleString('es-DO')}</b></div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">Saldo Pendiente Actual: <b style="color:#f87171;">RD$ ${totalCurrent.toLocaleString('es-DO')}</b></div>
          <div style="font-size:13px;font-weight:700;color:#34d399;">Total Amortizado: RD$ ${paid.toLocaleString('es-DO')}</div>
        </div>
      </div>
    `;
  }
}

window.chartRenderer = new ChartRenderer();
