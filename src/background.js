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
    // Ensure content script is loaded before sending message
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
    // 使用 Google Translate 非官方 API
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`);
    
    const result = await response.json();
    const translation = result[0][0][0];
    
    chrome.tabs.sendMessage(tabId, {
      type: 'showTranslation',
      translation: translation
    });
  } catch (error) {
    console.error('Translation failed:', error);
  }
}