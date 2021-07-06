import styled from "styled-components";

const Wrapper = styled.div``;

const StyledRadio = styled.label`
    display: inline-flex;
    align-items: center;
    cursor: pointer;
`;

const Circle = styled.div`
    width: 15px;
    height: 15px;
    border: 1.5px solid #d9d9d9;
    border-radius: 50%;
    box-sizing: border-box;
    padding: 1px;

    &:after {
        display: block;
        content: "";
        width: 100%;
        height: 100%;
        background: #a6a6a6;
        border-radius: 50%;
        transform: scale(0);
    }
`;

const Input = styled.input`
    display: none;

    &:checked + ${Circle} {
        &::after {
            transform: scale(1);
        }
    }
`;

const Radio = ({ name, value, checked, handleCheck }) => {
    return (
        <Wrapper>
            <StyledRadio>
                <Input
                    id={name}
                    name={name}
                    value={value}
                    checked={checked}
                    type="radio"
                    onChange={e => handleCheck(e)}
                />
                <Circle />
            </StyledRadio>
        </Wrapper>
    );
};

export default Radio;
