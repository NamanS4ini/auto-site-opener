const timeInput = document.getElementById("time");
const urlsInput = document.getElementById("urls");
const addBtn = document.getElementById("add");
const listEl = document.getElementById("list");

function renderList(schedules) {
  listEl.innerHTML = "";
  schedules.forEach(({ time, urls }, idx) => {
    const safeUrls = Array.isArray(urls) ? urls : [urls].filter(Boolean);

    const li = document.createElement("li");
    li.className = "schedule-item glass-morphic p-4 mb-4 rounded-xl shadow-lg flex flex-col gap-3";
    li.style.backdropFilter = "blur(10px)";
    li.style.background = "rgba(255, 255, 255, 0.25)";
    li.style.border = "1px solid rgba(255,255,255,0.3)";
    li.style.boxShadow = "0 4px 24px 0 rgba(31, 38, 135, 0.15)";

    const info = document.createElement("div");
    info.className = "schedule-info mb-2";
    info.innerHTML = `
      <strong class="text-gray-900 drop-shadow" style="text-shadow:0 1px 4px rgba(255,255,255,0.25)">${time}</strong><br>
      ${safeUrls.map(url => `<a class="text-blue-900 text-md hover:underline font-medium drop-shadow" style="text-shadow:0 1px 4px rgba(255,255,255,0.25)" href="${url}" target="_blank">${url}</a>`).join("<br>")}
    `;

    const controls = document.createElement("div");
    controls.className = "flex gap-2 flex-wrap";

    // "Open Now" Button
    // "Open Now" Button
    const openNowBtn = document.createElement("button");
    openNowBtn.textContent = "Open Now";
    openNowBtn.className =
      "cursor-pointer py-1 px-3 rounded-lg font-semibold bg-green-100 text-green-900 border border-green-400 backdrop-blur-sm transition-colors duration-200 text-sm tracking-wide shadow-sm hover:bg-green-200 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-400";
    openNowBtn.onclick = () => {
      safeUrls.forEach((url, i) => {
      chrome.tabs.create({ url, active: i === 0 });
      });
    };

    // Delete Button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Delete";
    removeBtn.className =
      "cursor-pointer py-1 px-3 rounded-lg font-semibold bg-red-100 text-red-900 border border-red-400 backdrop-blur-sm transition-colors duration-200 text-sm tracking-wide shadow-sm hover:bg-red-200 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400";
    removeBtn.onclick = () => removeSchedule(idx);

    controls.appendChild(openNowBtn);
    controls.appendChild(removeBtn);

    li.appendChild(info);
    li.appendChild(controls);
    listEl.appendChild(li);
  });
}


function removeSchedule(index) {
  chrome.storage.sync.get("schedules", (data) => {
    const schedules = data.schedules || [];
    schedules.splice(index, 1);
    chrome.storage.sync.set({ schedules }, () => {
      chrome.runtime.sendMessage({ reloadAlarms: true });
      renderList(schedules);
    });
  });
}

addBtn.onclick = () => {
  const time = timeInput.value;
  const urls = urlsInput.value
  .split("\n")
  .map(line => {
    const trimmed = line.trim();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  })
  .filter(Boolean);





  if (!time || urls.length === 0) return;

  chrome.storage.sync.get("schedules", (data) => {
    const schedules = data.schedules || [];
    schedules.push({ time, urls });
    chrome.storage.sync.set({ schedules }, () => {
      chrome.runtime.sendMessage({ reloadAlarms: true });
      renderList(schedules);
      timeInput.value = "";
      urlsInput.value = "";
    });
  });
};

chrome.storage.sync.get("schedules", (data) => renderList(data.schedules || []));
