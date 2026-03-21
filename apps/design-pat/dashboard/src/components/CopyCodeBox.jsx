import { useState } from 'react';

export default function CopyCodeBox({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="copy-code-box">
      <pre className="copy-code-content">{code}</pre>
      <button className="copy-code-btn" onClick={handleCopy} title="Copy to clipboard">
        {copied ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
  );
}
