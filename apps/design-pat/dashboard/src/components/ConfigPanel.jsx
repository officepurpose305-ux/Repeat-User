import { useState } from 'react';
import '../styles/config-panel.css';

export default function ConfigPanel({ onRun, isRunning }) {
  const [figmaLink, setFigmaLink] = useState(localStorage.getItem('figmaLink') || '');
  const [figmaToken, setFigmaToken] = useState(localStorage.getItem('figmaToken') || '');
  const [screenshots, setScreenshots] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleScreenshotAdd = (event) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setScreenshots((prev) => [
            ...prev,
            {
              id: Math.random(),
              name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
              file,
              preview: e.target.result,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleScreenshotRemove = (id) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRun = () => {
    if (!figmaLink.trim()) {
      alert('Please enter a Figma file link');
      return;
    }

    if (screenshots.length === 0) {
      alert('Please upload at least one screenshot');
      return;
    }

    // Save to localStorage
    localStorage.setItem('figmaLink', figmaLink);
    localStorage.setItem('figmaToken', figmaToken);

    // Extract file ID from Figma link (supports /file/, /design/, /proto/)
    const fileIdMatch = figmaLink.match(/\/(file|design|proto)\/([a-zA-Z0-9]+)/);
    const fileId = fileIdMatch ? fileIdMatch[2] : null;

    if (!fileId) {
      alert('Invalid Figma link. Please use a link like:\n• figma.com/file/ABC123/page\n• figma.com/design/ABC123/page');
      return;
    }

    const config = {
      figmaFileId: fileId,
      figmaLink,
      figmaToken: figmaToken || undefined,
      screenshots: screenshots.map((s) => ({
        id: `screenshot-${s.id}`,
        name: s.name,
        file: s.file,
      })),
    };

    onRun(config);
  };

  const isComplete = figmaLink.trim() && screenshots.length > 0;

  return (
    <div className={`config-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="config-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        ⚙️ {isExpanded ? 'Hide' : 'Show'} Configuration
      </button>

      {isExpanded && (
        <div className="config-content">
          <h3>Design vs Build Comparison</h3>

          {/* Figma Link */}
          <div className="config-section">
            <div className="config-section-title">📐 Figma Design File</div>

            <div className="config-group">
              <label htmlFor="figmaLink">Figma File Link *</label>
              <input
                id="figmaLink"
                type="url"
                placeholder="e.g., https://figma.com/file/ABC123XYZ/Your-Design"
                value={figmaLink}
                onChange={(e) => setFigmaLink(e.target.value)}
              />
              <span className="config-hint">
                Paste a public Figma link. Make sure the file is shared/public so the tool can access it.
              </span>
            </div>

            <div className="config-group">
              <label htmlFor="figmaToken">Figma API Token (Optional)</label>
              <input
                id="figmaToken"
                type="password"
                placeholder="figd_xxxxxxxxxxxx"
                value={figmaToken}
                onChange={(e) => setFigmaToken(e.target.value)}
              />
              <span className="config-hint">
                Get your token from <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noreferrer">Figma API settings</a>. Allows access to private files.
              </span>
            </div>
          </div>

          {/* Screenshots */}
          <div className="config-section">
            <div className="config-section-title">📸 Build Screenshots ({screenshots.length})</div>

            {screenshots.length > 0 && (
              <div className="screenshots-grid">
                {screenshots.map((screenshot) => (
                  <div key={screenshot.id} className="screenshot-card">
                    <img src={screenshot.preview} alt={screenshot.name} />
                    <div className="screenshot-info">
                      <div className="screenshot-name">{screenshot.name}</div>
                      <button
                        className="remove-screenshot-btn"
                        onClick={() => handleScreenshotRemove(screenshot.id)}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="screenshot-upload-btn">
              + Add Screenshots
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleScreenshotAdd}
                style={{ display: 'none' }}
              />
            </label>
            <span className="config-hint">
              Upload PNG/JPG screenshots from your build. Names should match Figma frame names (e.g., "Homepage.png").
            </span>
          </div>

          <div className="config-actions">
            <button
              className={`config-run-btn ${isComplete ? '' : 'disabled'}`}
              onClick={handleRun}
              disabled={!isComplete || isRunning}
            >
              {isRunning ? '⏳ Comparing...' : '▶️ Start Comparison'}
            </button>
            {!isComplete && (
              <span className="config-warning">
                {!figmaLink ? 'Add Figma link' : 'Add screenshots'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
