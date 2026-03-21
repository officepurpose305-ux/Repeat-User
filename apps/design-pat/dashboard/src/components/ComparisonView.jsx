import { useState, useRef, useEffect } from 'react';
import SeverityBadge from './SeverityBadge.jsx';
import CopyCodeBox from './CopyCodeBox.jsx';
import '../styles/comparison-view.css';

export default function ComparisonView({ report }) {
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const screenshotRef = useRef(null);
  const issuesRef = useRef({});

  // Filter issues by severity and add region ID mapping
  const filteredIssues = report.allIssues.map((issue, idx) => ({
    ...issue,
    regionId: idx,
  })).filter((issue) => {
    if (severityFilter === 'all') return true;
    return issue.severity === severityFilter;
  });

  // Handle click on annotated screenshot
  const handleScreenshotClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (e.currentTarget.naturalWidth / rect.width);
    const y = (e.clientY - rect.top) * (e.currentTarget.naturalHeight / rect.height);

    // Find which region was clicked
    for (let region of report.regions) {
      const bounds = region.bounds;
      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      ) {
        setSelectedRegionId(region.id);
        // Scroll to matching issue
        if (issuesRef.current[region.id]) {
          issuesRef.current[region.id].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
  };

  // Scroll to issue when selectedRegionId changes
  useEffect(() => {
    if (selectedRegionId !== null && issuesRef.current[selectedRegionId]) {
      issuesRef.current[selectedRegionId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedRegionId]);

  return (
    <div className="comparison-view">
      {/* Left: Figma Design */}
      <div className="comparison-panel comparison-figma">
        <h3>📐 Figma Design</h3>
        <div className="comparison-image-container">
          <img
            src={report.files.figma}
            alt="Figma design"
            className="comparison-image"
          />
        </div>
      </div>

      {/* Center: Screenshot with Overlay */}
      <div className="comparison-panel comparison-screenshot">
        <h3>📱 App Screenshot (with Issues)</h3>
        <div className="comparison-image-container">
          <img
            src={report.files.annotated}
            alt="Screenshot with annotations"
            className="comparison-image clickable"
            onClick={handleScreenshotClick}
            ref={screenshotRef}
            title="Click on any issue to highlight it in the list"
          />
        </div>
        <p className="comparison-hint">💡 Click on any highlighted area to jump to that issue</p>
      </div>

      {/* Right: Issues List */}
      <div className="comparison-panel comparison-issues">
        <div className="issues-header">
          <h3>📋 Issues ({report.allIssues.length})</h3>
          <div className="severity-filter">
            <button
              className={`filter-btn ${severityFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${severityFilter === 'high' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('high')}
            >
              🔴 High
            </button>
            <button
              className={`filter-btn ${severityFilter === 'medium' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('medium')}
            >
              🟠 Medium
            </button>
            <button
              className={`filter-btn ${severityFilter === 'low' ? 'active' : ''}`}
              onClick={() => setSeverityFilter('low')}
            >
              🔵 Low
            </button>
          </div>
        </div>

        <div className="issues-list">
          {filteredIssues.length === 0 ? (
            <div className="issues-empty">No issues found</div>
          ) : (
            filteredIssues.map((issue, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  if (el && issue.regionId !== undefined) {
                    issuesRef.current[issue.regionId] = el;
                  }
                }}
                className={`issue-row ${selectedRegionId === issue.regionId ? 'selected' : ''}`}
                onClick={() => setSelectedRegionId(issue.regionId)}
              >
                <div className="issue-header">
                  <SeverityBadge severity={issue.severity} />
                  <span className="issue-type">{issue.type}</span>
                </div>
                <div className="issue-selector">{issue.element}</div>
                <p className="issue-description">{issue.description}</p>
                {issue.cssFix && (
                  <CopyCodeBox code={issue.cssFix} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
