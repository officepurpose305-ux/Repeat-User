const severityConfig = {
  high: { label: 'High', color: '#ef4444' },
  medium: { label: 'Medium', color: '#f59e0b' },
  low: { label: 'Low', color: '#3b82f6' },
};

export default function SeverityBadge({ severity }) {
  const config = severityConfig[severity] || severityConfig.low;

  return (
    <span
      className="severity-badge"
      style={{ backgroundColor: config.color }}
      title={`${config.label} severity`}
    >
      {config.label}
    </span>
  );
}
