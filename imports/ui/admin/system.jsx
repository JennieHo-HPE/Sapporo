import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { timer } from '../../api/db.js';
import { sapporo } from '../../api/db.js';
import { generateDate } from '../../library/timeLib.js';

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import Toggle from 'material-ui/lib/toggle';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import DatePicker from 'material-ui/lib/date-picker/date-picker';

const style = {
    padding: '10px 0',
    width: '80%',
    textAlign : 'left',
    display: 'inline-block',
    margin : '10px 0 0 10%'
};
const inlineDiv = {
    display: 'inline-block',
    marginLeft: '10px',
    marginRight: '10px'
};
const numberInput = {
    width: '150px',
    marginLeft: '10px'
};
const initState = {
    gameTime: {
        startDate: null,
        startHour: null,
        startMinute: null,
        endDate: null,
        endHour: null,
        endMinute: null
    },
    sapporo: {
        title: '',
        timeout: 10,
        submitwait: 10,
        createAccount: true,
        maxExe: 20
    }
};
let updateLock = false;

class System extends Component {
    constructor(props) {
        super(props);
        this.state = initState;
        updateLock = false;
    }
    submit () {
        Meteor.call('sapporo.updateSapporo', this.state.sapporo);
        this.submitGameTime();
        updateLock = false;
    }
    submitGameTime () {
        let serverTime = this.props._timer.systemTime;
        let startDate = this.state.gameTime.startDate;
        let endDate = this.state.gameTime.endDate;
        let startTime = generateDate(
            serverTime,
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            this.state.gameTime.startHour,
            this.state.gameTime.startMinute
        );
        let endTime = generateDate(
            serverTime,
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            this.state.gameTime.endHour,
            this.state.gameTime.endMinute
        );
        Meteor.call('time.updateGameTime', startTime, endTime, (err) => {
            if (err) {
                alert(err);
            }
        });
    }
    updateStartDate (err, date) {
        let gameTime = this.state.gameTime;
        gameTime.startDate = date;
        this.setState({
            gameTime: gameTime
        });
    }
    updateEndDate (err, date) {
        let gameTime = this.state.gameTime;
        gameTime.endDate = date;
        this.setState({
            gameTime: gameTime
        });
    }
    updateGameTime (field, event) {
        let time = this.state.gameTime;
        time[field] = event.target.value;
        this.setState({
            gameTime: time
        });
    }
    displayConfiguredTime (type) {
        if (this.props._timer[type]) {
            return this.props._timer[type].toString();
        }
        return 'Not Configured Yet';
    }
    updateSapporo (field, event) {
        let sapporo = this.state.sapporo;
        if (field === 'createAccount') {
            sapporo[field] = !(sapporo[field]);
        } else {
            sapporo[field] = event.target.value;
        }
        this.setState({
            sapporo: sapporo
        });
    }
    updateSystemData () {
        if (updateLock) return;
        let start = this.props._timer.start, end = this.props._timer.end;
        let time = {
            startDate: start,
            startHour: (start && start.getHours)? start.getHours():null,
            startMinute: (start && start.getMinutes)? start.getMinutes():null,
            endDate: end,
            endHour: (end && end.getHours)? end.getHours():null,
            endMinute: (end && end.getMinutes)? end.getMinutes():null
        };
        this.setState({
            time: this.props._timer.gameTime,
            sapporo: this.props._sapporo,
            gameTime: time
        });
        updateLock = true;
    }
    clearSurveyAndContest () {
        if (confirm('Are you sure?')) {
            Meteor.call('survey.clear', (err) => {
                if (err) {
                    alert(err);
                }
                Meteor.call('clearUserData', (err) => {
                    if (err) {
                        alert(err);
                    }
                });
            });

        }
    }
    componentDidUpdate () {
        if (!updateLock) this.updateSystemData();
    }
    render () {
        return (
            <div>
                <div style={style}>
                    <div style={inlineDiv}>
                            <TextField type="text" id="projectName" floatingLabelText="Project Name"
                                       value={this.state.sapporo.title} onChange={this.updateSapporo.bind(this, 'title')}/>
                            <TextField type="number" min="0" floatingLabelText="timeout" style={numberInput}
                                       value={this.state.sapporo.timeout} onChange={this.updateSapporo.bind(this, 'timeout')} id="timeout"/>
                                   <TextField type="number" min="0" floatingLabelText="Submission Interval" style={numberInput}
                                       value={this.state.sapporo.submitwait} onChange={this.updateSapporo.bind(this, 'submitwait')} id="submitwait"/>
                                   <TextField type="number" min="1" floatingLabelText="Maximun Execution" style={numberInput}
                                       value={this.state.sapporo.maxExe} onChange={this.updateSapporo.bind(this, 'maxExe')} id="maxExe"/>
                    </div>
                    <Toggle labelPosition="right" label="Allow Account Creation" onToggle={this.updateSapporo.bind(this, 'createAccount')} toggled={this.state.sapporo.createAccount}/>
                </div>
                <div style={style}>
                    <div>
                        <span>{this.displayConfiguredTime('systemTime')} - Server Time</span><br/>
                        <span>{this.displayConfiguredTime('start')} - Configured Start Time</span><br/>
                        <span>{this.displayConfiguredTime('end')} - Configured End Time</span><br/>
                    </div>
                </div>
                <div style={style}>
                    <div style={inlineDiv}>
                        <span>Start Time     :</span>
                        <DatePicker style={{display: 'inline-block'}} hintText="Start Date" onChange={this.updateStartDate.bind(this)} value={this.state.gameTime.startDate}/>
                        <TextField id="startHr" type="number" min="0" max="23" placeholder="Start Hour" style={numberInput} value={this.state.gameTime.startHour} onChange={this.updateGameTime.bind(this, 'startHour')}/>
                        <TextField id="startMin" type="number" min="0" max="59" placeholder="Start Minute" style={numberInput} value={this.state.gameTime.startMinute} onChange={this.updateGameTime.bind(this, 'startMinute')}/>
                    </div>
                </div>
                <div style={style}>
                    <div style={inlineDiv}>
                        <span>End Time       :</span>
                        <DatePicker style={{display: 'inline-block'}} hintText="End Date" onChange={this.updateEndDate.bind(this)} value={this.state.gameTime.endDate}/>
                        <TextField id="endHr" type="number" min="0" max="23" placeholder="End Hour" style={numberInput} value={this.state.gameTime.endHour} onChange={this.updateGameTime.bind(this, 'endHour')}/>
                        <TextField id="endMin" type="number" min="0" max="59" placeholder="End Minute" style={numberInput} value={this.state.gameTime.endMinute} onChange={this.updateGameTime.bind(this, 'endMinute')}/>
                    </div>
                </div>

                <div style={style}>
                    <RaisedButton label="Submit"  primary={true} onTouchTap={this.submit.bind(this)}/>
                </div>

                <div style={style}>
                    <RaisedButton label="Clear Survey and Contest Data"  secondary={true} onTouchTap={this.clearSurveyAndContest.bind(this)}/>
                </div>

            </div>
        );
    }
}

System.propTypes = {
    _timer: PropTypes.object,
    _sapporo: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('timer');
    Meteor.subscribe('sapporo');
    return {
        _timer: timer.findOne({timeSync: true}),
        _sapporo: sapporo.findOne({sapporo: true})
    };
}, System);
