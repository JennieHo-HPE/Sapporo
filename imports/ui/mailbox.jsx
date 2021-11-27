import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Paper from 'material-ui/Paper';
import { List, ListItem } from 'material-ui/List';
import Dialog from 'material-ui/Dialog';

import FlatButton from 'material-ui/FlatButton';
import MailIcon from 'material-ui/svg-icons/content/mail';
import ReadIcon from 'material-ui/svg-icons/content/drafts';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import { liveFeed } from '../api/db.js';
import { setMailAsRead, isMailRead } from '../library/mail.js';

////const dateOption = {
////    weekday: 'long', year: 'numeric', month: 'short',
////    day: 'numeric', hour: '2-digit', minute: '2-digit'
////};

class Mailbox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false
        };
    }

    renderLiveFeeds () {
        return this.props._liveFeed.map((item, key) => (
            <ListItem
                key={key}
                primaryText={item.title}
                secondaryText={item.date_created.toLocaleString()}
                onTouchTap={this.openFeed.bind(this, item)}
                className="inbox-msg"
                leftIcon={this.hasRead(item)}
            />
        ));
    }

    hasRead (item) {
        return isMailRead(item) ? <ReadIcon/> : <MailIcon />;
    }

    openFeed (item) {
        this.setState({
            dialogOpen: true,
            clickFeed: item
        });
        setMailAsRead(item);
    }

    closeFeed () {
        this.setState({
            dialogOpen: false,
            clickFeed: null
        });
    }

    render () {
        const actions = [
            <FlatButton
                label="exit"
                primary={true}
                onTouchTap={this.closeFeed.bind(this)}
                key="exitButton"
            />
        ];
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <Paper style={{marginTop:'10px'}}>
                        <List>
                            {this.renderLiveFeeds()}
                        </List>
                    {
                        this.state.clickFeed ?
                            <Dialog
                                title={this.state.clickFeed.title}
                                titleStyle={{
                                    lineHeight: '1.2',
                                    maxHeight: '3.6em',
                                    padding: '0',
                                    margin: '0 24px 20px 24px !important',
                                    position: 'relative',
                                    top: '24px',
                                    overflowX: 'auto',
                                    wordBreak: 'break-all'
                                }}
                                actions={actions}
                                modal={false}
                                key="mailDialog"
                                open={this.state.dialogOpen}
                                onRequestClose={this.closeFeed.bind(this)}
                            >
                                <h5>
                                    {
                                        this
                                        .state
                                        .clickFeed
                                        .date_created.toLocaleString()
                                    }
                                </h5>
                                <textarea
                                    value={this.state.clickFeed.content}
                                    style={{
                                        width:'100%',
                                        height:'200px',
                                        maxHeight:'200px',
                                        border:'none',
                                        fontFamily: 'Roboto, sans-serif',
                                        lineHeight: '1.6'
                                    }}
                                    readOnly={true}
                                />
                            </Dialog>
                        : ''
                    }
                </Paper>
            </MuiThemeProvider>
        );
    }
}
Mailbox.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
};
Mailbox.propTypes = {
    _liveFeed: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('liveFeed');
    return {
        _liveFeed: liveFeed.find({}, {sort: {date_created: -1}}).fetch()
    };
}, Mailbox);
