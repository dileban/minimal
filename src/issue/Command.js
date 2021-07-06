import styled from "styled-components";
import newissue from "../assets/new.svg";
import comment from "../assets/comment.svg";
import rocket from "../assets/all.svg";

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 20px;
    grid-column-gap: 15px;
`;

const Button = styled.span`
    display: grid;
    grid-row-gap: 5px;
    width: 80px;
    height: 50px;
    border: 3px solid transparent;
    border-radius: 4px;
    box-shadow: 0 0 3px #d9d9d9;
    justify-content: center;
    align-items: center;
    padding: 5px;
`;

const Input = styled.input`
    display: none;
    &:checked + ${Button} {
        border: 3px solid #d9d9d9;
    }
`;

const Icon = styled.img`
    justify-self: center;
`;

/*
  @enum
*/
const Action = {
    NEW: 0,
    COMMENT: 1,
    ALL: 2,
};

const Command = ({ command, handleCommandSelection }) => {
    return (
        <Wrapper>
            <label>
                <Input
                    type="radio"
                    name="command"
                    value={Action.NEW}
                    checked={command === Action.NEW}
                    onChange={handleCommandSelection}
                />
                <Button>
                    <Icon
                        src={newissue}
                        width="24"
                        height="24"
                        alt="Create Issue"
                    />
                    <span>New</span>
                </Button>
            </label>
            <label>
                <Input
                    type="radio"
                    name="command"
                    value={Action.COMMENT}
                    checked={command === Action.COMMENT}
                    onChange={handleCommandSelection}
                />
                <Button>
                    <Icon
                        src={comment}
                        width="24"
                        height="24"
                        alt="Create Issue"
                    />
                    <span>Comment</span>
                </Button>
            </label>
            <label>
                <Input
                    type="radio"
                    name="command"
                    value={Action.ALL}
                    checked={command === Action.ALL}
                    onChange={handleCommandSelection}
                />
                <Button>
                    <Icon
                        src={rocket}
                        width="24"
                        height="24"
                        alt="Create Issue"
                    />
                    <span>All</span>
                </Button>
            </label>
        </Wrapper>
    );
};

export { Action, Command };
