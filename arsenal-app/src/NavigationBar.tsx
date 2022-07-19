import { Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import TableChartIcon from "@mui/icons-material/TableChart";
import clsx from "clsx";
import { Link } from "react-router-dom";

import classes from './NavigationBar.module.scss';

interface NavigationBarProps {
    open: boolean;
    handleDrawerClose: () => void;
}

export function NavigationBar(props: NavigationBarProps) {
    return (
        <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
                [classes.drawerOpen]: props.open,
                [classes.drawerClose]: !props.open,
            })}
            classes={{
                paper: clsx('bg-dark', {
                    [classes.drawerOpen]: props.open,
                    [classes.drawerClose]: !props.open,
                }),
            }}
        >
            <div className={classes.toolbar}>
                <IconButton onClick={props.handleDrawerClose}>
                    <ChevronLeftIcon/>
                </IconButton>
            </div>
            <Divider/>
            <List>
                <ListItem button className="text-base" component={Link} to="/">
                    <ListItemIcon>
                        <EqualizerIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Ribbon Charts" />
                </ListItem>
                <ListItem button className="text-base" component={Link} to="/tables">
                    <ListItemIcon>
                        <TableChartIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Performance Tables" />
                </ListItem>
            </List>
        </Drawer>
    );
}
