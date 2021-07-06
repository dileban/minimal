import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import styled from "styled-components";
import { Activator, createActivatorConfig } from "../activator";
import { PersistentStore } from "../store";
import Header from "./Header";
import Person from "./Person";
import person from "../assets/person.svg";
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
`;

const AssigneeWrapper = styled.div`
    margin-left: 45px;
`;

const newActivatorConfig = () => {
    const config = createActivatorConfig();
    config.label = "Done";
    return config;
};

/**
 * Component representing the Assignees dialog. The Assignees dialog allows 
 * the user to select from a list of assignees to be applied to the candidate
 * issue.
 * @returns A rendering of the Assignees dialog.
 */
const Assignees = () => {
    // List of assignees to select from.
    const [assignees, setAssignees] = useState(PersistentStore.getAssignees());

    // Custom configuration for the Activator component.
    const [activatorConfig, setActivatorConfig] = useState(
        newActivatorConfig()
    );

    const history = useHistory();
    const location = useLocation();

    /**
     * Sets assignee as selected when the user clicks on an assignee.
     * @param {Object} e HTML Event
     */
    const handleSelection = e => {
        assignees.find(assignee => {
            return assignee.id === parseInt(e.target.value);
        }).selected = e.target.checked;
        setAssignees(assignees);
        updateActivator({ label: "Apply" });
    };

    /**
     * Handles the button click event from the Activator component.
     * Returns the selected assignees to the calling route.
     * @param {Object} e HTML Event
     */
    const handleActivation = e => {
        const selectedAssignees = assignees.filter(assignee => {
            return assignee.selected;
        });
        history.push(Routes.HOME, { assignees: selectedAssignees });
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
            // Select all assignees that match those forwarded by the
            // previous route.
            assignees.forEach(assignee => {
                assignee.selected = location.state.assignees.some(a => {
                    return a.id === assignee.id;
                });
            });
            setAssignees(assignees);
            history.replace(Routes.ASSIGNEES, null);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Panel>
            <Header />
            <Body>
                <Title>
                    <img src={person} alt="Assignees" width="32" height="32" />
                    Assignees
                </Title>
                <Content>
                    {assignees.map(assignee => {
                        return (
                            <AssigneeWrapper key={assignee.id}>
                                <Person
                                    person={assignee}
                                    handleSelection={handleSelection}
                                />
                            </AssigneeWrapper>
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

export default Assignees;
