import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import { List, ListItem } from 'material-ui/List';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import { liveFeed } from '../../api/db.js';

////const dateOption = {
////    weekday: 'long', year: 'numeric', month: 'short',
////    day: 'numeric', hour: '2-digit', minute: '2-digit'
////};

class LiveFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false
        };
    }

    updateField (field, event) {
        let tmp = this.state;
        tmp[field] = event.target.value;
        this.setState(tmp);
    }

    sendLiveFeed () {
        Meteor.call('liveFeed.add', {
            title: this.state.title,
            content: this.state.content
        }, (err) => {
            if (err) {
                alert(err);
            }
        });
        this.setState({
            title:  '',
            content: ''
        });
    }

    renderLiveFeeds () {
        return this.props._liveFeed.map((item, key) => (
            <ListItem
                key={key}
                className="msg-list"
                primaryText={item.title}
                secondaryText={item.content}
                onTouchTap={this.openFeed.bind(this, item)}
            />
        ));
    }

    openFeed (item) {
        this.setState({
            dialogOpen: true,
            clickFeed: item
        });
    }

    closeFeed () {
        this.setState({
            dialogOpen: false,
            clickFeed: null
        });
    }

    deleteFeed () {
        Meteor.call('liveFeed.delete', this.state.clickFeed, function (err) {
            if (err) {
                alert(err);
            }
        });
        this.closeFeed();
    }

    render () {
        const actions = [
            <FlatButton
                label="delete"
                secondary={true}
                onTouchTap={this.deleteFeed.bind(this)}
            />,
            <FlatButton
                label="exit"
                primary={true}
                onTouchTap={this.closeFeed.bind(this)}
            />
        ];
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <div>
                    <div style={{width: '49%', float:'left'}}>
                        <TextField
                            type="text"
                            floatingLabelText="Title"
                            name="title"
                            style={{width: '100%'}}
                            onChange={this.updateField.bind(this, 'title')}
                            value={this.state.title}
                        />
                        <TextField
                            type="text"
                            floatingLabelText="Content"
                            style={{width: '100%'}}
                            multiLine={true}
                            name="content"
                            rows={4}
                            value={this.state.content}
                            onChange={this.updateField.bind(this, 'content')}
                        />
                        <RaisedButton
                            label="Send"
                            primary={true}
                            onTouchTap={this.sendLiveFeed.bind(this)}
                        />
                    </div>
                    <Paper
                        style={{
                            width: '49%',
                            float: 'right',
                            marginTop: '10px'
                        }}
                        zDepth={1}
                    >
                        <List>
                            {this.renderLiveFeeds()}
                        </List>
                    </Paper>
                    {this.state.clickFeed ?
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
                                    width: '100%',
                                    height: '200px',
                                    fontFamily: 'Roboto, sans-serif',
                                    lineHeight: '1.6'
                                }}
                                readOnly={true}
                            />
                        </Dialog> : ''
                    }
                </div>
            </MuiThemeProvider>
        );
    }
}
LiveFeed.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
};
LiveFeed.propTypes = {
    _liveFeed: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('liveFeed');
    return {
        _liveFeed: liveFeed.find({}, {sort: {date_created: -1}}).fetch()
    };
}, LiveFeed);
