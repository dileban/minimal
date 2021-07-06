import styled from "styled-components";
import { Color } from "../lib/color";

import React from "react";

const Wrapper = styled.label`
    display: flex;
    position: relative;
    align-items: center;
    justify-items: left;
    flex-grow: 0;
    flex-shrink: 0;
`;

const StyledLabel = styled.div`
    background-color: ${props => props.backgroundColor};
    border-radius: 5px;
    border: ${props =>
        props.backgroundColor === "#ffffff" ? "solid #d9d9d9 1px" : "none"};
    cursor: ${props => (props.selectable ? "pointer" : "default")};
    color: ${props => props.color};
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
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

const Label = ({ label, selectable = false, handleSelection }) => {
    return (
        <Wrapper>
            {selectable && (
                <Checkbox
                    type="checkbox"
                    checked={label.selected ? true : false}
                    value={label.id}
                    onChange={handleSelection}
                ></Checkbox>
            )}
            <StyledLabel
                backgroundColor={"#" + label.color}
                color={"#" + Color.foregroundColorFromBackground(label.color)}
                selectable={selectable}
            >
                {label.name}
            </StyledLabel>
        </Wrapper>
    );
};

export default Label;
