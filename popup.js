let selectedKeywords = [];
let isWatching = false;
let selectedCorp = null;
let selectedStory = null;

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const watchBtn = document.getElementById('watchBtn');
const watchBtnText = document.getElementById('watchBtnText');
const clearBtn = document.getElementById('clearBtn');

clearBtn.style.display = 'block';
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

//Buildings
document.querySelectorAll('[data-type="corp"], [data-type="story"]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isWatching) return;
        const type = btn.dataset.type;
        if (type === 'corp') {
            // toggle corp selection
            if (selectedCorp === btn.dataset.value) {
                selectedCorp = null;
                btn.classList.remove('selected');
            } else {
                document.querySelectorAll('[data-type="corp"]').forEach(b => b.classList.remove('selected'));
                selectedCorp = btn.dataset.value;
                btn.classList.add('selected');
            }
        } else if (type === 'story') {
            // toggle story selection
            if (selectedStory === btn.dataset.value) {
                selectedStory = null;
                btn.classList.remove('selected');
            } else {
                document.querySelectorAll('[data-type="story"]').forEach(b => b.classList.remove('selected'));
                selectedStory = btn.dataset.value;
                btn.classList.add('selected');
            }
        }
        updateBuildingPreview();
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
        selectedCorp = null;
        selectedStory = null;
        document.querySelectorAll('[data-type="corp"], [data-type="story"]').forEach(b => b.classList.remove('selected'));
        updateBuildingPreview();

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
    selectedCorp = null;
    selectedStory = null;
    browser.storage.local.set({ watching: false, keywords: null });
    document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('[data-type="corp"], [data-type="story"]').forEach(b => b.classList.remove('selected'));
    updateBuildingPreview();
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

        selectedCorp = null;
        selectedStory = null;
        document.querySelectorAll('[data-type="corp"], [data-type="story"]').forEach(b => b.classList.remove('selected'));
        updateBuildingPreview();
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
        document.querySelectorAll('.activity-btn').forEach(b => b.style.opacity = '1');

    }
}

function updateBuildingPreview() {
    const preview = document.getElementById('buildingPreview');
    const placeholder = document.getElementById('previewPlaceholder');

    if (!selectedCorp && !selectedStory) {
        placeholder.style.display = 'inline';
        preview.querySelectorAll('.preview-tag').forEach(t => t.remove());
        watchBtn.disabled = selectedKeywords.length === 0;
        return;
    }

    placeholder.style.display = 'none';
    preview.querySelectorAll('.preview-tag').forEach(t => t.remove());

    let keyword;
    if (selectedStory && selectedCorp) {
        keyword = selectedStory + ' ' + selectedCorp;
    } else if (selectedStory) {
        keyword = selectedStory;
    } else {
        keyword = selectedCorp;
    }
    const tag = document.createElement('span');
    tag.className = 'preview-tag';
    tag.textContent = keyword;
    preview.appendChild(tag);

    // add or replace building keyword in selectedKeywords
    selectedKeywords = selectedKeywords.filter(k => !k.includes('BUILDING') && !k.includes('STORY'));
    selectedKeywords.push(keyword);
    watchBtn.disabled = false;
    watchBtnText.textContent = `Watch for ${selectedKeywords}`;
}
