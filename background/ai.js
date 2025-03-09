// ai.js
const API_URL = 'https://api-inference.huggingface.co/models/Qwen/QwQ-32B-Preview/v1/chat/completions';
const API_KEY = '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'; // Replace with your key

export function initializeAI() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'generateChecklist') {
      (async () => {
        try {
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
      return true;
    }

    if (message.action === 'generateBugtitle') {
      (async () => {
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "Qwen/QwQ-32B-Preview",
              messages: [{ role: "user", content: "Generate a bug title, observed behavior and expected behavior for the following test case which failed. DO not give explanation or your thinking process:\n\n" + message.logInput }],
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
      return true;
    }
  });
}

function generateContentFromLogs(logs) {
  let content = "Generate a simple one-line test case checklist for the following JSON logs:\n\n";
  logs.forEach((log, index) => {
    content += `${index + 1}. Action: ${log.action}, Details: ${JSON.stringify(log.details)}\n`;
  });
  return content;
}