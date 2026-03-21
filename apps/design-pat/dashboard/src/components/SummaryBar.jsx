export default function SummaryBar({ summary }) {
  return (
    <div className="summary-bar">
      <div className="summary-bar-content">
        <div className="summary-stat">
          <span className="summary-label">Total Screens</span>
          <span className="summary-value">{summary.totalScreens}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Passed</span>
          <span className="summary-value summary-value-passed">{summary.passed}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Failed</span>
          <span className="summary-value summary-value-failed">{summary.failed}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Overall Accuracy</span>
          <span className="summary-value summary-value-accuracy">{summary.overallAccuracy.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
