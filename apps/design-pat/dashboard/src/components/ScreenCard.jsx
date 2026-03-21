export default function ScreenCard({ screen, isSelected, onSelect }) {
  return (
    <button
      className={`screen-card ${isSelected ? 'screen-card-active' : ''}`}
      onClick={onSelect}
    >
      <div className="screen-card-header">
        <h3>{screen.name}</h3>
        <span className={`screen-card-badge ${screen.passed ? 'screen-card-passed' : 'screen-card-failed'}`}>
          {screen.passed ? '✓ PASS' : '✗ FAIL'}
        </span>
      </div>
      <div className="screen-card-footer">
        <span className="screen-card-accuracy">{screen.accuracy.toFixed(1)}%</span>
        <span className="screen-card-issues">{screen.issueCount} issue{screen.issueCount !== 1 ? 's' : ''}</span>
      </div>
    </button>
  );
}
