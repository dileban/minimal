import styled from "styled-components";
import Icon from "../common/Icon";
import linkImg from "../assets/link.svg";

const Link = styled.div`
    justify-self: center;
    align-self: center;
    width: 22px;
    height: 22px;
`;

const ExternalLink = ({ link }) => {
    return (
        <Link>
            <a href={link} target="_blank" rel="noreferrer">
                <Icon image={linkImg} alt="Open in Github" />
            </a>
        </Link>
    );
};

export default ExternalLink;
