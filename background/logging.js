// logging.js
let x = false;
let actionLogs = [];
let oldlogs = [];

export function initializeLogging() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (x) {
      if (message.action === 'logClick' && message.data) {
        actionLogs.push({
          action: 'click',
          details: message.data
        });
        console.log('Click logged:', message.data);
      }
    }

    if (message.command === "startlog") {
      x = true;
    }

    if (message.action === "clearLogs") {
      actionLogs = [];
      console.log("Action logs cleared.");
      sendResponse({ message: "Logs cleared successfully." });
    }

    if (message.action === "clearolddata") {
      oldlogs = [];
      console.log("Action logs cleared.");
      sendResponse({ message: "Logs cleared successfully." });
    }

    if (message.command === "exportLogs") {
      sendResponse(actionLogs);
      x = false;
    }

    if (message.command === "getStepsToReproduce") {
      const steps = generateStepsToReproduce(actionLogs);
      sendResponse(steps);
      x = false;
    }
  });
}

function generateStepsToReproduce(logs) {
  let steps = [];
  const currentPageUrl = logs[0].details.url;
  const tableHeader = 'No, Action' //header of the csv
  steps.push(tableHeader)
  steps.push(`1, Ensure that you are on the screen: ${currentPageUrl}`); //for csv structure
  logs.forEach((log, index) => {
    const elementText = (log.details.text || log.details.tag).replace(/\n/g, ' ');
    const isButton = log.details.classes && log.details.classes.includes('btn');
    const isMenu = log.details.classes.includes('menuButton');
    const isMenuItem = log.details.classes && log.details.classes.includes('menuItem');
    const isLink = log.details.tag === 'A';

    let step = '';

    if (log.action === 'click') {
      if (isButton) {
        step = `Click on "${elementText}" button`;
      } else if (isLink) {
        step = `Click on "${elementText}" link`;
      } else if (isMenu) {
        step = `Click on "${elementText}" Menu`;
      } else if (isMenuItem) {
        step = `Click on "${elementText}" Menu Item`;
      } else {
        step = `Click on "${elementText}" ${log.details.tag.toLowerCase()}`;
      }
    } else if (log.action === 'input') {
      step = `Enter '${log.details.value}' in the '${log.details.tag}' field on page ${log.details.url}`;
    }

    steps.push(`${index + 2}, ${step}`); //for csv structure
  });

  steps.push(`${steps.length + 1}, Observe Behavior`); //for csv structure
  oldlogs = steps;
  return steps;
}