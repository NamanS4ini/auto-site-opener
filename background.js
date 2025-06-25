chrome.runtime.onInstalled.addListener(loadAndSetAlarms);
chrome.runtime.onStartup.addListener(loadAndSetAlarms);

function loadAndSetAlarms() {
  chrome.storage.sync.get("schedules", (data) => {
    const schedules = data.schedules || [];
    schedules.forEach(({ time, urls }) => {
      const [hour, minute] = time.split(":").map(Number);
      const now = new Date();
      const alarmTime = new Date();
      alarmTime.setHours(hour, minute, 0, 0);
      if (alarmTime < now) alarmTime.setDate(alarmTime.getDate() + 1); // next day

      chrome.alarms.create(time, {
        when: alarmTime.getTime(),
        periodInMinutes: 1440 // Repeat daily
      });
    });
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.sync.get("schedules", (data) => {
    const match = data.schedules.find(s => s.time === alarm.name);
    if (match) {
      match.urls.forEach((url, index) => chrome.tabs.create({ url, active: index === 0 }));
    }
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.reloadAlarms) {
    chrome.alarms.clearAll(loadAndSetAlarms);
  }
});
