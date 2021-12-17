import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import styled from "styled-components";
import { Activator, createActivatorConfig, ActivatorState } from "../activator";
import Assignees from "./Assignees";
import { Browser } from "../lib/browser";
import { Action, Command } from "./Command";
import GithubClient from "../lib/github";
import Url from "../lib/url";
import Header from "./Header";
import Content from "./Content";
import { AllTabs, WindowMode, SaveMode } from "./AllTabs";
import Labels from "./Labels";
import Repository from "./Repository";
import { MemoryStore, PersistentStore } from "../store";
import Routes from "../routes";
import formatError from "../lib/errors";

const Panel = styled.div`
    display: grid;
    grid-template-rows: 30px 460px 55px;
`;

const Body = styled.div`
    display: grid;
    grid-row-gap: 10px;
    margin-left: 10px;
    margin-right: 10px;
`;

const IssueContent = styled.div`
    height: 240px;
`;

const newActivatorConfig = () => {
    const config = createActivatorConfig();
    config.label = "Save";
    return config;
};

const newGithubClient = () => {
    const ghClient = new GithubClient(
        PersistentStore.getGithubToken(),
        PersistentStore.getRepository()
    );
    return ghClient;
};

const loginUsers = assignees => {
    if (assignees === null) {
        return null
    } else {
        return assignees.map(assignee => {
            return assignee.login;
        });
    }
};

/**
 * Component representing the Issue dialog. The Issue dialog is the default 
 * dialog shown when the extension is activated. The Issue dialog allows the 
 * user to edit the title and comment fields of the issue, or select an 
 * existing issue to which the candidate will be appended to as a comment.
 * @returns A rendering of the issue (home) dialog.
 */
const Issue = () => {

    // The command selected. Default is NEW. 
    const [command, setCommand] = MemoryStore(state => [
        state.command,
        state.setCommand,
    ]);

    // The candidate issue or comment to be saved to the Github repository.
    const [candidate, setCandidate] = MemoryStore(state => [
        state.candidate,
        state.setCandidate,
    ]);

    // A list of recent issues from the Github repository.
    const [recentIssues, setRecentIssues] = MemoryStore(state => [
        state.recentIssues,
        state.setRecentIssues,
    ]);

    // State representing the ALL command.
    const [all, setAll] = MemoryStore(state => [state.all, state.setAll]);

    // Custom configuration for the Activator component.
    const [activatorConfig, setActivatorConfig] = useState(
        newActivatorConfig()
    );

    const history = useHistory();
    const location = useLocation();

    /**
     * Saves the command selected by the user.
     * @param {Object} e HTML Event.
     */
    const handleCommandSelection = e => {
        const command = parseInt(e.target.value);
        setCommand(command);
    };

    /**
     * Handles the button click event from the Activator component.
     * Saves the current or all tabs, or if already saved closes the
     * extension dialog.
     */
    const handleActivation = () => {
        // If Activator was in 'ACTIVE' state the user clicked 'Save',
        // attempt to save tabs.
        if (activatorConfig.state === ActivatorState.ACTIVE) {
            if (command === Action.ALL) {
                saveAllTabs();
            } else {
                saveCurrentTab();
            }
            updateActivator({ state: ActivatorState.PENDING });
        } else if (activatorConfig.state === ActivatorState.DONE) {
            // If Activator was in 'DONE' state, close window and
            // unload the extension from view.
            window.close();
        }
    };

    /**
     * Saves the current tab depending on the command selected. If command is
     * NEW, a new issue is created. If command is COMMENT a new comment is
     * appended to the parent issue.
     */
    const saveCurrentTab = async () => {
        try {
            // If Action is 'NEW', create a new Github issue.
            let result;
            const ghClient = newGithubClient();
            if (command === Action.NEW) {
                result = await ghClient.createIssue(
                    candidate.title,
                    candidate.comment,
                    candidate.labels,
                    loginUsers(candidate.assignees)
                );
            } else if (command === Action.COMMENT) {
                // Action is 'COMMENT', therefore create a comment 
                // within the parent issue.
                let labels = null;
                let assignees = null;
                if (candidate.parent.dirty) {
                    labels = candidate.parent.labels;
                    assignees = candidate.parent.assignees;
                }
                result = await ghClient.updateIssue(
                    candidate.parent.number,
                    candidate.comment,
                    labels,
                    loginUsers(assignees)
                );
            }
            // Set external link to the parent issue.
            updateActivator({ state: ActivatorState.DONE, label: "Close", link: result.url });
        }
        catch (err) {
            console.error(err);
            const message = formatError(err);
            updateActivator({ state: ActivatorState.DONE, label: "Close", message: message });
        }
    }

    /**
     * Saves all tabs in the current or all windows. If save mode is SINGLE a single
     * issue is created from the first tab, while the remaining tabs are appended as 
     * comments. If save mode is MULTI and new issue is created per tab.
     */
    const saveAllTabs = async () => {
        let tabs = await Browser.getAllTabs(all.windowMode === WindowMode.CURRENT);
        if (all.saveMode === SaveMode.SINGLE) {
            saveAllTabsAsSingleIssue(tabs);
        } else {
            saveAllTabsAsMultipleIssues(tabs);
        }
    }

    /**
     * Saves all tabs under a single issue. The function creates a parent 
     * issue with first tab and add the remaining tabs as comments.
     * @param {Object[]} tabs A list of browser tabs.
     */
    const saveAllTabsAsSingleIssue = async (tabs) => {
        try {
            // Retrieve pages from all tab instances. If the retrieval was 
            // successful then proceed to update the issue with a series of 
            // comments, one per page.
            let promises = [];
            tabs.forEach(tab => {
                // Promise to retrieve page.
                const promise = new Promise((resolve, reject) => {
                    tab.getPage()
                        .then(page => {
                            resolve(page);
                        })
                        .catch(err => reject(err));
                });
                promises.push(promise);
            });

            // Retrieve all pages and, if successful, proceed to
            // create comments.
            Promise.all(promises).then(pages => {
                // Extract title and comment from first tab and create issue.
                const page = pages[0];
                const title = page.title;
                const comment = page.toMarkdown();
                const ghClient = newGithubClient();
                ghClient.createIssue(
                    title,
                    comment,
                    all.labels,
                    loginUsers(all.assignees)
                ).then(result => {
                    // Save all remaining pages as comments in the parent issue.
                    promises = [];
                    pages = pages.slice(1);
                    pages.forEach(page => {
                        // Promise to update issue with new comment.
                        const promise = new Promise((resolve, reject) => {
                            const comment = page.toMarkdown();
                            ghClient.updateIssue(
                                result.number,
                                comment
                            )
                                .then(result => resolve(result))
                                .catch(err => reject(err));
                        });
                        promises.push(promise);
                    });

                    Promise.all(promises).then(() => {
                        // Set external link to the parent issue
                        updateActivator({ state: ActivatorState.DONE, label: "Close", link: result.url });
                    }).catch(err => {
                        handleError(err);
                    });
                }).catch(err => {
                    handleError(err);
                });
            }).catch(err => {
                handleError(err);
            });
        }
        catch (err) {
            handleError(err);
        }
    }

    /**
     * Saves all tabs as multiple issues, one per tab. 
     * @param {Object[]} tabs A list of browser tabs.
     */
    const saveAllTabsAsMultipleIssues = (tabs) => {
        try {
            // Retrieve pages from all tab instances. If the retrieval was 
            // successful then proceed to create new issues, one per page.
            let promises = [];
            tabs.forEach(tab => {
                // Promise to retrieve page.
                const promise = new Promise((resolve, reject) => {
                    tab.getPage()
                        .then(page => {
                            resolve(page);
                        })
                        .catch(err => reject(err));
                });
                promises.push(promise);
            });

            // Retrieve all pages and, if successful, proceed to
            // create comments
            const ghClient = newGithubClient();
            Promise.all(promises).then(pages => {
                promises = [];
                pages.forEach(page => {
                    // Promise to update issue with new comment.
                    const promise = new Promise((resolve, reject) => {
                        const title = page.title;
                        const comment = page.toMarkdown();
                        ghClient.createIssue(
                            title,
                            comment,
                            all.labels,
                            loginUsers(all.assignees)
                        )
                            .then(result => resolve(result))
                            .catch(err => reject(err));
                    })
                    promises.push(promise);
                });
                Promise.all(promises).then(() => {
                    // Set external link to root of Github Issues page
                    const link = Url.join(ghClient.getRepositoryUrl(), "issues");
                    updateActivator({ state: ActivatorState.DONE, label: "Close", link: link });
                }).catch(err => {
                    handleError(err);
                });
            }).catch(err => {
                handleError(err);
            });
        }
        catch (err) {
            handleError(err);
        }
    }

    /**
     * Handles and error condition. Logs the error to the console for 
     * reporting purposes, converts the error into a more user friendly
     * and actionable form, and updates the activator.
     * @param {Object} err An Error instance.
     */
    const handleError = (err) => {
        console.error(err);
        const message = formatError(err);
        updateActivator({ state: ActivatorState.DONE, label: "Close", message: message });
    }

    /**
     * Updates the title/comment fields of the candidate or selects an
     * existing issue.
     * @param {Object} e HTML Event.
     */
    const handleCandidateUpdate = e => {
        if (e.target.name === "select") {
            // The command is "COMMENT" and the user is 
            // interested in appending a comment.
            if (parseInt(e.target.value) === -1) {
                // If '[Find]' was selected as parent issue dispatch to 
                // search dialog.
                handleRouteDispatch(Routes.SEARCH);
            } else {
                const issue = recentIssues.find(issue => {
                    return issue.number === parseInt(e.target.value);
                });
                // Set the parent issue to which the candidate would 
                // be appended to in the form of a comment.
                candidate.parent = issue;
                setCandidate(candidate);
            }
        } else {
            // Update candidate's title or comment text.
            candidate[e.target.name] = e.target.value;
            setCandidate(candidate);
        }
    };

    /**
     * Handles changes to the ALL command's configuration.
     * @param {Object} e HTML Event.
     */
    const handleAllTabsUpdate = e => {
        if (e) {
            switch (e.target.name) {
                case "windowMode":
                    all.windowMode = e.target.checked
                        ? WindowMode.ALL
                        : WindowMode.CURRENT;
                    break;
                case "saveMode":
                    all.saveMode = parseInt(e.target.value)
                        ? SaveMode.MULTI
                        : SaveMode.SINGLE;
                    break;
                default:
            }
        }
        setAll(all);
    };

    /**
     * Dispatches to the specified React route.
     * @param {string} route The route to forward to.
     */
    const handleRouteDispatch = route => {
        const state = {};
        switch (route) {
            case Routes.LABELS:
                state.labels = labelsByCommand();
                break;
            case Routes.ASSIGNEES:
                state.assignees = assigneesByCommand();
                break;
            case Routes.SEARCH:
                break;
            default:
        }
        setCandidate(candidate);
        history.push(route, state);
    };

    /**
     * Processes information sent to this component from another route.
     * This function primarily handles labels and assignees that are sent
     * by the respective routes.
     */
    const processRouteState = () => {
        if (location.state) {
            switch (command) {
                case Action.NEW:
                    location.state.labels &&
                        (candidate.labels = location.state.labels);
                    location.state.assignees &&
                        (candidate.assignees = location.state.assignees);
                    break;
                case Action.COMMENT:
                    location.state.labels &&
                        (candidate.parent.labels = location.state.labels);
                    location.state.assignees &&
                        (candidate.parent.assignees = location.state.assignees);
                    (location.state.labels || location.state.assignees) &&
                        (candidate.parent.dirty = true);
                    break;
                case Action.ALL:
                    location.state.labels &&
                        (all.labels = location.state.labels);
                    location.state.assignees &&
                        (all.assignees = location.state.assignees);
                    break;
                default:
            }
            history.replace(Routes.HOME, null);
        }
    };

    /**
     * Gets the list labels based on the current command.
     * @returns List of labels.
     */
    const labelsByCommand = () => {
        let labels;
        switch (command) {
            case Action.NEW:
                labels = candidate.labels;
                break;
            case Action.COMMENT:
                labels = candidate.parent.labels;
                break;
            case Action.ALL:
                labels = all.labels;
                break;
            default:
        }
        return labels;
    };

    /**
     * Gets the list of assignees based on the current command.
     * @returns List of assignees.
     */
    const assigneesByCommand = () => {
        let assignees;
        switch (command) {
            case Action.NEW:
                assignees = candidate.assignees;
                break;
            case Action.COMMENT:
                assignees = candidate.parent.assignees;
                break;
            case Action.ALL:
                assignees = all.assignees;
                break;
            default:
        }
        return assignees;
    };

    const updateActivator = ({ state = 0, label = "Save", message = "", link = null }) => {
        activatorConfig.state = state;
        activatorConfig.label = label;
        activatorConfig.message = message;
        activatorConfig.link = link;
        setActivatorConfig(() => ({
            ...activatorConfig,
        }));
    };

    useEffect(() => {
        const processCommand = async () => {
            if (command === Action.NEW || command === Action.COMMENT) {
                if (!candidate.title || !candidate.comment) {
                    const tab = await Browser.getActiveTab();
                    const page = await tab.getPage()
                    candidate.title = page.title;
                    candidate.comment = page.toMarkdown();
                    setCandidate(candidate);
                }
            }
            if (command === Action.COMMENT) {
                if (recentIssues.length === 0) {
                    try {
                        const ghClient = newGithubClient();
                        const issues = await ghClient.getRecentIssues();
                        issues.push({ number: -1, title: "[ Search ]" });
                        // Associate the current candidate comment with a
                        // default parent issue
                        candidate.parent = issues[0];
                        setCandidate(candidate);
                        setRecentIssues(issues);
                    }
                    catch (err) {
                        handleError(err);
                    };
                }
            }
        }
        processCommand();
        processRouteState();
    }, [command]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Panel>
            <Header handleRoute={route => handleRouteDispatch(route)} />
            <Body>
                <Command
                    command={command}
                    handleCommandSelection={handleCommandSelection}
                />
                <IssueContent>
                    {command === Action.ALL ? (
                        <AllTabs all={all} handleUpdate={handleAllTabsUpdate} />
                    ) : (
                        <Content
                            issue={candidate}
                            recentIssues={recentIssues}
                            selectedIssueNumber={candidate.parent.number}
                            isComment={command === Action.COMMENT}
                            handleUpdate={handleCandidateUpdate}
                        />
                    )}
                </IssueContent>
                <Labels
                    labels={
                        command === Action.NEW
                            ? candidate.labels
                            : command === Action.COMMENT
                                ? candidate.parent.labels
                                : all.labels
                    }
                    handleRoute={route => handleRouteDispatch(route)}
                />
                <Assignees
                    assignees={
                        command === Action.NEW
                            ? candidate.assignees
                            : command === Action.COMMENT
                                ? candidate.parent.assignees
                                : all.assignees
                    }
                    handleRoute={route => handleRouteDispatch(route)}
                />
                <Repository
                    repository={PersistentStore.getRepository()}
                    handleRoute={route => handleRouteDispatch(route)}
                />
            </Body>
            <Activator
                activatorConfig={activatorConfig}
                activationHandler={handleActivation}
            />
        </Panel>
    );
};

export default Issue;
