import styled from "styled-components";

const Wrapper = styled.div``;

const Img = styled.img`
    cursor: pointer;
    &:hover {
        transform: scale(1.1);
    }
`;

const Icon = ({ image, alt, handleClick }) => {
    return (
        <Wrapper>
            <Img
                src={image}
                width="22"
                height="22"
                alt={alt}
                onClick={handleClick}
            />
        </Wrapper>
    );
};

export default Icon;
