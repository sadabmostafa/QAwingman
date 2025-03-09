// contextMenu.js
export function initializeContextMenu() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: "myCustomOption",
        title: "Take Screenshot",
        contexts: ["page", "selection", "link", "image"],
      });
    });
  
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === "myCustomOption") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, function(dataUrl) {
          chrome.downloads.download({
            url: dataUrl,
            filename: 'screenshot.png',
            saveAs: false
          });
        });
      }
    });
  }