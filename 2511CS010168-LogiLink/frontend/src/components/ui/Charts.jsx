export function LineChart({ data }) {
  const items = Array.isArray(data) && data.length > 0 ? data : [];
  const width = 620;
  const height = 240;
  const padding = 36;
  const rawValues = items.flatMap((item) => [Number(item.delivered) || 0, Number(item.inTransit) || 0, Number(item.delayed) || 0]);
  const maxValue = rawValues.length > 0 ? Math.max(...rawValues) : 0;
  const hasActivity = maxValue > 0;
  const max = hasActivity ? Math.max(maxValue, 3) : 1;
  const xStep = items.length > 1 ? (width - padding * 2) / (items.length - 1) : 0;
  const pointX = (index) => padding + index * xStep;
  const pointY = (value) => height - padding - ((Number(value) || 0) / max) * (height - padding * 2);
  const point = (value, index) => `${pointX(index)},${pointY(value)}`;
  const path = (key) => items.map((item, index) => `${index === 0 ? 'M' : 'L'} ${point(item[key], index)}`).join(' ');

  return (
    <svg className="chart-line" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Shipment performance chart">
      {[0, 1, 2, 3].map((line) => (
        <line key={line} x1={padding} x2={width - padding} y1={padding + line * 48} y2={padding + line * 48} stroke="#f1f5f9" strokeDasharray="3 3" />
      ))}
      {hasActivity && (
        <>
          <path d={path('delivered')} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
          <path d={path('inTransit')} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
          <path d={path('delayed')} fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />

          {/* Dots on data points */}
          {items.map((item, index) => (
            <g key={index}>
              <circle cx={pointX(index)} cy={pointY(item.delivered)} r="4" fill="#16a34a" stroke="#ffffff" strokeWidth="2">
                <title>{`${item.day}: ${item.delivered || 0} Delivered`}</title>
              </circle>
              <circle cx={pointX(index)} cy={pointY(item.inTransit)} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2">
                <title>{`${item.day}: ${item.inTransit || 0} In Transit`}</title>
              </circle>
              <circle cx={pointX(index)} cy={pointY(item.delayed)} r="4" fill="#d97706" stroke="#ffffff" strokeWidth="2">
                <title>{`${item.day}: ${item.delayed || 0} Delayed`}</title>
              </circle>
            </g>
          ))}
        </>
      )}
      {items.map((item, index) => (
        <text key={item.day || index} x={pointX(index)} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="500">
          {item.day}
        </text>
      ))}
      {!hasActivity && (
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="#64748b" fontSize="13">
          No shipment activity in this period
        </text>
      )}
    </svg>
  );
}

export function ProgressBars({ data, color = '#2563eb' }) {
  return (
    <div>
      {data.map((item) => (
        <div className="bar-row" key={item.label}>
          <span>{item.label}</span>
          <div className="bar-track" aria-label={`${item.label} ${item.value}%`}>
            <div className="bar-fill" style={{ width: `${item.value}%`, background: item.color || color }} />
          </div>
          <strong>{item.value}%</strong>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ data }) {
  let start = 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const gradient = data
    .map((item) => {
      const end = start + (item.value / total) * 100;
      const segment = `${item.color} ${start}% ${end}%`;
      start = end;
      return segment;
    })
    .join(', ');

  return (
    <>
      <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="donut-center">
          <span>
            <strong>{total}</strong>
            Loads
          </span>
        </div>
      </div>
      <div className="legend">
        {data.map((item) => (
          <div className="legend-item" key={item.label}>
            <span className="legend-key"><span className="swatch" style={{ background: item.color }} />{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
