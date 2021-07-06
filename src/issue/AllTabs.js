import { useEffect } from "react";
import styled from "styled-components";
import { Browser } from "../lib/browser";
import Checkbox from "../common/Checkbox";
import Radio from "../common/Radio";
import Description from "../common/Description";
import Url from "../lib/url";

const Wrapper = styled.div``;

const Table = styled.div`
    display: grid;
    grid-row-gap: 15px;
`;

const Fact = styled.div`
    display: grid;
    grid-column-gap: 20px;
    grid-template-columns: 25% 70%;
`;

const Title = styled.span`
    font-weight: 600;
    justify-self: left;
`;

const Value = styled.span`
    padding-right: 10px;
`;

const SaveOptions = styled.div`
    display: grid;
    grid-template-columns: 8% 90%;
    align-items: flex-end;
    grid-row-gap: 5px;
`;

function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return seconds + " sec";
    else if (minutes < 60) return minutes + " min";
    else if (hours < 24) return hours + " hrs";
    else return days + " days";
}

const WindowMode = {
    CURRENT: 0,
    ALL: 1,
};

const SaveMode = {
    SINGLE: 0,
    MULTI: 1,
};

const AllTabs = ({ all, handleUpdate }) => {
    console.log("alltabs");
    useEffect(() => {
        if (Browser.isContextExtension()) {
            if (
                (all.windowMode === WindowMode.CURRENT &&
                    all.currentWindow.tabs.length === 0) ||
                (all.windowMode === WindowMode.ALL &&
                    all.allWindows.tabs.length === 0)
            ) {
                Browser.getAllTabs(all.windowMode === WindowMode.CURRENT).then(
                    tabs => {
                        const validTabs = tabs.filter(tab => {
                            return Url.valid(tab.url);
                        });

                        if (all.windowMode === WindowMode.CURRENT) {
                            all.currentWindow.tabs = validTabs;
                            all.currentWindow.filtered =
                                tabs.length - validTabs.length;
                        } else {
                            all.allWindows.tabs = validTabs;
                            all.allWindows.filtered =
                                tabs.length - validTabs.length;
                        }

                        document.addEventListener("alltabs", handleUpdate);
                        document.dispatchEvent(new Event("alltabs"));

                        Promise.all(
                            validTabs.map(tab => {
                                return tab.getRunningTime();
                            })
                        ).then(values => {
                            let time = values.reduce((totalTime, value) => {
                                return totalTime + (Date.now() - value);
                            }, 0);

                            if (all.windowMode === WindowMode.CURRENT) {
                                all.currentWindow.runningTime = msToTime(time);
                            } else {
                                all.allWindows.runningTime = msToTime(time);
                            }

                            document.addEventListener("alltabs", handleUpdate);
                            document.dispatchEvent(new Event("alltabs"));
                        });
                    }
                );
            }
        }
    });

    return (
        <Wrapper>
            <Table>
                <Fact>
                    <Title>Tabs</Title>
                    <Value>
                        {all.windowMode === WindowMode.CURRENT
                            ? all.currentWindow.tabs.length
                            : all.allWindows.tabs.length}
                    </Value>
                </Fact>
                <Fact>
                    <Title>Filtered</Title>
                    <Value>
                        {all.windowMode === WindowMode.CURRENT
                            ? all.currentWindow.filtered
                            : all.allWindows.filtered}
                    </Value>
                </Fact>
                <Fact>
                    <Title>All Windows</Title>
                    <Value>
                        <Checkbox
                            name="windowMode"
                            checked={all.windowMode}
                            handleCheck={handleUpdate}
                        />
                    </Value>
                </Fact>
                <Fact>
                    <Title>Save Mode</Title>
                    <Value>
                        <SaveOptions>
                            <Radio
                                name="saveMode"
                                type="radio"
                                value={SaveMode.SINGLE}
                                checked={all.saveMode === SaveMode.SINGLE}
                                handleCheck={handleUpdate}
                            />
                            <div>
                                <Value>Single</Value>
                                <Description
                                    description={
                                        "(one issue with a comment per tab)"
                                    }
                                />
                            </div>
                            <Radio
                                name="saveMode"
                                type="radio"
                                value={SaveMode.MULTI}
                                checked={all.saveMode === SaveMode.MULTI}
                                handleCheck={handleUpdate}
                            />
                            <div>
                                <Value>Multiple</Value>
                                <Description
                                    description={"(an issue per tab)"}
                                />
                            </div>
                        </SaveOptions>
                    </Value>
                </Fact>
                <Fact>
                    <Title>Stats:</Title>
                    <div>
                        <Value>
                            Accumulated time:{" "}
                            {all.windowMode === WindowMode.CURRENT
                                ? all.currentWindow.runningTime
                                : all.allWindows.runningTime}
                        </Value>
                    </div>
                </Fact>
            </Table>
        </Wrapper>
    );
};

export { AllTabs, WindowMode, SaveMode };
