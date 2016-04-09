import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { timer } from '../../api/db.js';

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

let style = {
    width: '100%',
    textAlign : 'center',
    display: 'inline-block',
    marginTop : '10px'
};
let inlineDiv = {
    display: 'inline-block',
    marginLeft: '10px',
    marginRight: '10px'
};
let numberInput = {
    width: '100px',
    marginLeft: '10px'
};
let textInput = {
    marginLeft: '10px'
};
let initState = {
    time: {
        start: {
            hr: -1,
            min: -1
        },
        end: {
            hr: -1,
            min: -1
        }
    }
};
let updateLock = false;

class System extends Component {
    constructor(props) {
        super(props);
        this.state = initState;
    }
    submit () {
        Meteor.call('time.update', this.state.time);
        updateLock = false;
    }
    startH (event) {
        let time = this.state.time;
        time.start.hr = event.target.value;
        this.setState({
            time: time
        });
    }
    startM (event) {
        let time = this.state.time;
        time.start.min = event.target.value;
        this.setState({
            time: time
        });
    }
    endH (event) {
        let time = this.state.time;
        time.end.hr = event.target.value;
        this.setState({
            time: time
        });
    }
    endM (event) {
        let time = this.state.time;
        time.end.min = event.target.value;
        this.setState({
            time: time
        });
    }
    updateSystemData () {
        if (updateLock) return;
        this.setState({
            time: this.props._timer.gameTime
        });
        updateLock = true;
    }
    componentDidUpdate () {
        if (!updateLock) this.updateSystemData();
    }
    render () {
        return (
            <div>
                <div style={style}>
                    <div style={inlineDiv}>
                        <span>Start Time:</span>
                        <TextField type="number" min="0" max="23" placeholder="HR" style={numberInput}
                               value={this.state.time.start.hr} onChange={this.startH.bind(this)}
                               id="starHr"/>
                        <TextField type="number" min="0" max="59" placeholder="MIN" style={numberInput}
                               value={this.state.time.start.min} onChange={this.startM.bind(this)}
                               id="startMin"/>
                    </div>
                    <div style={inlineDiv}>
                       <span>End Time:</span>
                       <TextField type="number" min="0" max="23" placeholder="HR" style={numberInput}
                              value={this.state.time.end.hr} onChange={this.endH.bind(this)}
                              id="endHr"/>
                       <TextField type="number" min="0" max="59" placeholder="MIN" style={numberInput}
                              value={this.state.time.end.min} onChange={this.endM.bind(this)}
                              id="endMin"/>
                    </div>
                </div>
                <div style={style}>
                    <div style={inlineDiv}>
                       <span>Project title:</span>
                       <TextField type="text" id="projectName" value="Sapporo Project" style={textInput}/>
                    </div>
                </div>
                <div style={style}>
                    <RaisedButton label="Submit"  primary={true} onClick={this.submit.bind(this)}/>
                </div>
            </div>
        );
    }
}

System.propTypes = {
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('timer');
    return {
        _timer: timer.findOne({timeSync: true})
    };
}, System);