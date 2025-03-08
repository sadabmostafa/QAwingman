// background/screenshot.js
import { captureScreenshotAndSave } from './screenshotUtils.js';

let lastScreenshot = '';

// Function to capture a screenshot
export function captureScreenshot() {
  return new Promise((resolve, reject) => {
    captureScreenshotAndSave()
      .then((dataUrl) => {
        lastScreenshot = dataUrl;
        resolve(dataUrl);
      })
      .catch((error) => {
        console.error('Error capturing screenshot:', error);
        reject(error);
      });
  });
}

// Function to save the screenshot
export function saveScreenshot(dataUrl) {
  try {
    chrome.downloads.download({
      url: dataUrl,
      filename: 'screenshot.png',
      saveAs: false,
    });
    console.log('Screenshot saved successfully.');
  } catch (error) {
    console.error('Error saving screenshot:', error);
    throw error;
  }
}

// Function to get the last captured screenshot
export function getLastScreenshot() {
  try {
    return lastScreenshot;
  } catch (error) {
    console.error('Error retrieving last screenshot:', error);
    throw error;
  }
}