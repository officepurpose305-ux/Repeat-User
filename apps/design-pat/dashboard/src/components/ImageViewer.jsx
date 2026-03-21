import { useState, useRef } from 'react';

const TABS = [
  { id: 'figma', label: 'Figma Design', key: 'figma' },
  { id: 'screenshot', label: 'Screenshot', key: 'screenshot' },
  { id: 'annotated', label: 'Annotated', key: 'annotated' },
  { id: 'diff', label: 'Diff', key: 'diff' },
];

export default function ImageViewer({ report, selectedRegionId, onRegionClick }) {
  const [activeTab, setActiveTab] = useState('annotated');
  const imgRef = useRef(null);

  const handleImageClick = (e) => {
    if (activeTab !== 'annotated' || !report.regions) return;

    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Scale to natural image dimensions
    const naturalX = (clickX / rect.width) * rect.width;
    const naturalY = (clickY / rect.height) * rect.height;

    // Find which region was clicked
    for (let i = 0; i < report.regions.length; i++) {
      const region = report.regions[i];
      const bounds = region.bounds;

      if (
        naturalX >= bounds.x &&
        naturalX <= bounds.x + bounds.width &&
        naturalY >= bounds.y &&
        naturalY <= bounds.y + bounds.height
      ) {
        onRegionClick(i);
        return;
      }
    }
  };

  const activeTabFile = TABS.find((t) => t.id === activeTab);
  const imageSrc = activeTabFile ? report.files[activeTabFile.key] : report.files.annotated;

  return (
    <div className="image-viewer">
      <div className="image-viewer-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`image-viewer-tab ${activeTab === tab.id ? 'image-viewer-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="image-viewer-container">
        <img
          ref={imgRef}
          src={imageSrc}
          alt={activeTabFile?.label || 'Screenshot'}
          className={`image-viewer-img ${activeTab === 'annotated' ? 'image-viewer-clickable' : ''}`}
          onClick={handleImageClick}
        />
      </div>
    </div>
  );
}
