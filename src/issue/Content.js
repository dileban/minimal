import styled from "styled-components";

const Wrapper = styled.div`
    display: grid;
    grid-row-gap: 10px;
`;

const TitleRow = styled.div`
    height: 55px;
`;

const Heading = styled.h5`
    padding-bottom: 5px;
`;

const Title = styled.input`
    width: 98%;
    height: 18px;
    padding: 4px;
    padding-top: 7.5px;
    padding-bottom: 7.5px;
    border: 0.1px solid #d9d9d9;
    border-radius: 3px;
    outline: none;

    &:focus {
        box-shadow: 0px 0px 1px 2px #eeeeee;
    }
`;

const Select = styled.select`
    width: 100%;
    height: 34.34px;
    padding-top: 7.5px;
    padding-bottom: 7.5px;
    border: 0.1px solid #d9d9d9;
    border-radius: 3px;
    outline: none;
    cursor: pointer;

    &:focus {
        box-shadow: 0px 0px 1px 2px #eeeeee;
    }
`;

const CommentRow = styled.div`
    height: 175px;
`;

const Comment = styled.textarea`
    width: 98%;
    height: 140px;
    padding: 4px;
    border: 0.1px solid #d9d9d9;
    border-radius: 3px;
    outline: none;
    font-family: inherit;

    &:focus {
        box-shadow: 0px 0px 1px 2px #eeeeee;
    }

    ::-webkit-scrollbar {
        width: 7px;
        background-color: #f5f5f5;
    }

    ::-webkit-scrollbar-track {
        border-radius: 3px;
        box-shadow: inset 0 0 7px rgba(0 0 0 0.25);
        -webkit-box-shadow: inset 0 0 3px rgba(0 0 0 0.25);
    }

    ::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: #7e7e7e;
    }
`;

const Content = ({
    issue,
    recentIssues,
    selectedIssueNumber,
    isComment,
    handleUpdate,
}) => {
    return (
        <Wrapper>
            <TitleRow>
                <Heading>Title</Heading>
                {isComment ? (
                    <Select
                        name="select"
                        value={selectedIssueNumber}
                        onChange={e => handleUpdate(e)}
                    >
                        {recentIssues.map(issue => {
                            return (
                                <option key={issue.number} value={issue.number}>
                                    {issue.title.substring(0, 52) +
                                        (issue.number > 0
                                            ? " (#" + issue.number + ")"
                                            : "")}
                                </option>
                            );
                        })}
                    </Select>
                ) : (
                    <Title
                        type="text"
                        name="title"
                        required
                        value={issue.title}
                        onChange={e => handleUpdate(e)}
                    ></Title>
                )}
            </TitleRow>
            <CommentRow>
                <Heading>Comment</Heading>
                <Comment
                    name="comment"
                    required
                    value={issue.comment}
                    onChange={e => handleUpdate(e)}
                />
            </CommentRow>
        </Wrapper>
    );
};

export default Content;
