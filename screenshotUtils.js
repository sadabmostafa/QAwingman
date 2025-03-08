// screenshotUtils.js

// Function to capture a screenshot and save it
export function captureScreenshotAndSave() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Error capturing screenshot:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        try {
          saveScreenshot(dataUrl);
          resolve(dataUrl); // Resolve with the data URL for further use
        } catch (error) {
          console.error("Error saving screenshot:", error);
          reject(error);
        }
      }
    });
  });
}

// Function to save the screenshot as a file
function saveScreenshot(dataUrl) {
  try {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `screenshot_${Date.now()}.png`;
    link.click();
    console.log("Screenshot saved successfully.");
  } catch (error) {
    console.error("Error saving screenshot:", error);
    throw error; // Propagate the error for handling in the caller
  }
}