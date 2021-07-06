import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import styled from "styled-components";
import { Activator, createActivatorConfig } from "../activator";
import { PersistentStore } from "../store";
import Header from "./Header";
import Label from "./Label";
import label from "../assets/label.svg";
import Routes from "../routes";

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
    grid-template-columns: 220px 220px;
    max-height: 360px;
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

const LabelWrapper = styled.div`
    margin-left: 45px;
`;

const newActivatorConfig = () => {
    const config = createActivatorConfig();
    config.label = "Done";
    return config;
};

/**
 * Component representing the Labels dialog. The Labels dialog allows 
 * the user to select from a list of labels to be applied to the candidate
 * issue.
 * @returns A rendering of the Label dialog.
 */
const Labels = () => {
    // List of labels to select from.
    const [labels, setLabels] = useState(PersistentStore.getLabels());

    // Custom configuration for the Activator component.
    const [activatorConfig, setActivatorConfig] = useState(
        newActivatorConfig()
    );

    const history = useHistory();
    const location = useLocation();

    /**
     * Sets label as selected when the user clicks on a label.
     * @param {Object} e HTML Event
     */
    const handleSelection = e => {
        labels.find(label => {
            return label.id === parseInt(e.target.value);
        }).selected = e.target.checked;
        setLabels(labels);
        updateActivator({ label: "Apply" });
    };

    /**
     * Handles the button click event from the Activator component.
     * Returns the selected labels to the calling route.
     * @param {Object} e HTML Event
     */
    const handleActivation = e => {
        const selectedLabels = labels.filter(label => {
            return label.selected;
        });
        history.push(Routes.HOME, { labels: selectedLabels });
    };

    const updateActivator = ({ state, label, message }) => {
        state && (activatorConfig.state = state);
        label && (activatorConfig.label = label);
        message && (activatorConfig.message = message);
        setActivatorConfig(() => ({
            ...activatorConfig,
        }));
    };

    useEffect(() => {
        if (location.state) {
            // Select all labels that match those forwarded by the
            // previous route.
            labels.forEach(label => {
                label.selected = location.state.labels.some(l => {
                    return l.id === label.id;
                });
            });
            setLabels(labels);
            history.replace(Routes.LABELS, null);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Panel>
            <Header />
            <Body>
                <Title>
                    <img src={label} alt="Settings" width="32" height="32" />
                    Labels
                </Title>
                <Content>
                    {labels.map(label => {
                        return (
                            <LabelWrapper key={label.id}>
                                <Label
                                    label={label}
                                    selectable={true}
                                    handleSelection={handleSelection}
                                />
                            </LabelWrapper>
                        );
                    })}
                </Content>
            </Body>
            <Activator
                activatorConfig={activatorConfig}
                activationHandler={handleActivation}
            />
        </Panel>
    );
};

export default Labels;
