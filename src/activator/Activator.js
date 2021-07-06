import styled from "styled-components";
import Description from "../common/Description";
import ExternalLink from "./ExternalLink";
import ProgressIndicator from "./ProgressIndicator";

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 70% 15% 15%;
    height: 35px;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    align-items: center;
    justify-items: right;
`;

const Status = styled.div`
    display: flex;
    justify-items: left;
    align-items: center;
    width: 100%;
    height: 30px;
`;

const Link = styled.div`
    display: flex;
    justify-items: center;
    align-items: center;
    width: 30px;
    height: 30px;
`;

const Action = styled.div`
    justify-self: right;
`;

const Button = styled.button`
    background-color: #cc2a49;
    border: none;
    cursor: pointer;
    color: #ffffff;
    height: 35px;
    width: 60px;
    border-radius: 3px;
    justify-content: right;

    &:active {
        transform: scale(0.98);
        box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.24);
    }
`;

const ActivatorState = {
    ACTIVE: 0,
    PENDING: 1,
    FAIL: 2,
    DONE: 3,
};

const createActivatorConfig = () => {
    return {
        state: ActivatorState.ACTIVE,
        label: null,
        link: null,
        message: null,
    };
};

const Activator = ({ activatorConfig, activationHandler }) => {
    return (
        <Wrapper>
            <Status>
                {activatorConfig.state === ActivatorState.PENDING && (
                    <ProgressIndicator />
                )}
                {activatorConfig.message && (
                    <Description description={activatorConfig.message} />
                )}
            </Status>
            <Link>{activatorConfig.link != null && <ExternalLink link={activatorConfig.link} />}</Link>
            <Action>
                <Button onClick={() => activationHandler()}>
                    {activatorConfig.label}
                </Button>
            </Action>
        </Wrapper>
    );
};

export { Activator, createActivatorConfig, ActivatorState };
