import { useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { Activator, createActivatorConfig, ActivatorState } from "../activator";
import { PersistentStore } from "../store";
import GithubClient from "../lib/github";
import Header from "./Header";
import Checkbox from "../common/Checkbox";
import Description from "../common/Description";
import gear from "../assets/gear.svg";
import Routes from "../routes";

const Panel = styled.div`
    display: grid;
    grid-template-rows: 10px 480px 55px;
`;

const Body = styled.div`
    display: grid;
    grid-row-gap: 10px;
    margin-left: 20px;
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
    grid-row-gap: 20px;
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: 100px 320px;
    align-items: center;
`;

const Heading = styled.h5`
    padding-bottom: 5px;
`;

const Input = styled.input`
    width: 98%;
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

const CheckboxWrapper = styled.div`
    display: flex;
    column-gap: 10px;
`;

const newActivatorConfig = () => {
    const config = createActivatorConfig();
    config.label = "Done";
    return config;
};

/**
 * Component representing the Settings dialog. The Settings dialog allows the
 * user to set the remote repository and authentication token to name a few.
 * @returns A rendering of the Settings dialog.
 */
const Settings = () => {

    // The Personal Access Token.
    const [ghToken, setGithubToken] = useState(
        PersistentStore.getGithubToken() ?? ""
    );

    // The remote repository URL.
    const [repository, setRepository] = useState(
        PersistentStore.getRepository() ?? ""
    );

    // Option to resync with the remote repository.
    const [resync, setResync] = useState(false);

    // Indicates whether any of the settings was changed by he user.
    const [dirty, setDirty] = useState(false);

    // Custom configuration for the Activator component.
    const [activatorConfig, setActivatorConfig] = useState(
        newActivatorConfig()
    );
    const history = useHistory();

    const updateState = e => {
        switch (e.target.name) {
            case "ghtoken":
                setGithubToken(e.target.value);
                break;
            case "repository":
                setRepository(e.target.value);
                break;
            case "resync":
                setResync(e.target.checked);
                break;
            default:
                break;
        }
        setDirty(true);
        updateActivator({ state: ActivatorState.ACTIVE, label: "Apply" });
    };

    const handleActivation = async () => {
        try {
            if (dirty) {
                let [valid, error] = GithubClient.validPersonalAccessTokenFormat(ghToken);
                if (!valid) {
                    throw new Error(error);
                }

                [valid, error] = GithubClient.validRepositoryUrlFormat(repository);
                if (!valid) {
                    throw new Error(error);
                }

                updateActivator({ state: ActivatorState.PENDING, message: "" });

                // If remote repository exists, save access token and repository url
                const ghClient = new GithubClient(ghToken, repository);
                const repo = await ghClient.getRemoteRepository();
                PersistentStore.setGithubToken(ghToken);
                PersistentStore.setRepository(repository);

                // If the resync checkbox was selected, refresh the labels and
                // and assignees and persist locally.
                if (resync) {
                    const labels = await ghClient.getLabels();
                    PersistentStore.setLabels(labels);

                    const assignees = await ghClient.getAssignees();
                    PersistentStore.setAssignees(assignees);
                }
            }
            history.push(Routes.HOME);
        } catch (err) {
            // Print error to console for error reporting purposes.
            console.error(err);

            // Replace error messages with more meaningful ones.
            let message = err.message;
            switch (err.message) {
                case "Not Found":
                    message = "Repository not found";
                    break;
                case "Bad credentials":
                    message = "Bad credentials, use a valid access token";
                    break;
                default:
                    break;
            }
            updateActivator({ state: ActivatorState.ACTIVE, message: message });
        }
    };

    const updateActivator = ({ state = 0, label = "Apply", message = "" }) => {
        activatorConfig.state = state;
        activatorConfig.label = label;
        activatorConfig.message = message;
        setActivatorConfig(() => ({
            ...activatorConfig,
        }));
    };

    return (
        <Panel>
            <Header />
            <Body>
                <Title>
                    <img src={gear} alt="Settings" width="32" height="32" />
                    Settings
                </Title>
                <Content>
                    <Row>
                        <Heading>Access Token</Heading>
                        <Input
                            type="password"
                            name="ghtoken"
                            required
                            value={ghToken}
                            onChange={e => updateState(e)}
                        />
                    </Row>
                    <Row>
                        <Heading>Repository</Heading>
                        <Input
                            type="text"
                            name="repository"
                            required
                            value={repository}
                            onChange={e => updateState(e)}
                        />
                    </Row>
                    <Row>
                        <Heading>Resync</Heading>
                        <CheckboxWrapper>
                            <Checkbox
                                name="resync"
                                checked={resync}
                                handleCheck={updateState}
                            />
                            <Description
                                description={
                                    "(refreshs labels, assignees and other meta-data)"
                                }
                            />
                        </CheckboxWrapper>
                    </Row>
                </Content>
            </Body>
            <Activator
                activatorConfig={activatorConfig}
                activationHandler={handleActivation}
            />
        </Panel>
    );
};

export default Settings;
