import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import styled from "styled-components";
import Assignees from "./assignees";
import { Labels } from "./labels";
import Settings from "./settings";
import Search from "./search";
import { PersistentStore } from "./store";

import Issue from "./issue";

const Wrapper = styled.div`
    display: grid;
`;

function App() {
    return (
        <Wrapper>
            <Router>
                <Switch>
                    <Route exact path="/settings">
                        <Settings />
                    </Route>
                    <Route exact path="/labels">
                        <Labels />
                    </Route>
                    <Route exact path="/assignees">
                        <Assignees />
                    </Route>
                    <Route exact path="/search">
                        <Search />
                    </Route>
                    <Route
                        path="/"
                        render={() => {
                            const ghToken = PersistentStore.getGithubToken();
                            const repository = PersistentStore.getRepository();
                            return !ghToken || !repository ? (
                                <Redirect to="/settings" />
                            ) : (
                                <Issue />
                            );
                        }}
                    ></Route>
                </Switch>
            </Router>
        </Wrapper>
    );
}

export default App;

// use exact?
