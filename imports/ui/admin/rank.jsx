import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { List, ListItem } from 'material-ui/List';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import { problem, userData, sapporo, language } from '../../api/db.js';
import {
    getUserTotalScore,
    problemSolvedCount,
    getTotalScore,
    getFinishTime
} from '../../library/score_lib.js';

class Rank extends Component {
    problemSolvedCounting (item) {
        return problemSolvedCount(item, this.props._userData);
    }

    renderProblemAnswerRate () {
        if (this.props._language.length === 0) {
            return (
                <div style={{margin: '20px 10px'}}>
                    <h3>
                        Please at least add one language to Multi-Language
                        Configuration
                    </h3>
                </div>
            );
        }
        let defaultLang = this.props._language[0].iso;
        this.sortPropsArray('_problem', [
            {
                sortDir: -1,
                valFunc: (item) => this.problemSolvedCounting(item)
            }
        ]);
        return this.props._problem.map((item, key) => {
            let solvedCount = this.problemSolvedCounting(item);
            return (
                <ListItem
                    key={key}
                    primaryText={item.title[defaultLang] || item.tile}
                    secondaryText={String(solvedCount)}
                >
                    <LinearProgress
                        mode="determinate"
                        max={this.props._userData.length}
                        value={solvedCount}
                        color="green"
                        style={{height:'15px'}}
                    />
                </ListItem>
            );
        });
    }

    /**
     * @callback valCallback
     * @param {*} item
     */
    /**
     * This is used to sort the array-typed prop of `this.props`.
     *
     * @param {string} arrayName the prop name of the `this.props' that is an
     * array
     * @param {{sortDir: number, valFunc: valCallback}} compareConds Provides a
     * list of "compare conditions" as objects with field `sortDir' of number
     * type indicating sorting direction (1: asc, -1: desc), and `valFunc',
     * which is the callback for retrieving the desired value from the item of a
     * props array used in the sorting comparisions. Think of this as an ordered
     * list of sorting criteria.
     */
    sortPropsArray (arrayName, compareConds) {
        this.props[arrayName].sort(
            (a, b) => compareConds.reduce(
                (prevResult, curCond) => {
                    if (prevResult != 0)
                        return prevResult;

                    const aVal = curCond.valFunc(a);
                    const bVal = curCond.valFunc(b);
                    return aVal < bVal ?
                        -1 * curCond.sortDir
                        : (aVal > bVal ? 1 * curCond.sortDir : 0);
                },
                0
            )
        );
    }

    userScoreTextFormat (user, score) {
        let finishTime = getFinishTime(user);
        return `Score: ${score}, Finish Time: ${finishTime}`;
    }

    renderAllUser () {
        if (!this.props._userData || this.props._userData.length === 0) return;
        this.sortPropsArray('_userData', [
            {
                sortDir: -1,
                valFunc: item => getUserTotalScore(item, this.props._problem)
            },
            {
                sortDir: 1,
                valFunc: item => getFinishTime(item)
            }
        ]);
        return this.props._userData.map((item, key) => {
            let userTotalScore = getUserTotalScore(item, this.props._problem);
            return (
                <ListItem
                    key={key}
                    primaryText={item.username}
                    secondaryText={
                        this.userScoreTextFormat(item, userTotalScore)
                    }
                >
                    <LinearProgress
                        mode="determinate"
                        max={getTotalScore(this.props._problem)}
                        value={userTotalScore}
                        color="coral"
                        style={{height: '15px'}}
                    />
                </ListItem>
            );
        });
    }

    renderUserNumber () {
        if (!this.props._userData || this.props._userData.length === 0) return;

        const totalUsers = this.props._userData.length;
        const finishedUsers = this.props._userData.filter(
          user => getFinishTime(user) != null
        ).length;
        return (
            <span>
              <span title="Completed all problems">{ finishedUsers }</span>
              /
              <span title="Total users">{ totalUsers }</span>
            </span>
        );
    }

    render () {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <div>
                    <h3>Problem Solving Count</h3>
                    <List>
                        {this.renderProblemAnswerRate()}
                    </List>
                    <Divider />
                    <h3>Ranking ({this.renderUserNumber()})</h3>
                    <List>
                        {this.renderAllUser()}
                    </List>

                </div>
            </MuiThemeProvider>
        );
    }
}
Rank.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
};
Rank.propTypes = {
    _userData: PropTypes.array.isRequired,
    _problem: PropTypes.array.isRequired,
    _sapporo: PropTypes.object,
    _language: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('userData');
    Meteor.subscribe('problem');
    Meteor.subscribe('sapporo');
    Meteor.subscribe('language');
    return {
        _userData: userData.find({}).fetch(),
        _problem: problem.find({}).fetch(),
        _sapporo: sapporo.findOne({sapporo: true}),
        _language: language.find({}).fetch()
    };
}, Rank);
