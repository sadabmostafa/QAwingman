// popup.js

// Utility function to send messages to the background script
function sendMessageToBackground(action, data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action, data }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// Utility function to copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Text copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
    throw error;
  }
}

// Utility function to download a file
function downloadFile(content, fileName, fileType = "text/plain") {
  try {
    const blob = new Blob([content], { type: fileType });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download file:", error);
    throw error;
  }
}

// Export logs as a JSON file
document.getElementById("exportLogs").addEventListener("click", async () => {
  try {
    const response = await sendMessageToBackground("exportLogs");
    if (response && response.length) {
      const parsedData = JSON.stringify(response, null, 2); // Format JSON data
      await copyToClipboard(parsedData);
      await generateChecklistFromClipboard();
    } else {
      console.log("No logs to export.");
    }
  } catch (error) {
    console.error("Error exporting logs:", error);
  }
});

// Generate steps to reproduce
document.getElementById("generateSteps").addEventListener("click", async () => {
  try {
    const response = await sendMessageToBackground("getStepsToReproduce");
    if (response && response.length) {
      const csvHeader = "Step no, Action, X-path\n";
      const stepsText = response.join("\n");
      const csvContent = csvHeader + stepsText;
      downloadFile(csvContent, `steps_to_reproduce_${Date.now()}.csv`);
      await copyToClipboard(stepsText);
      window.close();
    } else {
      console.log("No steps to generate.");
    }
  } catch (error) {
    console.error("Error generating steps:", error);
  }
});

// Clear logs
document.getElementById("clearlog").addEventListener("click", async () => {
  try {
    await sendMessageToBackground("startlog");
    await sendMessageToBackground("clearLogs");
    window.close();
  } catch (error) {
    console.error("Error clearing logs:", error);
  }
});

// Start logging
document.getElementById("startloggin").addEventListener("click", async () => {
  try {
    await sendMessageToBackground("startlog");
    window.close();
  } catch (error) {
    console.error("Error starting logging:", error);
  }
});

// Take screenshot
document.addEventListener("DOMContentLoaded", () => {
  const captureButton = document.getElementById("capture-btn");
  if (captureButton) {
    captureButton.addEventListener("click", async () => {
      try {
        const response = await sendMessageToBackground("captureScreenshot");
        if (response && response.screenshot) {
          const blob = await fetch(response.screenshot).then((res) => res.blob());
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          console.log("Screenshot copied to clipboard!");
          window.close();
        }
      } catch (error) {
        console.error("Error capturing screenshot:", error);
      }
    });
  }
});

// Copy steps and screenshot
document.getElementById("copyStepsAndScreenshot").addEventListener("click", async () => {
  try {
    const response = await sendMessageToBackground("getStepsAndScreenshot");
    if (response.steps && response.screenshot) {
      const { name: browserName, version: browserVersion } = getBrowserInfo();
      const operatingSystem = getOperatingSystem();
      await copyStepsAndImage(response.steps, response.screenshot, browserVersion, browserName, operatingSystem);
    } else {
      console.log("No data to copy.");
    }
  } catch (error) {
    console.error("Error copying steps and screenshot:", error);
  }
});

// Function to combine steps and screenshot into the clipboard
async function copyStepsAndImage(steps, imageDataUrl, browserVersion, browserName, operatingSystem) {
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
        ${steps.map((step) => `<li>${step}</li>`).join("")}
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
    ...steps.map((step) => `- ${step}`),
    "",
    "Observed Behavior:",
    "(Describe what you observed here)",
    "",
    "Screenshot attached below.",
    "",
    "Expected Behavior:",
    "(Describe the expected behavior here)",
  ].join("\n");

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([plainTextContent], { type: "text/plain" }),
        "text/html": new Blob([htmlContent], { type: "text/html" }),
      }),
    ]);
    console.log("Steps, screenshot, and environment info copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy content to clipboard:", error);
  }

  await sendMessageToBackground("clearolddata");
}

// Function to get browser info
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown Browser";
  let browserVersion = "Unknown Version";

  if (/Edg\/(\d+\.\d+\.\d+\.\d+)/.test(userAgent)) {
    browserName = "Edge";
    browserVersion = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/)[1];
  } else if (/Chrome\/(\d+\.\d+\.\d+\.\d+)/.test(userAgent) && !/Edg\//.test(userAgent)) {
    browserName = "Chrome";
    browserVersion = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)[1];
  } else if (/Firefox\/(\d+\.\d+\.\d+)/.test(userAgent)) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/(\d+\.\d+\.\d+)/)[1];
  } else if (/Safari\/(\d+\.\d+)/.test(userAgent) && !/Chrome\//.test(userAgent)) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)[1];
  } else if (/Edge\/(\d+\.\d+\.\d+\.\d+)/.test(userAgent)) {
    browserName = "Edge (Legacy)";
    browserVersion = userAgent.match(/Edge\/(\d+\.\d+\.\d+\.\d+)/)[1];
  }

  return { name: browserName, version: browserVersion };
}

// Function to get operating system info
function getOperatingSystem() {
  const userAgent = navigator.userAgent;
  let os = "Unknown OS";

  if (/Windows NT 10.0/.test(userAgent)) {
    os = "Windows 10";
  } else if (/Windows NT 6.1/.test(userAgent)) {
    os = "Windows 7";
  } else if (/Windows NT 6.0/.test(userAgent)) {
    os = "Windows Vista";
  } else if (/Windows NT 5.1/.test(userAgent)) {
    os = "Windows XP";
  } else if (/Mac OS X/.test(userAgent)) {
    os = "macOS";
    const versionMatch = userAgent.match(/Mac OS X (\d+_\d+_\d+)/);
    if (versionMatch) {
      os = `macOS ${versionMatch[1].replace(/_/g, ".")}`;
    }
  }

  return os;
}

// Generate checklist from clipboard
async function generateChecklistFromClipboard() {
  try {
    const parsedData = await navigator.clipboard.readText();
    alert("A file with the checklist will soon get downloaded in the background");

    const logs = JSON.parse(parsedData);
    const response = await sendMessageToBackground("generateChecklist", { logs });

    if (response.error) {
      alert("Failed to generate checklist: " + response.error);
    } else if (response.checklist) {
      downloadFile(response.checklist, "response.csv");
    } else {
      alert("Unexpected response from the background script.");
    }

    window.close();
  } catch (error) {
    alert("Error: " + error.message);
  }
}

// Generate bug title
document.getElementById("generateBugtitle").addEventListener("click", async () => {
  try {
    alert("A file with bug information will soon get downloaded in background");
    const logInput = document.getElementById("logInput2").value;
    const response = await sendMessageToBackground("generateBugtitle", { logInput });

    if (response.error) {
      alert("Failed to generate bug title: " + response.error);
    } else if (response.checklist) {
      downloadFile(response.checklist, "response.csv");
    } else {
      alert("Unexpected response from the background script.");
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
});