var tooltip = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'showTranslation') {
    showTooltip(message.translation);
  }
});

function showTooltip(text) {
  if (tooltip) {
    document.body.removeChild(tooltip);
  }

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: fixed;
    top: ${rect.bottom + window.scrollY + 5}px;
    left: ${rect.left + window.scrollX}px;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  tooltip.textContent = text;

  document.body.appendChild(tooltip);

  setTimeout(() => {
    if (tooltip) {
      document.body.removeChild(tooltip);
      tooltip = null;
    }
  }, 3000);
}