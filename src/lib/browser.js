import { getMetadata } from "page-metadata-parser";

/* global chrome */

/**
 * Utility functions providing access to Chromium browsers such as Brave, Chrome and Edge.
 */
class Browser {
    static async getAllTabs(currentWindow) {
        if (Browser.isContextExtension()) {
            const query = {};
            currentWindow && (query.currentWindow = true);
            const results = await chrome.tabs.query(query);
            return results.map(tab => {
                return new Tab(tab);
            });
        }
        return [];
    }

    /**
     * Gets the current active tab in the browser window.
     * @returns {Object} An instance of a Chromium tab.
     */
    static async getActiveTab() {
        if (Browser.isContextExtension()) {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            return new Tab(tabs[0]);
        }
        return new Tab();
    }

    /**
     * Creates a Document object containing only the head node of a web page. This is
     * memory efficient when we are only interested in the head and its meta tags.
     * @param {Object} innerHTML Inner HTML representing the head element.
     * @returns {Object} A Document object containing only the head node.
     */
    static createDocumentFromHead(innerHTML) {
        const doc = new Document().implementation.createHTMLDocument();
        const e = doc.createElement("head");
        e.innerHTML = innerHTML;
        doc.head.appendChild(e);
        return doc;
    }

    /**
     * Checks whether the execution of this code is within the context of 
     * a Chromium extension.
     * @returns {boolean} Returns true if the current execution context 
     * is an extension.
     */
    static isContextExtension() {
        return window.chrome && chrome.runtime && chrome.runtime.id;
    }
}

/**
 * A wrapper for an instance of a Chromium tab. Provides functions 
 * to get the underlying Page object and the tab's running time.
 */
class Tab {
    /**
     * Creates an instance of Tab which represents a real Chromium tab.
     * @param {Object} chromeTab An instance of a Chromium tab.
     */
    constructor(chromeTab) {
        this.chromeTab = chromeTab;
    }

    /**
     * Get's the tab's URL.
     */
    get url() {
        if (Browser.isContextExtension()) {
            return this.chromeTab.url;
        }
        return window.location.origin;
    }

    /**
     * Gets an estimate of the tab's running time by querying the browser's 
     * history for the last visit to the url this tab represents.
     * @returns 
     */
    getRunningTime() {
        if (Browser.isContextExtension()) {
            return new Promise(resolve => {
                chrome.history.getVisits(
                    { url: this.chromeTab.url },
                    visits => {
                        const recentVisit = visits[visits.length - 1];
                        resolve(
                            recentVisit ? recentVisit.visitTime : Date.now()
                        );
                    }
                );
            });
        }
        return new Promise(resolve => resolve(0));
    }

    /**
     * Gets a Page object representing the web page loaded by this tab.
     * @returns {Object} An instance of Page.
     */
    async getPage() {
        if (Browser.isContextExtension()) {
            let doc;
            if (this.chromeTab.url.startsWith("chrome://")) {
                doc = Browser.createDocumentFromHead("<title>" + this.chromeTab.url + "</title>");
            } else {
                const head = await chrome.scripting.executeScript({
                    target: { tabId: this.chromeTab.id },
                    function: () => {
                        return document.head.innerHTML;
                    },
                });
                doc = Browser.createDocumentFromHead(head[0].result);
            }
            return new Page(this.chromeTab.url, doc);
        }
        return new Page(window.location.origin, window.document);
    }
}

/**
 * An abstraction of a web page. Contains a valid Document Object Model (DOM) 
 * of a web page and its associated URL. A Page object extracts metadata from 
 * the underlying DOM based on Open Graph Protocol (https://ogp.me/).
 */
class Page {

    /**
     * Creates an instance of Page
     * @param {string} url The url of the web page.
     * @param {Object} document A valid DOM representation of the web page.
     */
    constructor(url, document) {
        this.url = url;
        this.document = document;
        this.metadata = getMetadata(document, url);
    }

    /**
     * Gets the page's title. If a valid title does not exist, 
     * the page's url is returned instead.
     */
    get title() {
        if (this.meta.title)
            return this.meta.title;
        else
            return this.meta.url;
    }

    /**
     * Gets the metadata associated with this page.
     */
    get meta() {
        return this.metadata;
    }

    /**
     * Sets the metadata object of this page. 
     */
    set meta(value) {
        this.metadata = value;
    }

    /**
     * Renders a Markdown representation of this page, similar to unfurling a link
     * in other applications such as Slack, Discord or Signal. This representation 
     * includes meta data based on the Open Graph protocol (https://ogp.me/).
     * @returns 
     */
    toMarkdown() {
        // Format link preview (Title, Description, Image)
        let markdown = "## [" + this.title + "](" + this.meta.url + ")\n";
        this.meta.description && (markdown += this.meta.description + "\n");
        this.meta.image &&
            (markdown +=
                '\n<img src="' + this.meta.image + '" height="250">\n');

        // Format additional metadata
        let data = Object.keys(this.meta)
            .filter(
                key =>
                    // Ignore these attributes as they are included above.
                    !["title", "description", "image", "url", "icon"].includes(
                        key
                    ) && this.meta[key]
            )
            .map(
                key =>
                    "* **" +
                    // Uppercase key's first letter
                    key.charAt(0).toUpperCase() +
                    key.slice(1) +
                    "**: " +
                    this.meta[key]
            )
            .join("\n");
        data &&
            (markdown += "\n### Metadata \n\n" + data);
        return markdown;
    }

    /**
     * Returns a string representation of this page 
     * containing a list of metadata entries.
     * @returns {string} A representation of the page.
     */
    toString() {
        let content = Object.keys(this.meta)
            .map(key => key + ": " + this.meta[key])
            .join("\n");
        return content;
    }
}

export { Browser, Page, Tab };
