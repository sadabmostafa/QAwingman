// background/logging.js
let actionLogs = [];
let oldlogs = [];

export function logClick(data) {
  try {
    actionLogs.push({
      action: 'click',
      details: data,
    });
    console.log('Click logged:', data);
  } catch (error) {
    console.error('Error logging click:', error);
    throw error;
  }
}

export function logInput(data) {
  try {
    actionLogs.push({
      action: 'input',
      details: data,
    });
    console.log('Input logged:', data);
  } catch (error) {
    console.error('Error logging input:', error);
    throw error;
  }
}

export function clearLogs() {
  try {
    actionLogs = [];
    console.log('Action logs cleared.');
  } catch (error) {
    console.error('Error clearing logs:', error);
    throw error;
  }
}

export function clearOldData() {
  try {
    oldlogs = [];
    console.log('Old logs cleared.');
  } catch (error) {
    console.error('Error clearing old data:', error);
    throw error;
  }
}

export function getLogs() {
  try {
    return actionLogs;
  } catch (error) {
    console.error('Error retrieving logs:', error);
    throw error;
  }
}

export function getOldLogs() {
  try {
    return oldlogs;
  } catch (error) {
    console.error('Error retrieving old logs:', error);
    throw error;
  }
}