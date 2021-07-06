import styled from "styled-components";
import open from "../assets/open.svg";
import closed from "../assets/closed.svg";

const Wrapper = styled.div``;

const Radio = styled.label`
    display: grid;
    height: 25px;
    justify-content: left;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
    grid-column-gap: 15px;
    grid-template-columns: 15px 20px 100%;
    cursor: pointer;
`;

const Input = styled.input`
    position: relative;
    top: 2px;
    left: 6px;
    z-index: 1;
    appearance: none;
    transform: rotate(10deg);

    &:checked:before {
        font-size: medium;
        content: "\\2713";
    }
`;

const Label = styled.span`
    width: 380px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const State = styled.img`
    margin-right: 7px;
`;

const Result = ({ name, number, title, state, checked, handleSelection }) => {
    return (
        <Wrapper>
            <Radio>
                <Input
                    type="radio"
                    name={name}
                    value={number}
                    checked={checked}
                    onChange={e => handleSelection(e)}
                />
                {state === "open" ? (
                    <State src={open} alt="Open" width="20" height="20" />
                ) : (
                    <State src={closed} alt="Closed" width="20" height="20" />
                )}
                <Label>{"(#" + number + ") " + title}</Label>
            </Radio>
        </Wrapper>
    );
};

export default Result;
