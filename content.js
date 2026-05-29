var hasNotified = false;

browser.runtime.onMessage.addListener(function (message) {
    if (message.type == "watching") {
        hasNotified = false;
    }
});

function toonHQCheck() {
    browser.storage.local.get(['keywords', 'watching']).then(function (result) {
        if (result.watching && result.keywords) {
            const titles = document.querySelectorAll(".info-card__title");
            titles.forEach(function (title) {
                var check = result.keywords.some(function (keyword) {
                    return title.innerText.toUpperCase().includes(keyword.toUpperCase());
                });
                var titlefound = result.keywords.find(function (keyword) {
                    return title.innerText.toUpperCase().includes(keyword.toUpperCase());
                });
                if (check && !hasNotified) {
                    browser.runtime.sendMessage({ type: "title-found", keyword: titlefound });
                    browser.storage.local.set({ watching: false, keywords: null });
                    hasNotified = true;
                }
            });
        }
    });
}

setInterval(toonHQCheck, 5000);
