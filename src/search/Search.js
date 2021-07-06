import { useState } from "react";
import { useHistory } from "react-router";
import styled from "styled-components";
import { Activator, createActivatorConfig, ActivatorState } from "../activator";
import GithubClient from "../lib/github";
import { MemoryStore, PersistentStore } from "../store";
import Header from "./Header";
import Result from "./Result";
import Description from "../common/Description";
import search from "../assets/search.svg";

const Panel = styled.div`
    display: grid;
    grid-template-rows: 10px 480px 55px;
`;

const Body = styled.div`
    display: grid;
    grid-row-gap: 10px;
    margin-left: 10px;
    margin-right: 10px;
    align-items: start;
    grid-template-rows: 90px;
`;

const Title = styled.div`
    display: flex;
    height: 90px;
    justify-content: center;
    align-items: center;
    grid-column-gap: 15px;
    font-size: medium;
`;

const Content = styled.div`
    display: grid;
    grid-row-gap: 15px;
    grid-template-rows: 60px 100%;
`;

const SearchBox = styled.div`
    width: 100%;
    display: grid;
    align-items: center;
    justify-items: center;
    row-gap: 5px;
`;

const Input = styled.input`
    width: 300px;
    height: 18px;
    padding: 4px;
    padding-top: 7.5px;
    padding-bottom: 7.5px;
    border: 0.1px solid #d9d9d9;
    border-radius: 3px;
    outline: none;

    &:focus {
        box-shadow: 0px 0px 1px 2px #eeeeee;
    }
`;

const SearchResults = styled.div`
    max-height: 280px;
    overflow: hidden;
    overflow-y: auto;

    ::-webkit-scrollbar {
        width: 2px;
        background-color: #fbfbfb;
    }

    ::-webkit-scrollbar-track {
        border-radius: 1px;
        box-shadow: inset 0 0 7px rgba(0 0 0 0.25);
        -webkit-box-shadow: inset 0 0 3px rgba(0 0 0 0.25);
    }

    ::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: #f5f5f5;
    }
`;

const newActivatorConfig = () => {
    const config = createActivatorConfig();
    config.label = "Done";
    return config;
};

const newGithubClient = () => {
    const ghClient = new GithubClient(
        PersistentStore.getGithubToken(),
        PersistentStore.getRepository()
    );
    return ghClient;
};

/**
 * Component representing the Search dialog. The Search dialog is used for
 * searching for past issues. Useful when the candidate is a comment to an existing 
 * issue.
 * @returns A rendering of the Search dialog.
 */
const Search = () => {
    // The query string to search for.
    const [query, setQuery] = useState("is:open ");

    // The list of search results.
    const [searchResults, setSearchResults] = useState([]);

    // The issue selected from the list of search results.
    let [selection, setSelection] = useState(0);

    // Custom configuration for the Activator component.
    const [activatorConfig, setActivatorConfig] = useState(
        newActivatorConfig()
    );

    // The candidate issue or comment.
    const [candidate, setCandidate] = MemoryStore(state => [
        state.candidate,
        state.setCandidate,
    ]);

    // The list of recent issues created on Github.
    const [recentIssues, setRecentIssues] = MemoryStore(state => [
        state.recentIssues,
        state.setRecentIssues,
    ]);

    const history = useHistory();

    /**
     * Handles search when the user hits 'enter'. Uses the query
     * string to initiate a remote search request.
     * @param {Object} e HTML Event.
     */
    const handleSearch = e => {
        if (e.key === "Enter") {
            const ghClient = newGithubClient();
            ghClient.search(e.target.value).then(results => {
                setSearchResults(results);
                updateActivator({ state: ActivatorState.ACTIVE });
            });
            updateActivator({ state: ActivatorState.PENDING });
        }
        setQuery(e.target.value);
    };

    /**
     * Store issue selected by user from the list of search results.
     * @param {Object} e HTML Event.
     */
    const handleSelection = e => {
        selection = parseInt(e.target.value);
        setSelection(selection);
        updateActivator({ state: ActivatorState.ACTIVE, label: "Apply" });
    };

    /**
     * Handles the button click event from the Activator component.
     * Sets the parent issue of the candidate and returns to the calling page.
     * @param {Object} e HTML Event.
     */
    const handleActivation = e => {
        const issue = searchResults.find(result => {
            return result.number === selection;
        });
        if (issue) {
            // Add searched issue if it doesn't already exist in
            // list of recent issues.
            if (!recentIssues.some(r => r.number === issue.number)) {
                recentIssues.unshift(issue);
                setRecentIssues(recentIssues);
            }
            // Associate candidate's parent to selected result so that
            // correct parent is shown in home screen.
            candidate.parent = issue;
            setCandidate(candidate);
        }
        history.goBack();
    };

    const updateActivator = ({ state, label, message }) => {
        activatorConfig.state = state;
        label && (activatorConfig.label = label);
        message && (activatorConfig.message = message);
        setActivatorConfig(() => ({
            ...activatorConfig,
        }));
    };

    return (
        <Panel>
            <Header />
            <Body>
                <Title>
                    <img src={search} alt="Search" width="32" height="32" />
                    Search
                </Title>
                <Content>
                    <SearchBox>
                        <Input
                            type="text"
                            name="ghtoken"
                            required
                            value={query}
                            onChange={e => handleSearch(e)}
                            onKeyDown={e => handleSearch(e)}
                        />
                        <Description description={"(enter to search)"} />
                    </SearchBox>
                    <SearchResults>
                        {searchResults.map(result => {
                            return (
                                <Result
                                    name={"result"}
                                    key={result.number}
                                    number={result.number}
                                    title={result.title}
                                    state={result.state}
                                    checked={result.number === selection}
                                    handleSelection={handleSelection}
                                />
                            );
                        })}
                    </SearchResults>
                </Content>
            </Body>
            <Activator
                activatorConfig={activatorConfig}
                activationHandler={handleActivation}
            />
        </Panel>
    );
};

export default Search;
