import { useState, useEffect } from 'react';
import { useReports } from './hooks/useReports.js';
import ConfigPanel from './components/ConfigPanel.jsx';
import ComparisonView from './components/ComparisonView.jsx';

export default function App() {
  const { summary, reports, fetchScreen, loading, error } = useReports();
  const [selectedScreenId, setSelectedScreenId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Check if this is a shared view (read-only mode)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewMode = params.get('view') === 'shared';
    setIsViewOnly(viewMode);
  }, []);

  // Auto-select first screen when summary loads
  useEffect(() => {
    if (summary?.screens?.[0]) {
      const firstScreenId = summary.screens[0].id;
      setSelectedScreenId(firstScreenId);
      fetchScreen(firstScreenId);
    }
  }, [summary, fetchScreen]);

  // Generate shareable link
  const handleShare = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shared = `${baseUrl}?view=shared`;
    setShareUrl(shared);
    setShowShareModal(true);
  };

  // Copy share link to clipboard
  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('✅ Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('❌ Failed to copy link');
    }
  };

  const handleRunComparison = async (config) => {
    setIsRunning(true);
    try {
      console.log('Running comparison with config:', config);

      // Build FormData for file uploads
      const formData = new FormData();

      // Add screenshot files only to FormData
      config.screenshots.forEach((screenshot, idx) => {
        if (screenshot.file) {
          formData.append(`screenshots[]`, screenshot.file);
        }
      });

      // Build URL with query parameters for text data
      const screenshotsJson = JSON.stringify(
        config.screenshots.map(s => ({
          id: s.id,
          name: s.name,
        }))
      );
      const queryParams = new URLSearchParams({
        figmaLink: config.figmaLink,
        figmaFileId: config.figmaFileId,
        screenshotsJson: screenshotsJson,
      });

      // Add optional Figma token
      if (config.figmaToken) {
        queryParams.append('figmaToken', config.figmaToken);
      }

      const url = `/api/run-comparison?${queryParams.toString()}`;

      console.log('Sending request to /api/run-comparison');
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `API error: ${response.statusText}`);
      }

      if (result.success) {
        console.log('Comparison completed:', result);
        alert(`✅ Comparison complete!\n${result.message}`);

        // Wait a moment for files to be written, then reload
        await new Promise(r => setTimeout(r, 1000));
        window.location.reload();
      } else {
        throw new Error(result.error || 'Comparison failed');
      }
    } catch (err) {
      console.error('Error running comparison:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return <div className="app-loading">Loading reports...</div>;
  }

  if (!summary) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="app-header-content">
            <h1>🎯 Design PAT Dashboard</h1>
            <p>Compare Figma Design vs App Build</p>
          </div>
          {!isViewOnly && <ConfigPanel onRun={handleRunComparison} isRunning={isRunning} />}
        </header>
        <div className="app-error">
          <p>📋 No comparisons yet.</p>
          {!isViewOnly && (
            <>
              <p>1. Paste your public Figma file link</p>
              <p>2. Upload screenshots from your build</p>
              <p>3. Click "Start Comparison"</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const selectedReport = selectedScreenId ? reports[selectedScreenId] : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <h1>🎯 Design PAT Dashboard</h1>
          <p>Compare Figma Design vs App Build</p>
          {isViewOnly && <span className="view-only-badge">📋 View Only</span>}
        </div>
        <div className="header-actions">
          {!isViewOnly && <ConfigPanel onRun={handleRunComparison} isRunning={isRunning} />}
          {summary && !isViewOnly && (
            <button className="share-btn" onClick={handleShare}>
              📤 Share with team
            </button>
          )}
        </div>
      </header>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📤 Share Dashboard</h2>
              <button className="modal-close" onClick={() => setShowShareModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Share this link with your tech team for read-only access:</p>
              <div className="share-link-box">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-link-input"
                />
                <button className="copy-btn" onClick={handleCopyShareLink}>
                  📋 Copy
                </button>
              </div>
              <p className="share-note">🔒 Read-only access: Team can only view Figma, annotations, and recommendations.</p>
            </div>
          </div>
        </div>
      )}

      {error && <div className="app-error">Error: {error}</div>}

      {summary?.screens && summary.screens.length > 0 && (
        <div className="screen-tabs">
          {summary.screens.map((screen) => (
            <button
              key={screen.id}
              className={`screen-tab ${selectedScreenId === screen.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedScreenId(screen.id);
                fetchScreen(screen.id);
              }}
            >
              {screen.name}
              <span className={`screen-badge ${screen.passed ? 'passed' : 'failed'}`}>
                {screen.accuracy.toFixed(1)}%
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedReport ? (
        <ComparisonView report={selectedReport} />
      ) : (
        <div className="app-empty">
          {summary?.screens?.length > 0 ? (
            <p>Select a comparison above to view details</p>
          ) : (
            <p>No comparisons available</p>
          )}
        </div>
      )}
    </div>
  );
}
