// popup.js
let fileInput = ""
let parsedData  = ""
// Export the logs as a JSON file
document.getElementById('exportLogs').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: "exportLogs" }, (response) => {
    if (response && response.length) {
      parsedData = JSON.stringify(response, null, 2); // Format JSON data
      // Copy JSON data to clipboard
      navigator.clipboard.writeText(parsedData).then(() => {
        console.log("JSON data copied to clipboard!");
      }).catch((error) => {
        console.error("Failed to copy JSON data to clipboard:", error);
      });
	
      generateChecklistFromClipboard();
	// Create and download JSON file
      //const blob = new Blob([parsedData], { type: 'application/json' });
    //  const url = URL.createObjectURL(blob);
     // const downloadLink = document.createElement('a');
     // downloadLink.href = url;
     // downloadLink.download = action_logs_${Date.now()}.json;
     // downloadLink.click();
	  
      //window.close();
    } else {
      console.log("No logs to export.");
    }
  });
});





document.getElementById('generateSteps').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: "getStepsToReproduce" }, (response) => {
	    // Clear the logs in the background service worker
    chrome.runtime.sendMessage({ action: "clearLogs" }, (response) => {
      console.log(response.message); // Optional: Log confirmation message
    });
    if (response && response.length) {
      const stepsText = response.join("\n");
      const blob = new Blob([stepsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `steps_to_reproduce_${Date.now()}.txt`;
      downloadLink.click();
	  // Copy steps to clipboard
      navigator.clipboard.writeText(stepsText).then(() => {
        console.log("Steps copied to clipboard!");
      }).catch(err => {
        console.error("Failed to copy steps to clipboard: ", err);
      });
	  window.close();
    } else {
      console.log("No steps to generate.");
    }

  
  });
});

document.getElementById('clearlog').addEventListener('click', () => {
	chrome.runtime.sendMessage({ command: "startlog" }, (response) => {
    
    });
    // Clear the logs in the background service worker
    chrome.runtime.sendMessage({ action: "clearLogs" }, (response) => {
      console.log(response.message); // Optional: Log confirmation message
    });
	window.close();

});

document.getElementById('startloggin').addEventListener('click', () => {
	chrome.runtime.sendMessage({ command: "startlog" }, (response) => {
    
    });
	window.close();

});

//taking ss
document.addEventListener("DOMContentLoaded", function () {
  const captureButton = document.getElementById("capture-btn");
  if (captureButton) {
    captureButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "capture" }, (response) => {
        if (response && response.screenshot) {
          fetch(response.screenshot)
            .then(res => res.blob())
            .then(blob => {
              const item = new ClipboardItem({ "image/png": blob });
              navigator.clipboard.write([item]).then(() => {
                console.log("Screenshot copied to clipboard!");
				window.close();
              }).catch(err => {
                console.error("Failed to copy screenshot to clipboard: ", err);
              });
            });
        }
      });
    });
  }
});

//taking both together
document.getElementById('copyStepsAndScreenshot').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: "getStepsAndScreenshot" }, (response) => {
    if (response.steps && response.screenshot) {
		const operatingSystem = getOperatingSystem();
		const { name: browserName, version: browserVersion } = getBrowserInfo();

      copyStepsAndImage(response.steps, response.screenshot,browserVersion,browserName,operatingSystem);
    } else {
      console.log("No data to copy.");
    }
  });
});

// Function to combine steps and screenshot into the clipboard
async function copyStepsAndImage(steps, imageDataUrl, browserVersion,browserName,operatingSystem  ) {


const htmlContent = `
  <div>
      <h3>Environment Information</h3>
	   <table style="border: 1px solid black; border-collapse: collapse;">
          <thead>
              <tr>
                  <th style="border: 1px solid black; padding: 5px;">Browser Name</th>
                  <th style="border: 1px solid black; padding: 5px;">Browser Version</th>
                  <th style="border: 1px solid black; padding: 5px;">Operating System</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td style="border: 1px solid black; padding: 5px;">${browserName}</td>
                  <td style="border: 1px solid black; padding: 5px;">${browserVersion}</td>
                  <td style="border: 1px solid black; padding: 5px;">${operatingSystem}</td>
              </tr>
          </tbody>
      </table>
      
      <h3>Bug: WriteBugTitle</h3>
      <h3>Steps to Reproduce</h3>
      <ul>
          ${steps.map(step => `<li>${step}</li>`).join("")}
      </ul>
      <h3>Observed Behavior</h3>
      <p>(Describe what you observed here)</p>
      <h3>Screenshot</h3>
      <img src="${imageDataUrl}" alt="Screenshot" />
      <h3>Expected Behavior</h3>
      <p>(Describe the expected behavior here)</p>
  </div>
`;

  const plainTextContent = [
      "Environment Information:",
      `- Browser Name: ${browserName}`,
      `- Browser Version: ${browserVersion}`,
      `- Operating System: ${operatingSystem}`,
      "",
	  "Bug: WriteBugTitle",
      "Steps to Reproduce:",
      ...steps.map(step => `- ${step}`),
      "",
      "Observed Behavior:",
      "(Describe what you observed here)",
      "",
      "Screenshot attached below.",
      "",
      "Expected Behavior:",
      "(Describe the expected behavior here)"
  ].join("\n");

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([plainTextContent], { type: "text/plain" }),
        "text/html": new Blob([htmlContent], { type: "text/html" }),
      })
    ]);
    console.log("Steps, screenshot, and environment info copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy content to clipboard:", error);
  }
  
  chrome.runtime.sendMessage({ action: "clearolddata" }, (response) => {
    console.log(response.message); // Optional: Log confirmation message
  });
}

// Function to get the browser version
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown Browser";
  let browserVersion = "Unknown Version";

  // Detect Edge (Chromium-based)
  if (/Edg\/(\d+\.\d+\.\d+\.\d+)/.test(userAgent)) {
    browserName = "Edge";
    browserVersion = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/)[1];
  }
  // Detect Chrome (non-Edge Chromium-based)
  else if (/Chrome\/(\d+\.\d+\.\d+\.\d+)/.test(userAgent) && !/Edg\//.test(userAgent)) {
    browserName = "Chrome";
    browserVersion = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)[1];
  }
  // Detect Firefox
  else if (/Firefox\/(\d+\.\d+\.\d+)/.test(userAgent)) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/(\d+\.\d+\.\d+)/)[1];
  }
  // Detect Safari (on macOS)
  else if (/Safari\/(\d+\.\d+)/.test(userAgent) && !/Chrome\//.test(userAgent)) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)[1];
  }
  // Detect Edge on older versions (pre-Chromium)
  else if (/Edge\/(\d+\.\d+\.\d+\.\d+)/.test(userAgent)) {
    browserName = "Edge (Legacy)";
    browserVersion = userAgent.match(/Edge\/(\d+\.\d+\.\d+\.\d+)/)[1];
  }

  return {
    name: browserName,
    version: browserVersion
  };
}


function getOperatingSystem() {
  const userAgent = navigator.userAgent;
  let os = "Unknown OS";
  let architecture = "Unknown Architecture";

  // Windows
  if (/Windows NT 10.0/.test(userAgent)) {
    os = "Windows 10";
  } else if (/Windows NT 6.1/.test(userAgent)) {
    os = "Windows 7";
  } else if (/Windows NT 6.0/.test(userAgent)) {
    os = "Windows Vista";
  } else if (/Windows NT 5.1/.test(userAgent)) {
    os = "Windows XP";
  }
  
  // Check for 32-bit or 64-bit Windows architecture
  if (/Win64/.test(userAgent) || /x64/.test(userAgent)) {
    architecture = "x64";
  } else if (/Win32/.test(userAgent) || /x86/.test(userAgent)) {
    architecture = "x86";
  }

  // macOS (using versioning details for clarity)
  else if (/Mac OS X/.test(userAgent)) {
    os = "macOS";
    const versionMatch = userAgent.match(/Mac OS X (\d+_\d+_\d+)/);
    if (versionMatch) {
      os = `macOS ${versionMatch[1].replace(/_/g, '.')}`;
    }
  }

  // Combine OS and architecture (if available)
  if (architecture !== "Unknown Architecture") {
    os += ` ${architecture}`;
  }

  return os;
}

//AI
// Generate checklist
async function generateChecklistFromClipboard() {
  try {
    // Read data from the clipboard
    const parsedData = await navigator.clipboard.readText();
    alert('A file with the checklist will soon get downloaded in the background');

    const logs = JSON.parse(parsedData); // Parse the clipboard data as JSON

    // Send a message to the background script to generate the checklist
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'generateChecklist', logs }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });

    console.log('Logs input:', logs);
    console.log('Response received from background script:', response);

    // Handle the response from the background script
    if (response.error) {
      alert('Failed to generate checklist: ' + response.error);
    } else if (response.checklist) {
      // Create a file and download it
      const blob = new Blob([response.checklist], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'response.txt';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Unexpected response from the background script.');
    }

    // Optional: Close the window after generating the checklist
    window.close();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}




document.getElementById('generateBugtitle').addEventListener('click', async () => {
	alert('A file with bug information will soon get downloaded in background');
	
  const logInput = document.getElementById('logInput2').value;

  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'generateBugtitle', logInput }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });


    if (response.error) {
      alert('Failed to generate checklist: ' + response.error);
    } else if (response.checklist) {
      const blob = new Blob([response.checklist], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'response.txt';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Unexpected response from the background script.');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
