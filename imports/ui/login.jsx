import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';

import { sapporo } from '../api/db.js';
import {goPage} from './goPage.js';

import TextField from 'material-ui/lib/text-field';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

const mainImageStyle = {
    marginTop:'10px',
    height: '500px',
    backgroundImage: 'url(/images/cwinprogress.jpg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    lineHeight: '500px',
    textAlign: 'center'
};

const readyStyle = {
    fontSize: '100px',
    border: '10px solid #00BCD4',
    color: ' #00BCD4',
    padding: '25px 50px'
};

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            stafflogin: false,
            loginErrMsg: ""
        };
    }
    updateUsername(event) {
        this.setState({username: event.target.value});
    }
    updatePassword(event) {
        this.setState({password: event.target.value});
    }
    checkUser (callback) {
        Meteor.call('user.check', Meteor.user()._id, Meteor.user().username, (err) => {
            if (err) {
                this.renderErrMsg(err);
            } else if (callback) {
                callback();
            }
        });
    }
    openStaffLogin () {
        this.setState({
            stafflogin: true
        });
    }
    closeStaffLogin () {
        this.setState({
            stafflogin: false,
            loginErrMsg: ""
        });
    }
    renderErrMsg (err){
        this.setState({
            loginErrMsg: err.reason || 'Unknow login error'
        });
    }
    loginStaff () {
        Meteor.loginWithPassword(this.state.username, this.state.password, (err) => {
            if (err) {
                this.renderErrMsg(err);
            } else {
                this.checkUser(()=>{
                    if (Meteor.user()) {
                        goPage('dashboard');
                    }
                });
            }
        });
    }
    createStaff () {
        Accounts.createUser({
            username: this.state.username,
            password: this.state.password
        }, (err) => {
            if (err) {
                this.renderErrMsg(err);
            } else {
                this.loginStaff();
            }
        });
    }
    loginOauth () {
        Meteor.loginWithMeteorOAuth2Server({}, (err) => {
            if (err) {
                this.renderErrMsg(err);
            } else {
                this.checkUser();
            }
        });
    }
    removeOauth () {
        Meteor.call('resetServiceConfiguration');
    }
    loginFacebook () {
        Meteor.loginWithFacebook({}, (err) => {
            if (err) {
                this.renderErrMsg(err);
            } else {
                this.checkUser();
            }
        });
    }
    componentDidUpdate() {
        if (Meteor.user()) {
            console.log('go dashboard');
            goPage('dashboard');
        }
    }
    render () {
        // Hide following login method for now
        //<RaisedButton style={loginButton} label="CodeWars Passport" primary={true} onTouchTap={this.loginOauth.bind(this)}/>
        //<RaisedButton style={loginButton} label="Facebook"          secondary={true} onTouchTap={this.loginFacebook.bind(this)}/>
        return (
            <div>
                <div style={mainImageStyle}>
                    <div style={{width:'100%', height:'500px', backgroundColor:'rgba(0,0,0,0.6)'}}>
                            <span className="hoverItem" style={readyStyle} onTouchTap={this.openStaffLogin.bind(this)}>Ready?</span>
                    </div>
                </div>
                <Dialog modal={false} open={this.state.stafflogin} onRequestClose={this.closeStaffLogin.bind(this)}>
                    <div style={{width:'90%', marginLeft:'5%'}}>
                        <TextField floatingLabelText="User Name" onChange={this.updateUsername.bind(this)} style={{width:'50%'}}/>
                        <TextField type="password" floatingLabelText="Password" onChange={this.updatePassword.bind(this)} style={{width:'50%'}}/>
                    </div>
                    <div style={{width:'90%', marginLeft:'5%', color:"red"}}>{this.state.loginErrMsg}</div>
                    <div style={{textAlign:'center'}}>
                        <FlatButton label="GO"  primary={true} onTouchTap={this.loginStaff.bind(this)} style={{margin:'20px'}}/>
                        {
                            this.props._sapporo?
                            (this.props._sapporo.createAccount? <FlatButton  label="Create" secondary={true} onTouchTap={this.createStaff.bind(this)}/>:'')
                            :''
                        }

                    </div>
                </Dialog>
            </div>
        );
    }
}

Login.propTypes = {
    _sapporo: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('sapporo');
    return {
        _sapporo: sapporo.findOne({sapporo:true})
    };
}, Login);
