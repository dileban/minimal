import styled from "styled-components";
import Icon from "../common/Icon";
import { Label } from "../labels";
import label from "../assets/label.svg";

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

const LabelList = styled.div`
    display: flex;
    grid-column-gap: 5px;
    flex-direction: row;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: hidden;
    mask-image: linear-gradient(90deg, #000 98%, transparent);

    &:after {
        align-self: flex-end;
        content: "...";
        color: red;
        position: relative;
        font-size: x-large;
        position: absolute;
        top: 10px;
    }
`;

const Labels = ({ labels, handleRoute }) => {
    const handleClick = () => {
        handleRoute("/labels");
    };

    return (
        <Wrapper>
            <Button>
                <Icon
                    image={label}
                    alt="Label"
                    handleClick={e => handleClick(e)}
                />
            </Button>
            <LabelList image={label}>
                {labels.map(label => {
                    return <Label key={label.id} label={label} />;
                })}
            </LabelList>
        </Wrapper>
    );
};

export default Labels;
