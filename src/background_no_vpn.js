chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translateSelection",
    title: "翻译选中文本",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateSelection") {
    const text = info.selectionText;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/content.js']
    }).then(() => {
      translateText(text, tab.id);
    }).catch(err => console.error('Failed to inject content script:', err));
  }
});

async function translateText(text, tabId) {
  try {
    const response = await fetch(`https://lingva.ml/api/v1/auto/zh/${encodeURIComponent(text)}`);
    const result = await response.json();
    const translation = result.translation;
    
    chrome.tabs.sendMessage(tabId, {
      type: 'showTranslation',
      translation: translation
    });
  } catch (error) {
    console.error('Translation failed:', error);
    // 备用翻译服务
    try {
      const response = await fetch('https://translate.volcengine.com/web/pc/translate/v1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://translate.volcengine.com'
        },
        body: JSON.stringify({
          text: text,
          source_language: 'detect',
          target_language: 'zh'
        })
      });
      const result = await response.json();
      const translation = result.translation;
      
      chrome.tabs.sendMessage(tabId, {
        type: 'showTranslation',
        translation: translation
      });
    } catch (backupError) {
      console.error('Backup translation failed:', backupError);
    }
  }
}