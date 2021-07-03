document.addEventListener('DOMContentLoaded', function () {
    var onTabInfoIsLoaded = function (tab) {
        var startButton = document.getElementById('startButton');
        var stopButton = document.getElementById('stopButton');
        var locationInfo = document.getElementById('locationInfo');

        var strContains = function (string, substring) {
            if (!string || !substring) {
                return false;
            }

            return string.indexOf(substring) !== -1;
        };

        var isOnSearchPage = function () {
            return strContains(tab.url, "/vsearch/p");
        };

        var isOnPymkPage = function () {
            return strContains(tab.url, "/people/pymk");
        };

        var openUrlOnCurrentTab = function (url) {
            chrome.tabs.update({url: url}, onTabInfoIsLoaded);
        };

        var executeScriptOnCurrentTab = function () {
            chrome.tabs.executeScript({
                file: 'tab.js'
            });
        };

        var onTabUpdated = function (tabId, changeInfo, tab) {
            if (changeInfo.status == "loading") {
                onTabInfoIsLoaded(tab);
                if (strContains(tab.url, "/people/contacts-search-invite-submit-reconnect")) {
                    chrome.tabs.executeScript(tabId, {
                        code: 'history.back();'
                    });
                } else if (isOnSearchPage() || isOnPymkPage()) {
                    executeScriptOnCurrentTab();
                    startButton.style.display = 'none';
                    stopButton.style.display = 'block';
                }
            }
        };

        var onClickStartButton = function () {
            startButton.style.display = 'none';
            stopButton.style.display = 'block';
            executeScriptOnCurrentTab();
            chrome.tabs.onUpdated.addListener(onTabUpdated);
        };

        var onClickStopButton = function () {
            startButton.style.display = 'block';
            stopButton.style.display = 'none';
            chrome.tabs.onUpdated.removeListener(onTabUpdated);
            chrome.tabs.executeScript({
                code: 'running = false'
            });
        };

        if (isOnSearchPage()) {
            locationInfo.innerHTML = "You're on 'Search People' page!";
        } else if (isOnPymkPage()) {
            locationInfo.innerHTML = "You're on 'People You May Know' page! Scroll down the page to load more contacts when needed.";
        } else {
            locationInfo.innerHTML = '<p>Select one of the following<br/>LinkedIn Pages to open:</p><p><button id="openLinkedInPymkPage"><span>People You May Know</span></button></p><p><button id="openLinkedInSearchPage"><span>Search People</span></button></p>';
            document.getElementById('openLinkedInSearchPage').addEventListener('click', function () {
                openUrlOnCurrentTab('https://www.linkedin.com/vsearch/p?f_N=S');
            });
            document.getElementById('openLinkedInPymkPage').addEventListener('click', function () {
                openUrlOnCurrentTab('https://www.linkedin.com/people/pymk');
            });
        }

        startButton.style.display = (isOnSearchPage() || isOnPymkPage()) ? 'block' : 'none';
        stopButton.style.display = 'none';
        startButton.addEventListener('click', onClickStartButton);
        stopButton.addEventListener('click', onClickStopButton);

        chrome.tabs.executeScript({
            code: 'running = false'
        });
    };

    chrome.tabs.getSelected(onTabInfoIsLoaded);
});