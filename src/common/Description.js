import styled from "styled-components";

const Wrapper = styled.span`
    font-size: small;
    color: #a6a6a6;
`;

const Description = ({ description }) => {
    return <Wrapper>{description}</Wrapper>;
};

export default Description;
