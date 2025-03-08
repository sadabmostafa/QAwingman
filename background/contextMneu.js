// background/contextMenu.js
import { captureScreenshot, saveScreenshot } from './screenshot.js';

chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create({
      id: 'myCustomOption',
      title: 'Take Screenshot',
      contexts: ['page', 'selection', 'link', 'image'],
    });
  } catch (error) {
    console.error('Error creating context menu:', error);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'myCustomOption') {
    captureScreenshot()
      .then((dataUrl) => {
        saveScreenshot(dataUrl);
      })
      .catch((error) => {
        console.error('Error capturing screenshot:', error);
      });
  }
});