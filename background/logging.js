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
    // Input validation
    if (!Array.isArray(logs) || logs.length === 0) {
        console.warn('Invalid or empty logs array provided');
        return ['No, Action'];
    }

    let steps = [];
    const tableHeader = 'No, Action';
    steps.push(tableHeader);

    // Safely extract current page URL
    const currentPageUrl = logs[0]?.details?.url ?? 'unknown page';
    steps.push(`1, Ensure that you are on the screen: ${currentPageUrl}`);

    logs.forEach((log, index) => {
        // Use optional chaining for safer property access
        const elementText = (log?.details?.text || log?.details?.tag)?.replace(/\n/g, ' ') ?? '';

        // Extract classes safely
        const classes = log?.details?.classes ?? [];

        // Determine element type with fallbacks

        const isTag = log?.details?.tag?.toLowerCase() ?? 'element'
        const isButton = classes.includes('btn');
        const isMenu = classes.includes('menuButton');
        const isMenuItem = classes.includes('menuItem');
        const isLink = log?.details?.tag === 'A';
        const isInput = log?.action?.toLowerCase() ?? 'any input';

        let step = '';

        // Handle click actions
        if (log?.action === 'click') {
            if (isTag === 'button' || isButton) {
                step = `Clicked on "${elementText}" button`;
            } else if (isLink) {
                step = `Clicked on "${elementText}" link`;
            } else if (isMenu) {
                step = `Clicked on "${elementText}" Menu`;
            } else if (isMenuItem) {
                step = `Clicked on "${elementText}" Menu Item`;
            } else if (isTag === 'img') {
                step = `Clicked on "${elementText}"`;
            } else if (isTag === 'input' || isInput === 'input') {
                // console.log('Log details:', log.details); //debug
                const inputValue = (log?.details?.value ?? '').replace(/\n/g, ' ');
                step = `Enter '${inputValue}' in the '${log?.details?.tag ?? 'field'}' field on page ${log?.details?.url ?? 'current page'}`;
            }
            else {
                step = `[else]Click on "${elementText}" ${log?.details?.tag?.toLowerCase() ?? 'element'}`;
            }
        }

        // Add step number and description
        steps.push(`${index + 2}, ${step}`);
    });

    // Add final observation step
    steps.push(`${steps.length + 1}, Observe Behavior`);

    oldlogs = steps;
    return steps;
}