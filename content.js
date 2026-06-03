var hasNotified = false;

browser.runtime.onMessage.addListener(function (message) {
    if (message.type == "watching") {
        hasNotified = false;
        document.querySelectorAll('.info-card--groups').forEach(function (card) {
            card.style.border = '';
            card.style.boxShadow = '';
        });
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

                if (check) {
                    // highlighting boxes
                    var card = title.closest('.info-card--groups');
                    card.style.border = '4px solid #f5c518';
                    card.style.boxShadow = '0 0 20px #f5c518, 0 0 40px rgba(245,197,24,0.5)';
                    card.style.borderRadius = '8px';
                    card.style.transition = 'all 0.3s';
                }

                if (check && !hasNotified) {
                    // only notify once
                    var titlefound = result.keywords.find(function (keyword) {
                        return title.innerText.toUpperCase().includes(keyword.toUpperCase());
                    });
                    browser.runtime.sendMessage({ type: "title-found", keyword: titlefound });
                    browser.storage.local.set({ watching: false, keywords: null });
                    hasNotified = true;
                }
            });
        }
    });
}



setInterval(toonHQCheck, 5000);
