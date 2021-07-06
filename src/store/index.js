import create from "zustand";

const GHTOKEN = "ghtoken";
const REPO = "repository";
const LABELS = "labels";
const ASSIGNEES = "assignees";

/**
 * Represents the application's persistent storage API. Provides convenience 
 * functions for storing and retrieving pre-defined key-value pairs.
 */
class PersistentStore {
    static getGithubToken() {
        return localStorage.getItem(GHTOKEN);
    }

    static setGithubToken(token) {
        localStorage.setItem(GHTOKEN, token);
    }

    static getRepository() {
        return localStorage.getItem(REPO);
    }

    static setRepository(repo) {
        return localStorage.setItem(REPO, repo);
    }

    static getLabels() {
        const value = localStorage.getItem(LABELS);
        return JSON.parse(value);
    }

    static setLabels(labels) {
        const value = JSON.stringify(labels);
        return localStorage.setItem(LABELS, value);
    }

    static getAssignees() {
        const value = localStorage.getItem(ASSIGNEES);
        return JSON.parse(value);
    }

    static setAssignees(assignees) {
        const value = JSON.stringify(assignees);
        return localStorage.setItem(ASSIGNEES, value);
    }
}

/**
 * Initializes the applications in-memory store. All data stored is
 * lost when the extension is deactivated.
 */
const MemoryStore = create(set => ({
    // The currently selected command (new, comment, all).
    // Defaults to 0 (new).
    command: 0,
    setCommand: command => {
        set(state => {
            state.command = command;
        });
    },

    // A candidate is either a new issue or a new comment. The candidate
    // is initialized with metadata from the page loaded in a tab.
    candidate: {
        title: "",
        comment: "",
        labels: [],
        assignees: [],
        parent: { labels: [], assignees: [] },
    },
    setCandidate: candidate => {
        set(state => {
            state.candidate = { ...candidate };
        });
    },

    // A list of recent issues created on Github. Useful when adding a 
    // candidate as a comment to an existing issue.
    recentIssues: [],
    setRecentIssues: recentIssues => {
        set(state => {
            state.recentIssues = recentIssues;
        });
    },

    // State relating to the 'All' command.
    all: {
        currentWindow: { tabs: [], filtered: 0, runningTime: 0 },
        allWindows: { tabs: [], filtered: 0, runningTime: 0 },
        windowMode: 0,
        saveMode: 0,
        labels: [],
        assignees: [],
    },
    setAll: all => {
        set(state => {
            state.all = { ...all };
        });
    },
}));

export { MemoryStore, PersistentStore };
