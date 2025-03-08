// background/screenshot.js
let lastScreenshot = '';

export function captureScreenshot() {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          lastScreenshot = dataUrl;
          resolve(dataUrl);
        }
      });
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      reject(error);
    }
  });
}

export function saveScreenshot(dataUrl) {
  try {
    chrome.downloads.download({
      url: dataUrl,
      filename: 'screenshot.png',
      saveAs: false,
    });
  } catch (error) {
    console.error('Error saving screenshot:', error);
    throw error;
  }
}

export function getLastScreenshot() {
  try {
    return lastScreenshot;
  } catch (error) {
    console.error('Error retrieving last screenshot:', error);
    throw error;
  }
}