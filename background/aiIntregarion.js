// background/aiIntegration.js
const API_URL = 'https://api-inference.huggingface.co/models/Qwen/QwQ-32B-Preview/v1/chat/completions';
const API_KEY = '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'; 

export async function generateChecklist(logs) {
  try {
    const messages = [
      { role: 'user', content: generateContentFromLogs(logs) },
    ];

    const response = await makeApiRequest(messages);
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating checklist:', error);
    throw error;
  }
}

export async function generateBugTitle(logInput) {
  try {
    const messages = [
      {
        role: 'user',
        content: `Generate a bug title, observed behavior, and expected behavior for the following test case which failed. Do not give explanation or your thinking process:\n\n${logInput}`,
      },
    ];

    const response = await makeApiRequest(messages);
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating bug title:', error);
    throw error;
  }
}

async function makeApiRequest(messages, maxTokens = 500) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/QwQ-32B-Preview',
        messages,
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

function generateContentFromLogs(logs) {
  try {
    let content = 'Generate a simple one-line test case checklist for the following JSON logs:\n\n';
    logs.forEach((log, index) => {
      content += `${index + 1}. Action: ${log.action}, Details: ${JSON.stringify(log.details)}\n`;
    });
    return content;
  } catch (error) {
    console.error('Error generating content from logs:', error);
    throw error;
  }
}