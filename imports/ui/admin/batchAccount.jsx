import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { createContainer } from 'meteor/react-meteor-data';
import { batchAccount } from '../../api/db.js';
import {goPage} from '../goPage.js';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { List, ListItem } from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

class BatchAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            batchTotal: 0,
            accountPrefix: 'team',
            importUrl: '',
            sapporoSecret: ''
        };
    }

    updateBatchData (field, event) {
        let state = this.state;
        state[field] = event.target.value;
        this.setState(state);
    }

    importAccounts() {
        if (!this.state.importUrl || this.state.importUrl == '') {
            alert('Import URL cannot be empty');
            return;
        }
        if (!this.state.sapporoSecret || this.state.sapporoSecret == '') {
            alert('Sapporo secret cannot be empty');
            return;
        }
        Meteor.call(
            'user.importAccounts',
            this.state.importUrl,
            this.state.sapporoSecret,
            function (err) {
                if (err) {
                    alert('Importing users failed: ' + err.reason);
                } else {
                    alert('Imported all users!');
                }
            }
        );
    }

    batchCreate () {
        for (var key =0; key < this.state.batchTotal; key++) {
            let username = this.state.accountPrefix + '_' + key.toString();
            let password =  Random.id(6);
            Meteor.call('user.batchCreate', username, password ,function (err) {
                if (err) {
                    alert(username + ': ' + err.reason);
                }
            });
        }
    }

    removeAll() {
        goPage('login');
        Meteor.call('user.removeAll', function (err) {
            if (err) {
                alert(err);
            }
        });
    }

    renderBatchAccounts () {
        return this.props._batchAccount.map((item, key) => {
            return (
                <ListItem
                    key={key}
                    primaryText={item.username}
                    secondaryText={item.password}
                />
            );
        });
    }

    render () {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <div>
                    <div>
                        <h5>Create a batch of accounts</h5>
                        <TextField
                            type="text"
                            id="accountName"
                            floatingLabelText="Account Prefix"
                            value={this.state.accountPrefix}
                            onChange={
                                this
                                .updateBatchData
                                .bind(this, 'accountPrefix')
                            }
                        />
                        <TextField
                            type="number"
                            min="0"
                            floatingLabelText="Total"
                            value={this.state.batchTotal}
                            onChange={
                                this.updateBatchData.bind(this, 'batchTotal')
                            }
                            id="batchTotal"
                        />
                        <RaisedButton
                            label="Create"
                            primary={true}
                            onTouchTap={this.batchCreate.bind(this)}
                        />
                    </div>
                    <div>
                        <h5>Import a batch of accounts from registration</h5>
                        <TextField
                            type="text"
                            id="importUrl"
                            floatingLabelText="Import URL"
                            onChange={
                                this.updateBatchData.bind(this, 'importUrl')
                            }
                        />
                        <TextField
                            type="text"
                            id="sapporoSecret"
                            floatingLabelText="Sapporo secret"
                            onChange={
                                this.updateBatchData.bind(this, 'sapporoSecret')
                            }
                        />
                        <RaisedButton
                            label="Import"
                            primary={true}
                            onTouchTap={this.importAccounts.bind(this)}
                        />
                    </div>
                    <div>
                        <RaisedButton
                            label="Remove All User Data"
                            secondary={true}
                            onTouchTap={this.removeAll.bind(this)}
                        />
                    </div>
                    <div>
                        <h5>Batch created accounts</h5>
                        <List>
                            {this.renderBatchAccounts()}
                        </List>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}
BatchAccount.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
};
BatchAccount.propTypes = {
    _batchAccount: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('batchAccount');
    return {
        _batchAccount: batchAccount.find({}).fetch()
    };
}, BatchAccount);
