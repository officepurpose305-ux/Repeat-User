import { useEffect, useRef } from 'react';
import IssueRow from './IssueRow.jsx';

export default function IssueList({ issues, severityFilter, selectedRegionId }) {
  const listRef = useRef(null);

  const filteredIssues = issues.filter((issue) => {
    if (severityFilter === 'all') return true;
    return issue.severity === severityFilter;
  });

  // Scroll to selected issue when regionId changes
  useEffect(() => {
    if (selectedRegionId !== null) {
      const el = listRef.current?.querySelector(`[data-region-id="${selectedRegionId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        el.focus();
      }
    }
  }, [selectedRegionId]);

  return (
    <div className="issue-list" ref={listRef}>
      {filteredIssues.length === 0 ? (
        <div className="issue-list-empty">No issues found</div>
      ) : (
        filteredIssues.map((issue, idx) => (
          <IssueRow
            key={idx}
            issue={issue}
            isSelected={selectedRegionId === idx}
            dataRegionId={idx}
          />
        ))
      )}
    </div>
  );
}
