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
  
  const inputData = {
    type: 'input',
    tag: inputElement.tagName,
    id: inputElement.id || '',
    classes: inputElement.className || '',
    value: inputElement.value,
    url: window.location.href,  // Capture the URL
  };
  
  // Send the input data to the background script
  chrome.runtime.sendMessage({ action: 'logInput', data: inputData });
});

