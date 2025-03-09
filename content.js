// content.js

document.addEventListener('click', (event) => {
  const clickedElement = event.target;

	const clickData = {
	  type: 'click',
	  tag: clickedElement.tagName,
	  text: (clickedElement.innerText || '').trim(), // Safely handle undefined or empty text
	  id: clickedElement.id || '',
	  classes: clickedElement.className || '',
	  url: window.location.href,  // Capture the URL of the current page
	};


  // Send the click data to the background script
  chrome.runtime.sendMessage({ action: 'logClick', data: clickData });
});

document.addEventListener('input', (event) => {
  const inputElement = event.target;

  // Ensure the event target is an input, textarea, or contenteditable element
  if (
    inputElement.tagName === 'INPUT' ||
    inputElement.tagName === 'TEXTAREA' ||
    inputElement.isContentEditable
  ) {
    // Capture the input value
    let inputValue = inputElement.value;

    // Handle contenteditable elements (e.g., rich text editors)
    if (inputElement.isContentEditable) {
      inputValue = inputElement.innerText || inputElement.textContent;
    }

    // Prepare the input data
    const inputData = {
      type: 'input',
      tag: inputElement.tagName,
      id: inputElement.id || '',
      classes: inputElement.className || '',
      value: inputValue, // Use the captured value
      url: window.location.href, // Capture the URL
    };

    // Send the input data to the background script
    chrome.runtime.sendMessage({ action: 'logInput', data: inputData }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending input log:', chrome.runtime.lastError);
      } else {
        console.log('Input logged successfully:', inputData);
      }
    });
  }
});

