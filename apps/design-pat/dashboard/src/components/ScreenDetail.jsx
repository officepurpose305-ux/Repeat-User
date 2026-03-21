import { useState } from 'react';
import ImageViewer from './ImageViewer.jsx';
import IssueList from './IssueList.jsx';

export default function ScreenDetail({ report, selectedRegionId, onRegionClick }) {
  const [severityFilter, setSeverityFilter] = useState('all');

  return (
    <div className="screen-detail">
      <div className="screen-detail-header">
        <div>
          <h2>{report.screenName}</h2>
          <p className="screen-detail-meta">
            Accuracy: {report.accuracy.toFixed(2)}% ({report.mismatchPixels.toLocaleString()} / {report.totalPixels.toLocaleString()} pixels)
          </p>
        </div>
        <div className={`screen-detail-status ${report.passed ? 'screen-detail-passed' : 'screen-detail-failed'}`}>
          {report.passed ? '✓ PASS' : '✗ FAIL'}
        </div>
      </div>

      <div className="screen-detail-content">
        <div className="screen-detail-viewer">
          <ImageViewer
            report={report}
            selectedRegionId={selectedRegionId}
            onRegionClick={onRegionClick}
          />
        </div>

        <div className="screen-detail-issues">
          <div className="issues-header">
            <h3>Issues ({report.allIssues.length})</h3>
            <div className="severity-filter">
              {['all', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  className={`severity-filter-btn ${severityFilter === sev ? 'severity-filter-active' : ''}`}
                  onClick={() => setSeverityFilter(sev)}
                >
                  {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <IssueList
            issues={report.allIssues}
            severityFilter={severityFilter}
            selectedRegionId={selectedRegionId}
          />
        </div>
      </div>
    </div>
  );
}
