import { Octokit } from "octokit";
import UrlFormatter from "./url";

/**
 * Wrapper for Octokit, a convenience class for interacting with Github APIs.
 */
class GithubClient {
    /**
     * Creates a new GithubClient. An instance of this class makes interacting with
     * Github's APIs more convenient than directly using Octokit.
     *
     * @param {string} accessToken A valid Github Personal Access Token (PAT).
     * @param {string} repoUrl Url of repository for creating and updating issues.
     * @param {string} baseUrl Github API endpoint (default's to the public instance).
     */
    constructor(accessToken, repoUrl, apiBaseUrl = "https://api.github.com") {
        this.accessToken = accessToken;
        this.repoUrl = repoUrl;
        this.baseUrl = apiBaseUrl;

        let [valid, error] = GithubClient.validRepositoryUrlFormat(repoUrl);
        if (!valid) {
            throw new Error(error);
        }

        [valid, error] = GithubClient.validPersonalAccessTokenFormat(accessToken);
        if (!valid) {
            throw new Error(error);
        }

        const pathname = UrlFormatter.trim(new URL(repoUrl).pathname);
        const parts = pathname.split("/");
        this.org = parts[0];
        this.repo = parts[1];

        this.octokit = new Octokit({
            auth: this.accessToken,
            baseUrl: this.baseUrl,
            log: {
                debug: () => { },
                info: () => { },
                warn: console.warn,
                error: console.error,
            },
        });
    }

    /**
     * Creates a new Github issue.
     *
     * @param {string} title The title of the issue to be created.
     * @param {string} comment The initial issue description or comment.
     * @param {Object[]} labels The labels to be associated with the new issue.
     * @param {string[]} assignees The assignees associated with the new issue.
     */
    async createIssue(title, comment, labels, assignees) {
        const result = await this.octokit.rest.issues.create({
            owner: this.org,
            repo: this.repo,
            title: title,
            body: comment,
            labels: labels,
            assignees: assignees,
        });
        return { url: result.data.html_url, number: result.data.number };
    }

    /**
     * Updates an issue by appending a new comment. Also updates the issue's labels
     * or assignees if these have changed.
     *
     * @param {number} issue The issue to which the comment will be appended.
     * @param {string} comment The comment description.
     * @param {Object[]} labels The labels to update the parent issue with.
     * @param {string[]} assignees The assignees to update the parent issue with.
     */
    async updateIssue(number, comment, labels, assignees) {
        const result = await this.octokit.rest.issues.createComment({
            owner: this.org,
            repo: this.repo,
            issue_number: number,
            body: comment,
        });

        // If labels and assignees have both been passed, update these on the issue.
        // Note that leaving either of these arguments 'null' will remove it from the issue.
        if (labels && assignees) {
            await this.octokit.rest.issues.update({
                owner: this.org,
                repo: this.repo,
                issue_number: number,
                labels: labels,
                assignees: assignees
            });
        }

        return { url: result.data.html_url };
    }

    /**
     * Gets the 15 most recent issues in state "open".
     *
     * @returns {Object[]} An array of upto 15 issues.
     */
    async getRecentIssues() {
        // Note this returns pull-requests as issues as well.
        // Should these be filter out?
        const result = await this.octokit.rest.issues.listForRepo({
            owner: this.org,
            repo: this.repo,
            state: "open",
            per_page: 15,
        });
        return result.data;
    }

    /**
     * Gets all labels associated with the repository.
     *
     * @returns {Object[]} An array of labels.
     */
    async getLabels() {
        const result = await this.octokit.rest.issues.listLabelsForRepo({
            owner: this.org,
            repo: this.repo,
        });
        return result.data;
    }

    /**
     * Gets all assignees associated with the repository.
     *
     * @returns {Object[]} An array of assignees.
     */
    async getAssignees() {
        const result = await this.octokit.rest.issues.listAssignees({
            owner: this.org,
            repo: this.repo,
        });
        return result.data;
    }

    /**
     * Search through issues in the repository. The result set is limited to 7.
     *
     * @param {string} query Search string supporting standard Github search qualifiers
     * (see https://bit.ly/3B0PAWK).
     * @returns {Object[]} List of issues matching the search criteria.
     */
    async search(query) {
        // Restrict query to selected organization and repository
        const restrictedQuery =
            query + "+type:issue+repo:" + this.org + "/" + this.repo;

        const result = await this.octokit.rest.search.issuesAndPullRequests({
            q: restrictedQuery,
            per_page: 20,
        });
        return result.data.items;
    }

    /**
     * Gets the repository url associated with the GithubClient instance.
     * @returns {string} Repository url
     */
    getRepositoryUrl() {
        return this.repoUrl;
    }

    /**
     * Gets the remote repository's metadata.
     * @returns Meta data about the remote repository.
     */
    async getRemoteRepository() {
        const result = await this.octokit.rest.repos.get({
            owner: this.org,
            repo: this.repo,
        });
        return result.data;
    }

    /**
     * Checks if the given url looks like a valid Github repository url. The function first
     * verifies if the url is valid, and then checks to see if the pathname consists of at least
     * 2 components, representing the org name and the repository name respectively.
     *
     * @param {string} repoUrl Repository url.
     * @returns {Array} First element is true if url is valid. If invalid, it is false
     * and includes a second element containing the reason.
     */
    static validRepositoryUrlFormat(repoUrl) {
        try {
            const url = new URL(repoUrl);

            if (!url.protocol.startsWith("https")) {
                return [false, "Repository URL must start with https"];
            }

            const pathname = UrlFormatter.trim(url.pathname);
            const parts = pathname.split("/");

            if (parts.length < 2) {
                return [
                    false,
                    "Invalid repository URL, must include org and repository name",
                ];
            }
        } catch (err) {
            return [false, "Invalid format for repository URL."];
        }
        return [true];
    }

    /**
     * Checks if the given token looks like a valid Github Personal Access Token. The token
     * must be at least 40 characters in length and have the prefix "ghp_". See
     * https://bit.ly/3D9ZQ0T and https://bit.ly/3DeR2qn.
     *
     * @param {string} token
     * @returns {Array} First element is true if url is valid. If invalid, it is false
     * and includes a second element containing the reason.
     */
    static validPersonalAccessTokenFormat(token) {
        if (token.length < 40) {
            return [false, "Access token must be at least 40 characters"];
        }
        if (!token.startsWith("ghp")) {
            return [false, "Access token must start with 'ghp_'"];
        }
        return [true];
    }
}

export default GithubClient;
