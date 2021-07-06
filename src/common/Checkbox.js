import styled from "styled-components";

const Wrapper = styled.label`
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
`;

const Shape = styled.svg`
    fill: none;
    stroke: #a6a6a6;
    stroke-width: 3px;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
`;

const StyledCheckbox = styled.div`
    display: inline-block;
    width: 15px;
    height: 15px;
    background: white;
    border-radius: 3px;
    border: 1.5px solid #d9d9d9;
    transition: all 150ms;

    ${HiddenCheckbox}:focus + & {
        // box-shadow: 0 0 0 3px lightgray;
    }
    ${Shape} {
        visibility: ${props => (props.checked ? "visible" : "hidden")};
    }
`;

const Checkbox = ({ name, checked, handleCheck }) => {
    const handler = e => {
        handleCheck(e);
    };
    return (
        <Wrapper>
            <HiddenCheckbox
                name={name}
                checked={checked}
                onChange={e => handler(e)}
            />
            <StyledCheckbox checked={checked}>
                <Shape viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                </Shape>
            </StyledCheckbox>
        </Wrapper>
    );
};

export default Checkbox;
