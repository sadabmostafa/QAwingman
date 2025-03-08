// background/stepsGenerator.js
import { getOldLogs } from './logging.js';

export function generateStepsToReproduce(logs) {
  try {
    if (!logs || logs.length === 0) {
      return ['No steps available'];
    }

    const currentPageUrl = logs[0].details.url || 'unknown page';
    const steps = [`1, Ensure that you are on the screen: ${currentPageUrl}`];

    logs.forEach((log, index) => {
      const elementText = log.details.text || log.details.tag;
      const isButton = log.details.classes && log.details.classes.includes('btn');
      const isMenu = log.details.classes.includes('menuButton');
      const isMenuItem = log.details.classes && log.details.classes.includes('menuItem');
      const isLink = log.details.tag === 'A';

      let step = '';
      if (log.action === 'click') {
        if (elementText.includes('\n')) {
          elementText = elementText.split('\n')[0].trim();
        }
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

      steps.push(`${index + 2}, ${step}`);
    });

    steps.push(`${steps.length + 1}, Observe Behavior`);
    return steps;
  } catch (error) {
    console.error('Error generating steps to reproduce:', error);
    throw error;
  }
}