import styled from "styled-components";
import Icon from "../common/Icon";
import Url from "../lib/url";
import gitbranch from "../assets/git-branch.svg";

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

const Repository = ({ repository, handleRoute }) => {
    const handleClick = () => {
        handleRoute("/settings");
    };

    return (
        <Wrapper>
            <Button>
                <Icon
                    image={gitbranch}
                    alt="Repository"
                    handleClick={e => handleClick(e)}
                />
            </Button>
            <div>
                <span>{Url.prettier(repository)}</span>
            </div>
        </Wrapper>
    );
};

export default Repository;
