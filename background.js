// background.js
let x = false;
let lastScreenshot = ""; 
// Array to store logged actions (clicks, inputs)
let actionLogs = [];
let oldlogs = [];
//AI part
const API_URL = 'https://api-inference.huggingface.co/models/Qwen/QwQ-32B-Preview/v1/chat/completions';
const API_KEY = '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'; // Replace with your key



// Listen for messages from content scripts and popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle click logging from content script
  if (x) {
	if (message.action === 'logClick' && message.data) {
		actionLogs.push({
		  action: 'click',
		  details: message.data
		});
		console.log('Click logged:', message.data);
	}
  }
  //screenshot taking process
if (message.type === "capture") {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, function(dataUrl) {
	  lastScreenshot = dataUrl;
    // Save the screenshot
    chrome.downloads.download({
      url: dataUrl,
      filename: 'screenshot.png',
      saveAs: false
    });

    // Send the screenshot data to the sender for clipboard handling
    sendResponse({ screenshot: dataUrl });
  });

  // Required for async responses
  return true;
}

if (message.command === "getStepsAndScreenshot") {
    sendResponse({ steps: oldlogs, screenshot: lastScreenshot });
  }

  //Stopping line from here
  
  if (message.command === "startlog") {
    x = true
  }

   if (message.action === "clearLogs") {
    actionLogs = []; // Clear the actionLogs array
    console.log("Action logs cleared.");
    sendResponse({ message: "Logs cleared successfully." });
  }
  //clearing bug report
  if (message.action === "clearolddata") {
    oldlogs = []; // Clear the actionLogs array
	lastScreenshot = ""
    console.log("Action logs cleared.");
    sendResponse({ message: "Logs cleared successfully." });
  }

  // Handle export request from popup script (export raw log data)
  if (message.command === "exportLogs") {
    sendResponse(actionLogs);
	x=false
  }

  // Handle request to generate steps to reproduce the issue
  if (message.command === "getStepsToReproduce") {
    const steps = generateStepsToReproduce(actionLogs);
    sendResponse(steps);
	x=false
  }
  
  //Ai intregration
    if (message.action === 'generateChecklist') {
    (async () => {
      try {
        // Process the message asynchronously
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "Qwen/QwQ-32B-Preview",
            messages: [{ role: "user", content: generateContentFromLogs(message.logs) }],
            max_tokens: 500,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`API call failed with status ${response.status}`);
        }

        const data = await response.json();
        sendResponse({ checklist: data.choices[0]?.message?.content || '' });
      } catch (error) {
        sendResponse({ error: error.message });
      }
    })();
    return true; // Ensure the port remains open
  }
    if (message.action === 'generateBugtitle') {
    (async () => {
      try {
        // Process the message asynchronously
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "Qwen/QwQ-32B-Preview",
            messages: [{ role: "user", content: "Generate a bug title, observed behavior and expected behavior for the following test case which failed. DO not give explanation or your thinking process:\n\n"+ message.logInput }],
            max_tokens: 500,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`API call failed with status ${response.status}`);
        }

        const data = await response.json();
        sendResponse({ checklist: data.choices[0]?.message?.content || '' });
      } catch (error) {
        sendResponse({ error: error.message });
      }
    })();
    return true; // Ensure the port remains open
  }

});



// Function to generate human-readable steps to reproduce the issue from logs
function generateStepsToReproduce(logs) {
  let steps = [];
  const currentPageUrl = logs[0].details.url; 
  steps.push(`1, Ensure that you are on the screen: ${currentPageUrl}`); //updated to "," in place of "." as generating CSV.
  logs.forEach((log, index) => {
    const elementText = log.details.text || log.details.tag;
    const isButton = log.details.classes && log.details.classes.includes('btn');
	const isMenu = log.details.classes.includes('menuButton');
	const isMenuItem = log.details.classes && log.details.classes.includes('menuItem');
    const isLink = log.details.tag === 'A';
    
    let step = '';
    
    if (log.action === 'click') {
      // If it's a button (based on classes) or an anchor tag (link)
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
    }
    else if (log.action === 'input') {
      step = `Enter '${log.details.value}' in the '${log.details.tag}' field on page ${log.details.url}`;
    }
    
    // Add the numbered step
    steps.push(`${index + 2}, ${step}`); //updated to "," in place of "." as generating CSV.
  });
  
  // Add "Observe Behavior" as the last step
  steps.push(`${steps.length + 1}, Observe Behavior`);
  oldlogs = steps
  return steps;
}
//ss
chrome.runtime.onInstalled.addListener(() => {
  // Create a context menu item
  chrome.contextMenus.create({
    id: "myCustomOption", // Unique ID for the menu item
    title: "Take Screenshot", // The text shown in the menu
    contexts: ["page", "selection", "link", "image"], // Where it appears
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

//AI
function generateContentFromLogs(logs) {
  let content = "Generate a simple one-line test case checklist for the following JSON logs:\n\n";
  logs.forEach((log, index) => {
    content += `${index + 1}. Action: ${log.action}, Details: ${JSON.stringify(log.details)}\n`;
  });
  return content;
}
