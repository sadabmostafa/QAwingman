// screenshot.js
let lastScreenshot = "";

export function initializeScreenshot() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "capture") {
      chrome.tabs.captureVisibleTab(null, { format: "png" }, function(dataUrl) {
        lastScreenshot = dataUrl;
        chrome.downloads.download({
          url: dataUrl,
          filename: 'screenshot.png',
          saveAs: false
        });
        sendResponse({ screenshot: dataUrl });
      });
      return true;
    }

    if (message.command === "getStepsAndScreenshot") {
      sendResponse({ steps: oldlogs, screenshot: lastScreenshot });
    }
  });
}