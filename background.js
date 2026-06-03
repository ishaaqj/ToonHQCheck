let cakeNotification = "cake-notification";


browser.runtime.onMessage.addListener(function (message) {
    if (message.type === "watching") {
        browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, { type: "watching" });
        });
    }

    if (message.type == "title-found") {
        browser.notifications.create(cakeNotification, {
            type: "basic",
            iconUrl: browser.runtime.getURL("icons/exclamationmarkicon.png"),
            title: "Alert!",
            message: message.keyword + " group is available!"
        }).then(function () {
            console.log("notification created!");
        }).catch(function (error) {
            console.log("error: ", error);
        });
    }
});
