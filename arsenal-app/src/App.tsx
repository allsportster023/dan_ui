import {AppBar, CssBaseline, IconButton, Toolbar} from '@mui/material';
import {ThemeProvider, StyledEngineProvider} from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import clsx from 'clsx';
import { useState } from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';
import logo from './logo.png';
import { NavigationBar } from "./NavigationBar";
import { ChartWorkspace, ChartWorkspaceView } from "./pages/ChartWorkspace";
import theme from './theme';

import classes from './App.module.scss';
import HelpIcon from "@mui/icons-material/Help";

export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return <>
        <div className={classes.classificationBanner}
             style={{
                 top: "0",
                 backgroundColor: process.env.REACT_APP_CLASSIFICATION_COLOR
             }}>{process.env.REACT_APP_CLASSIFICATION_TITLE}</div>
        <Router basename={process.env.REACT_APP_BASENAME}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <div className={classes.root}>
                        <CssBaseline/>
                        <AppBar
                            position="fixed"
                            className={clsx(classes.appBar, 'bg-neutral', {
                                [classes.appBarShift]: drawerOpen,
                            })}
                        >
                            <Toolbar>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    onClick={() => setDrawerOpen(true)}
                                    edge="start"
                                    className={clsx(classes.menuButton, 'text-base', {
                                        [classes.hideDrawerButton]: drawerOpen,
                                    })}
                                >
                                    <MenuIcon/>
                                </IconButton>
                                <img src={logo} className={classes.appLogo} alt="logo"/>
                                <a
                                    href={process.env.REACT_APP_APP_URL + '/ArsenalHelp.pdf'}
                                    className={classes.appHelp}
                                    target="_blank"
                                    rel="noreferrer"
                                >Help <HelpIcon className={classes.helpIcon} fontSize={"small"}/></a>
                            </Toolbar>
                        </AppBar>
                        <NavigationBar open={drawerOpen} handleDrawerClose={() => setDrawerOpen(false)} />
                        <main className={classes.content}>
                            <Switch>
                                <Route exact path="/">
                                    <Redirect to="/charts" />
                                </Route>
                                <Route path="/charts/:permalink?">
                                    <ChartWorkspace defaultView={ChartWorkspaceView.RibbonChart} />
                                </Route>
                                <Route path="/tables/:permalink?">
                                    <ChartWorkspace defaultView={ChartWorkspaceView.PerformanceTables} />
                                </Route>
                            </Switch>
                        </main>
                    </div>
                </ThemeProvider>
            </StyledEngineProvider>
        </Router>
        <div className={classes.classificationBanner} style={{
            bottom: "0",
            backgroundColor: process.env.REACT_APP_CLASSIFICATION_COLOR
        }}>{process.env.REACT_APP_CLASSIFICATION_TITLE}</div>
    </>;
}
