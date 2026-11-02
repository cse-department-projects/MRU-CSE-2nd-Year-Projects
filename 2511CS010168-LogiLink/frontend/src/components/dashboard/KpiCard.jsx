import Card from '../ui/Card.jsx';

export default function KpiCard({ icon: Icon, label, value, trend, trendDirection = 'up', support }) {
  return (
    <Card className="metric-card">
      <div className="metric-top">
        <div className="metric-icon">
          <Icon size={22} />
        </div>
      </div>
      <p className="metric-label">{label}</p>
      <h3 className="metric-value">{value}</h3>
      <div className="metric-foot">
        <span className={`trend ${trendDirection}`}>{trend}</span>
        <span>{support}</span>
      </div>
    </Card>
  );
}
