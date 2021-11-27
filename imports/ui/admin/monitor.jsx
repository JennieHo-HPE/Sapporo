import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { List, ListItem } from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import { timer, requestLogs } from '../../api/db.js';
import { minutesAfterGameStart } from '../../library/timeLib.js';
import { logReason } from '../../library/logger.js';

class Monitor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: []
        };
    }

    refactorLogs (logs) {
        if (logs && (logs.length)) {
            return logs.filter((log)=>{
                let minutes = minutesAfterGameStart(
                    this.props._timer.start,
                    this.props._timer.end,
                    log.createdAt
                );
                if (minutes) {
                    log.minutes = minutes;
                    return log;
                }
            });
        } else {
            return [];
        }
    }

    refactorLogsForAreaChart () {
        let tmp = {};
        let result = [];
        this.state.logs.forEach((item) => {
            if (!tmp[item.minutes]) {
                tmp[item.minutes] = {};
            }
            if (!tmp[item.minutes][item.type]) {
                tmp[item.minutes][item.type] = 1;
            } else {
                tmp[item.minutes][item.type] += 1;
            }
        });
        for (let key in tmp) {
            let obj = tmp[key];
            obj.minutes = key;
            result.push(obj);
        }
        //console.log(result);
        return result;
    }

    clickErrorLog (data) {
        console.log(data);
    }

    displayErrorLog () {
        return this.state.logs.map((log, key)=>{
            if ((log.type !== logReason.success
                    && log.type !== logReason.reachMaxmimum)) {
                return (
                    <ListItem
                        key={key}
                        primaryText={log.type}
                        secondaryText={log.minutes}
                        onTouchTap={this.clickErrorLog.bind(this, log.data)}
                    />
                );
            }
        });
    }

    renderArea () {
        return Object.keys(logReason).map((item, key)=> {
            let color = '#FFFFFF';
            switch (item) {
            case logReason.success:
                color = '#82ca9d';
                break;
            case logReason.reachMaxmimum:
                color = '#f4d942';
                break;
            default:
                color = '#ff0000';
                break;
            }

            return (
                <Area
                    key={key}
                    isAnimationActive={false}
                    type='monotone'
                    dataKey={item}
                    stackId="1"
                    stroke={color}
                    fill={color}
                />
            );
        });
    }

    renderAreaChart () {
        return (
            <AreaChart
                width={window.innerWidth}
                height={400}
                data={this.refactorLogsForAreaChart()}
                margin={{top: 50, right: 30, left: 0, bottom: 30}}
            >
                <XAxis dataKey="minutes" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip isAnimationActive={false} />
                {this.renderArea()}
            </AreaChart>
        );
    }

    componentDidUpdate () {
    }

    componentDidMount () {
    }

    componentWillUpdate (nextProp) {
        let log = this.refactorLogs(nextProp._requestLogs);
        if (log.length !== this.state.logs.length) {
            this.setState({
                logs: log
            });
        }
    }

    render () {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <div>
                    {this.renderAreaChart()}
                    <span>Issues (click to console.log() error object):</span>
                    <List>
                        {this.displayErrorLog()}
                    </List>
                </div>
            </MuiThemeProvider>
        );
    }
}
Monitor.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
};
Monitor.propTypes = {
    _requestLogs: PropTypes.array.isRequired,
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('timer');
    Meteor.subscribe('requestLogs');
    return {
        _timer: timer.findOne({timeSync: true}),
        _requestLogs: requestLogs.find({}).fetch()
    };
}, Monitor);
