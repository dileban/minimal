import styled from "styled-components";
import Icon from "../common/Icon";
import person from "../assets/person.svg";

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 7% 90%;
    align-items: center;
`;

const Button = styled.div`
    display: flex;
    justify-items: left;
    align-items: center;
    width: 25px;
    height: 25px;
`;

const AssigneeList = styled.div`
    display: flex;
    grid-column-gap: 5px;
    flex-direction: row;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: hidden;
    // mask-image: linear-gradient(90deg, #000 98%, transparent);
`;

const Assignees = ({ assignees, handleRoute }) => {
    const handleClick = () => {
        handleRoute("/assignees");
    };

    return (
        <Wrapper>
            <Button>
                <Icon
                    image={person}
                    alt="Assignees"
                    handleClick={e => handleClick(e)}
                />
            </Button>
            <AssigneeList>
                {assignees.map((assignee, index) => {
                    return (index ? ", " : "") + assignee.login;
                })}
            </AssigneeList>
        </Wrapper>
    );
};

export default Assignees;
