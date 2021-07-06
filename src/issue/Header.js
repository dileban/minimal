import styled from "styled-components";
import Description from "../common/Description";
import Icon from "../common/Icon";
import gear from "../assets/gear.svg";

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 425px 25px;
    padding-top: 5px;
    margin-left: 5px;
    margin-right: 5px;
`;

const Message = styled.div`
    justify-self: left;
`;

const Header = ({ handleRoute }) => {
    const handleClick = () => {
        handleRoute("/settings");
    };

    return (
        <Wrapper>
            <Message>
                <Description description="" />
            </Message>
            <Icon
                image={gear}
                alt="Settings"
                handleClick={e => handleClick(e)}
            />
        </Wrapper>
    );
};

export default Header;
