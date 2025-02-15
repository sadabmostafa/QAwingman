// screenshotUtils.js
export function captureScreenshotAndSave() {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      console.error("Error capturing screenshot:", chrome.runtime.lastError);
      return;
    }
    saveScreenshot(dataUrl);
  });
}

function saveScreenshot(dataUrl) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `screenshot_${Date.now()}.png`;
  link.click();
}
