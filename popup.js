let selectedKeywords = [];
let isWatching = false;

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const watchBtn = document.getElementById('watchBtn');
const watchBtnText = document.getElementById('watchBtnText');
const clearBtn = document.getElementById('clearBtn');

// Load saved state
browser.storage.local.get(['keywords', 'watching']).then(result => {
    if (result.keywords && result.keywords.length > 0) {
        selectedKeywords = result.keywords;
        // highlight the matching button
        document.querySelectorAll('.activity-btn').forEach(btn => {
            if (result.keywords.includes(btn.dataset.keyword)) {
                btn.classList.add('selected');
            }
        });
        watchBtn.disabled = false;
        watchBtnText.textContent = `Watch for ${result.keywords}`;
    }
    if (result.watching) {
        isWatching = true;
        setWatchingUI(true, result.keywords);
    }
});

//Set watching back to normal if a title is found
browser.runtime.onMessage.addListener(function (message) {
    if (message.type == "title-found") {
        isWatching = false;
        selectedKeywords = [];
        document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('selected'));
        setWatchingUI(false, null);
        watchBtn.disabled = true;
        watchBtnText.textContent = 'Select an activity first';
    }
});

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active-tab'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active-tab');
        document.getElementById('panel-' + tab.dataset.cat).classList.add('active');
    });
});

// Activity button selection
document.querySelectorAll('.activity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isWatching) return; // lock while watching
        if (!selectedKeywords.includes(btn.dataset.keyword)) {
            selectedKeywords.push(btn.dataset.keyword);
            btn.classList.add('selected');
        } else {
            selectedKeywords = selectedKeywords.filter(function (newArray) {
                return newArray !== btn.dataset.keyword;
            });
            btn.classList.remove('selected');
        }
        watchBtn.disabled = false;
        watchBtnText.textContent = `Watch for ${selectedKeywords}`;
        watchBtn.classList.remove('watching-state');
        watchBtn.querySelector('span').textContent = '🔍';
    });
});

// Watch button
watchBtn.addEventListener('click', () => {
    if (selectedKeywords.length === 0) return;

    if (isWatching) {
        // Stop watching
        isWatching = false;
        selectedKeywords = [];
        document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('selected'));
        browser.storage.local.set({ watching: false, keywords: null });
        setWatchingUI(false, null);
        watchBtn.disabled = true;
        watchBtnText.textContent = 'Select an activity first';

    } else {
        // Start watching
        isWatching = true;
        browser.storage.local.set({ watching: true, keywords: selectedKeywords });
        browser.runtime.sendMessage({ type: "watching" });
        setWatchingUI(true, selectedKeywords);
    }
});

// Clear button
clearBtn.addEventListener('click', () => {
    isWatching = false;
    selectedKeywords = [];
    browser.storage.local.set({ watching: false, keywords: null });
    document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('selected'));
    setWatchingUI(false, null);
    watchBtn.disabled = true;
    watchBtnText.textContent = 'Select an activity first';
});

function setWatchingUI(watching, keyword) {
    if (watching) {
        statusDot.className = 'status-dot watching';
        statusText.innerHTML = `Watching for <span>${keyword}</span>`;
        watchBtn.classList.add('watching-state');
        watchBtnText.textContent = 'Stop Watching';
        watchBtn.querySelector('span').textContent = '⏹';
        watchBtn.disabled = false;
        clearBtn.style.display = 'block';
        // lock activity buttons
        document.querySelectorAll('.activity-btn').forEach(b => b.style.opacity = '0.5');
    } else {
        statusDot.className = 'status-dot';
        statusText.innerHTML = 'Not watching';
        watchBtn.classList.remove('watching-state');
        if (selectedKeywords.length > 0) {
            watchBtnText.textContent = `Watch for ${selectedKeywords}`;
            watchBtn.querySelector('span').textContent = '🔍';
        }
        clearBtn.style.display = 'none';
        document.querySelectorAll('.activity-btn').forEach(b => b.style.opacity = '1');

    }
}
