import styled from "styled-components";

const Wrapper = styled.label`
    display: flex;
    position: relative;
    align-items: center;
    justify-items: left;
    flex-grow: 0;
    flex-shrink: 0;
    cursor: pointer;
`;

const StyledPerson = styled.div`
    display: flex;
    grid-column-gap: 12px;
    cursor: "pointer";
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
    justify-content: center;
    align-items: center;
`;

const Checkbox = styled.input`
    position: absolute;
    top: 2px;
    left: -25px;
    z-index: 1;
    appearance: none;
    transform: rotate(10deg);

    &:checked:before {
        font-size: medium;
        content: "\\2713";
    }
`;

const Avatar = styled.img`
    border-radius: 50%;
    border: 1px solid #f2f2f2;
    width: 25px;
    height: 25px;
    src: ${props => props.src};
`;

const Person = ({ person, handleSelection }) => {
    return (
        <Wrapper>
            <Checkbox
                type="checkbox"
                checked={person.selected ? true : false}
                value={person.id}
                onChange={handleSelection}
            ></Checkbox>
            <StyledPerson>
                <Avatar src={person.avatar_url} />
                {person.login}
            </StyledPerson>
        </Wrapper>
    );
};

export default Person;
