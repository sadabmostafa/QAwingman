// background/messageHandler.js
import { logClick, logInput, clearLogs, clearOldData, getLogs, getOldLogs } from './logging.js';
import { captureScreenshot, getLastScreenshot } from './screenshot.js';
import { generateChecklist, generateBugTitle } from './aiIntegration.js';
import { generateStepsToReproduce } from './stepsGenerator.js';

let x = false;

export function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.action || message.command) {
      case 'logClick':
        if (x && message.data) {
          logClick(message.data);
        }
        break;

      case 'captureScreenshot':
        captureScreenshot()
          .then((dataUrl) => {
            sendResponse({ screenshot: dataUrl });
          })
          .catch((error) => {
            sendResponse({ error: error.message });
          });
        return true;

      case 'getStepsAndScreenshot':
        sendResponse({ steps: getOldLogs(), screenshot: getLastScreenshot() });
        break;

      case 'startlog':
        x = true;
        sendResponse({ status: 'success', message: 'Logging started' });
        break;

      case 'clearLogs':
        clearLogs();
        sendResponse({ message: 'Logs cleared successfully.' });
        break;

      case 'clearolddata':
        clearOldData();
        sendResponse({ message: 'Old data cleared successfully.' });
        break;

      case 'exportLogs':
        sendResponse(getLogs());
        x = false;
        break;

      case 'getStepsToReproduce':
        const steps = generateStepsToReproduce(getLogs());
        sendResponse(steps);
        x = false;
        break;

      case 'generateChecklist':
        generateChecklist(message.logs)
          .then((checklist) => {
            sendResponse({ checklist });
          })
          .catch((error) => {
            sendResponse({ error: error.message });
          });
        return true;

      case 'generateBugtitle':
        generateBugTitle(message.logInput)
          .then((title) => {
            sendResponse({ title });
          })
          .catch((error) => {
            sendResponse({ error: error.message });
          });
        return true;

      default:
        console.warn('Unknown message type:', message);
        sendResponse({ status: 'error', message: 'Unknown action' });
        break;
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ status: 'error', message: error.message });
  }
}

// Attach the message handler
chrome.runtime.onMessage.addListener(handleMessage);