import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { timer } from '../api/db.js';
import { survey } from '../api/db.js';
import { timeSchedule } from '../library/timeLib.js';

import Paper from 'material-ui/Paper';
import { List, ListItem } from 'material-ui/List';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import AddIcon from 'material-ui/svg-icons/action/note-add';

import {SetInfoErrDialog, SetInfoErrDialogMethods} from './infoErrDialog.jsx';

const questionSelection = [{
    description: ['非常同意', 'Strongly Agree'],
    value: 4
}, {
    description: ['同意', 'Agree'],
    value: 3
}, {
    description: ['普通', 'OK'],
    value: 2
}, {
    description: ['不同意', 'Disagree'],
    value: 1
}, {
    description: ['非常不同意', 'Strongly Disagree'],
    value: 0
}];

const surveyForm = {
    questions:[{
    // TODO: Reenable questions about venue for in-person event
    //    description: ['會場方向指引清楚明瞭', 'Directions to the the venue was clear'],
    //    value: null
    //}, {
    //    description: ['比賽場地 (交通便利,場地大小, 照明.. )', 'Venue was well-chosen for the event (ease of transportation, venue size, lighting)'],
    //    value: null
    //}, {
    //    description: ['餐點安排', 'Food and beverage arrangements were satisfactory'],
    //    value: null
    //}, {
        description: ['比賽流程及規則說明清楚詳細', 'Explanation for competition rules and SOP were detailed and clear'],
        value: null
    }, {
        description: ['比賽過程中有疑問或需要協助時,工作人員能及時予以協助', 'During the competition, assistance was received in a timely manner'],
        value: null
    }, {
        description: ['在遠端競賽中，YouTube直播清楚傳達訊息', 'The YouTube live stream explained everything clearly during the virtual competition'],
        value: null
    }, {
        description: ['活動時間安排適宜', 'Scheduling for the event was appropriate'],
        value: null
    }, {
        description: ['線上系統操作容易', 'The CodeWars online system was easy to use'],
        value: null
    }, {
        description: ['報名流程簡單易懂' , 'The registration process was easy'],
        value: null
    }, {
        description: ['我對比賽要求開發程式語言的選擇感到滿意', 'I\'m happy with the selection of programming languages'],
        value: null
    }, {
        description: ['我覺得試題整體來說難易適中', 'In general, difficulty of the problems were reasonable'],
        value: null
    }, {
        description: ['我會推薦這個活動訊息給我的朋友', 'I would recommend CodeWars to my friends'],
        value: null
    }, {
        description: ['我覺得參加這次活動對未來就業/升學有所幫助', 'I think attending CodeWars is beneficial for my college applications and future employment'],
        value: null
    }, {
        description: ['這次活動讓我對HPE/HPI有更深入的了解', 'I gained a deeper understanding of HPE/HPI through CodeWars'],
        value: null
    }, {
        description: ['下次舉辦CodeWars活動我願意再參加', 'I would like to attend CodeWars again'],
        value: null
    }, {
        description: ['整體而言，我對這次比賽活動感到滿意', 'As a whole, I was satisfied with this year\'s CodeWars'],
        value: null
    }],
    otherQuestions: [{
        description: ['如何得知此活動訊息', 'How did you hear about CodeWars?'],
        value: null,
        options: [{
            description: ['網路', 'Internet'], value: '網路'
        }, {
            description: ['海報', 'Poster'], value: '海報'
        }, {
            description: ['學校網站(電子公佈欄)', 'School Website'], value: '學校網站(電子公佈欄)'
        }, {
            description: ['親友推薦', 'Friends and Relatives Recommended'], value: '親友推薦'
        }, {
            description: ['師長推薦', 'Teacher Recommended'], value: '師長推薦'
        }, {
            description: ['其他', 'Others'], value: '其他'
        }]
    }],
    textField: [{
        description: ['姓名/電話/e-mail', 'Name, phone number, e-mail'],
        value: null
    }],
    suggestion: null
};

class Survey extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newSurveyOpen: false,
            survey: JSON.parse(JSON.stringify(surveyForm)),
            editID: null,
            surveyFound: [],
            findName: null
        };
    }

    toggleNewSurveyDialog (clearSurvey) {
        if (clearSurvey) {
            this.setState({
                survey: JSON.parse(JSON.stringify(surveyForm)),
                editID: null
            });
        }
        this.setState({
            newSurveyOpen: !(this.state.newSurveyOpen)
        });
    }

    renderOptions (selections) {
        return selections.map((item, key)=>{
            return (
                <MenuItem key={key} value={item.value} primaryText={item.description.map(x => x + ' ')}/>
            );
        });
    }

    updateSurvey(field, key, event, index, value){
        let tmp = this.state.survey;
        tmp[field][key].value = value;
        this.setState({
            survey: tmp
        });
    }

    renderQuestions() {
        return this.state.survey.questions.map((item, key)=>{
            return (
                <div key={key} style={{width:'100%'}}>
                    <SelectField autoWidth={true} fullWidth={true} floatingLabelText={item.description.map(x => x + ' ')} value={item.value} onChange={this.updateSurvey.bind(this, 'questions', key)}>
                        {this.renderOptions(questionSelection)}
                    </SelectField>
                </div>
            );
        });
    }

    renderOtherQuestions(){
        return this.state.survey.otherQuestions.map((item, key)=>{
            return (
                <div key={key} >
                    <SelectField style={{width:'100%'}} floatingLabelText={item.description.map(x => x + ' ')} value={item.value} onChange={this.updateSurvey.bind(this, 'otherQuestions', key)}>
                        {this.renderOptions(item.options)}
                    </SelectField>
                </div>
            );
        });
    }

    updateSurveyTextField (key, event) {
        let tmp = this.state.survey;
        tmp.textField[key].value = event.target.value;
        this.setState({
            survey: tmp
        });
    }

    renderTextField(){
        return this.state.survey.textField.map((item, key)=>{
            return (
                <div key={key}>
                    <TextField style={{width:'100%'}} floatingLabelText={item.description.map(x => x + ' ')} value={item.value} onChange={this.updateSurveyTextField.bind(this, key)} />
                </div>
            );
        });
    }

    updateSuggestion (event) {
        let tmp = this.state.survey;
        tmp.suggestion = event.target.value;
        this.setState({
            survey: tmp
        });
    }

    surveyAction (isSubmit) {
        if (isSubmit) {
            // Confirm all the questions are answered.
            let surveyQuestions = this.state.survey.questions;
            let surveyOtherQuestions = this.state.survey.otherQuestions;

            for(let i in surveyQuestions) {
                if (surveyQuestions[i].value === null) {
                    alert('CodeWars 小天使提示 - 部分問題似乎漏掉回答了 - Please answer all questions.\n');
                    return;
                }
            }

            for(let i in surveyOtherQuestions) {
                if (surveyOtherQuestions[i].value === null) {
                    alert('CodeWars 小天使提示 - 部分問題似乎漏掉回答了 - Please answer all questions.\n');
                    return;
                }
            }

            //console.log(this.state.survey);
            Meteor.call('survey.submit', this.state.survey, this.state.editID, (error)=>{
                if (error) {
                    this.showErr('[" + error.error + "] ' + error.reason);
                }
            });
        }
        this.toggleNewSurveyDialog(true);

    }

    editSurvey (item) {
        this.setState({
            survey: item.survey,
            editID: item._id
        });
        this.toggleNewSurveyDialog();
    }

    componentWillMount () {
        SetInfoErrDialogMethods(this);
    }

    renderSurveys () {
        if (this.props._surveyData) {
            return this.props._surveyData.map((item, key)=> {
                return (
                    <ListItem key={key} primaryText={item.user + ' (' + (key + 1).toString() + ')'}
                            secondaryText={item.createdAt.toString()} onTouchTap={this.editSurvey.bind(this, item)}/>
                );
            });
        }
    }

    updateFindUser (event) {
        this.setState({
            findName: event.target.value
        });
    }

    findUserSurvey(){
        Meteor.call('survey.search', this.state.findName, (err, data)=> {
            if (err) {
                this.showErr('[" + err.error + "] ' + err.reason);
            }
            this.setState({
                surveyFound: data
            });
        });
    }

    renderFind(){
        return this.state.surveyFound.map((item, key)=>{
            return (
                <ListItem key={key} primaryText={item.user + ' (' + (key + 1).toString() + ')'}
                        secondaryText={item.createdAt.toString()} onTouchTap={this.editSurvey.bind(this, item)}/>
            );
        });
    }

    render () {
        const actions = [
            <FlatButton label="Cancel" secondary={true} onTouchTap={this.surveyAction.bind(this, false)} />,
            <FlatButton label="Submit" primary={true} keyboardFocused={true} onTouchTap={this.surveyAction.bind(this, true)}/>
        ];
        const schedule = timeSchedule(this.props._timer.systemTime, this.props._timer.start, this.props._timer.end);

        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <Paper style={{marginTop:'10px', padding:'10px'}}>
                    {
                        this.props.currentUser.username === 'admin' ?
                            <div>
                                <TextField
                                    floatingLabelFixed={true}
                                    floatingLabelText="search user name"
                                    value={this.state.findname}
                                    onChange={this.updateFindUser.bind(this)}
                                />
                                <FlatButton
                                    label="Find"
                                    primary={true}
                                    onTouchTap={this.findUserSurvey.bind(this)}
                                />
                                <List>
                                    {this.renderFind()}
                                </List>
                                <Divider />
                            </div>
                            : ''
                    }
                    {
                        (schedule.start && schedule.end) ? (
                            <div>
                                <div>
                                    {
                                        (this.props._surveyData.length < 3) ?
                                            <FlatButton
                                                label="New Survey"
                                                icon={<AddIcon />}
                                                onTouchTap={
                                                    this
                                                    .toggleNewSurveyDialog
                                                    .bind(this, true)
                                                }
                                            /> : null
                                    }
                                </div>
                                <List>
                                    {this.renderSurveys()}
                                </List>
                                {SetInfoErrDialog(this)}
                                <Dialog
                                    title=""
                                    actions={actions}
                                    modal={false}
                                    contentStyle={{maxWidth: 'none'}}
                                    open={this.state.newSurveyOpen}
                                    onRequestClose={
                                        this
                                        .toggleNewSurveyDialog
                                        .bind(this, true)
                                    }
                                    autoScrollBodyContent={true}
                                >
                                    {this.renderQuestions()}
                                    {this.renderOtherQuestions()}
                                    {this.renderTextField()}
                                    <TextField
                                        style={{width: '100%'}}
                                        floatingLabelText={
                                            [
                                                '對這次的活動是否有什麼建議呢?',
                                                'Suggestions for CodeWars?'
                                            ].map(x => x + ' ')
                                        }
                                        multiLine={true}
                                        rows={5}
                                        value={this.state.survey.suggestion}
                                        onChange={
                                            this.updateSuggestion.bind(this)
                                        }
                                    />
                                </Dialog>
                            </div>
                        ) : (
                            <div>
                                問卷將在比賽結束後開放...
                                <br />
                                The questionnaire will be opened after the
                                competition...
                            </div>
                        )
                    }
                </Paper>
            </MuiThemeProvider>
        );
    }
}
Survey.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
};
Survey.propTypes = {
    _surveyData: PropTypes.array.isRequired,
    currentUser: PropTypes.object,
    _timer: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('survey');
    Meteor.subscribe('timer');
    return {
        currentUser: Meteor.user(),
        _surveyData: survey.find({user: Meteor.user().username}).fetch(),
        _timer: timer.findOne({timeSync: true})
    };
}, Survey);
