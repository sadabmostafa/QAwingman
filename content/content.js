// content/content.js

// Reusable function to send messages to the background script
function sendMessageToBackground(action, data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action, data }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(`Error sending ${action} message:`, chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log(`${action} message sent successfully:`, response);
        resolve(response);
      }
    });
  });
}

// Reusable function to handle click events
function handleClick(event) {
  try {
    const clickedElement = event.target;
    const clickData = {
      type: 'click',
      tag: clickedElement.tagName,
      text: (clickedElement.innerText || '').trim(),
      id: clickedElement.id || '',
      classes: clickedElement.className || '',
      url: window.location.href,
    };

    // Send click data to the background script
    sendMessageToBackground('logClick', clickData)
      .catch((error) => {
        console.error('Error handling click event:', error);
      });
  } catch (error) {
    console.error('Error in handleClick:', error);
  }
}

// Reusable function to handle input events
function handleInput(event) {
  try {
    const inputElement = event.target;
    const inputData = {
      type: 'input',
      tag: inputElement.tagName,
      id: inputElement.id || '',
      classes: inputElement.className || '',
      value: inputElement.value,
      url: window.location.href,
    };

    // Send input data to the background script
    sendMessageToBackground('logInput', inputData)
      .catch((error) => {
        console.error('Error handling input event:', error);
      });
  } catch (error) {
    console.error('Error in handleInput:', error);
  }
}

// Attach event listeners
document.addEventListener('click', handleClick);
document.addEventListener('input', handleInput);