import SeverityBadge from './SeverityBadge.jsx';
import CopyCodeBox from './CopyCodeBox.jsx';

export default function IssueRow({ issue, isSelected, dataRegionId }) {
  return (
    <div
      className={`issue-row ${isSelected ? 'issue-row-selected' : ''}`}
      data-region-id={dataRegionId}
      tabIndex={0}
    >
      <div className="issue-row-header">
        <SeverityBadge severity={issue.severity} />
        <span className="issue-row-type">{issue.type.replace(/-/g, ' ')}</span>
        <span className="issue-row-element">{issue.element}</span>
      </div>

      <p className="issue-row-description">{issue.description}</p>

      <CopyCodeBox code={issue.cssFix} />
    </div>
  );
}
