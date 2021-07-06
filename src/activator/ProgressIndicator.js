import styled, { keyframes } from "styled-components";

const Rotate = keyframes`
    100% {
        transform: rotate(360deg);
    }
`;

const CircularProgressIndicator = styled.div`
    display: inline-block;
    width: 22px;
    height: 22px;
    border: 2px solid #f5f5f5;
    border-top: 2px solid #c00000;
    border-radius: 50%;
    animation: ${Rotate} 1s linear infinite;
`;

const ProgressIndicator = () => {
    return <CircularProgressIndicator />;
};

export default ProgressIndicator;
