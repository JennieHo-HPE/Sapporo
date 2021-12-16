import React, { Component, PropTypes} from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import LinearProgress from 'material-ui/LinearProgress';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import Carousel from 'nuka-carousel';
import AceEditor from 'react-ace';

import * as themeType from '../library/theme_import.js';
import 'brace/theme/tomorrow_night_blue';
import { timeDiffSecond } from '../library/timeLib.js';
import { getCurrentUserData,  isUserPassedProblem } from '../library/score_lib.js';
import { language, docker, userData, sapporo } from '../api/db.js';
import {SetInfoErrDialog, SetInfoErrDialogMethods} from './infoErrDialog.jsx';

const textDiv = {
    width: '96%',
    padding: '0px 2%'
};

class ProblemEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            langType: null,
            theme: 'vibrant_ink',
            code: '',
            runCode: false,
            updateLock: true,
            lastSubmitTime: null,
            languageOverride: null
        };
    }

    updateCode(code) {
        let tmpObj = JSON.parse(localStorage.getItem(this.props.data._id));
        if (!tmpObj) {
            tmpObj = {};
        }
        tmpObj.code = code;
        localStorage.setItem(this.props.data._id, JSON.stringify(tmpObj));
        this.setState({
            code: tmpObj.code
        });
    }

    updateLang(event, index, value) {
        for (var key in this.props._docker) {
            if (this.props._docker[key].title === value) {
                let tmpObj
                    = JSON.parse(localStorage.getItem(this.props.data._id));
                if (!tmpObj) {
                    tmpObj = {};
                }
                tmpObj.language = value;
                tmpObj.langType = this.props._docker[key].langType;
                localStorage.setItem(
                    this.props.data._id, JSON.stringify(tmpObj));
                this.setState({
                    language: value,
                    langType: this.props._docker[key].langType
                });
            }
        }
    }

    updateDisplayLang(event, index, value) {
        console.log(`LanguageOverride: ${value}`);
        this.setState({
            languageOverride: value
        });
    }

    renderDisplayLangOptions () {
        if (!this.props._language) return;
        return this.props._language.map((lang, key) => (
            <MenuItem
                key={key}
                value={lang.iso}
                primaryText={lang.text}
            />
        ));
    }

    renderLangOptions () {
        if (!this.props._docker) return;
        return this.props._docker
            .sort((a, b) => {
                a = String(a.title), b = String(b.title);
                return a > b ? 1 : (a < b ? -1 : 0);
            })
            .map((lang, key) => (
                <MenuItem
                    key={key}
                    value={String(lang.title)}
                    primaryText={String(lang.title)}
                />
            ));
    }

    updateTheme(event, index, value) {
        this.setState({
            theme: value
        });
    }

    renderThemeOptions () {
        let themeList = [];
        for (var key in themeType) {
            if (key !== '__esModule') {
                themeList.push(key);
            }
        }
        return themeList.map((theme, key) => (
            <MenuItem key={key} value={theme} primaryText={theme} />
        ));
    }

    updatePageData () {
        let tmpObj = localStorage.getItem(this.props.data._id);
        if (tmpObj) {
            tmpObj = JSON.parse(tmpObj);
            this.setState ({
                code: tmpObj.code? tmpObj.code:'',
                language: tmpObj.language? tmpObj.language: '',
                langType: tmpObj.langType? tmpObj.langType: null
            });
        } else {
            this.setState({
                code: ''
            });
        }

        if (this.state.langType === null && this.props._docker) {
            if (this.props._docker.length > 0) {
                this.setState({
                    langType: this.props._docker[0].langType,
                    language: this.props._docker[0].title
                });
            }
        }
        this.setState({
            updateLock: true
        });
    }

    componentWillMount () {
        SetInfoErrDialogMethods(this);
    }

    componentDidMount () {
        this.setState({
            updateLock: false
        });
    }

    componentDidUpdate () {
        if (!this.state.updateLock) {
            this.updatePageData();
        }
    }

    componentWillUpdate (nextProp) {
        if (nextProp.data._id !== this.props.data._id) {
            this.setState({
                updateLock: false
            });
        }
    }

    submitCode (isTest) {
        let tmpObj = JSON.parse(localStorage.getItem(this.props.data._id));
        if (!isTest) {
            if (!tmpObj.passTest) {
                this.showErr('You must pass test before submit');
                return;
            }
        }

        if (!tmpObj || !tmpObj.code || tmpObj.code.length === 0) {
            this.showErr('Oops! Please at least write something.');
            return;
        }
        else if (tmpObj.code.length > 10000) {
            this.showErr('Your submission is rejected because your code size is too large');
            return;
        }

        let now = new Date();
        if (
            (isTest || !tmpObj.passTest)
            && this.state.lastSubmitTime
            && (timeDiffSecond(this.state.lastSubmitTime, now)
                < this.props._sapporo.submitwait)
        ) {
            this.showErr(`Please wait at least ${this.props._sapporo.submitwait} seconds between each submission. Last submission was ${timeDiffSecond(this.state.lastSubmitTime, now)} seconds ago.`);
            return;
        } else {
            this.setState({
                lastSubmitTime: now
            });
        }

        this.setState({runCode: true});
        let obj = {
            problemID: this.props.data._id,
            language: this.state.language,
            code: tmpObj.code,
            user: this.props.currentUser
        };
        Meteor.call('docker.submitCode', obj, isTest, (err, result) => {
            this.setState({testResult:null});
            if (!err) {
                if (result.pass) {
                    this.closeDialog();
                    if (isTest) {
                        let tmpObj = JSON.parse(
                            localStorage.getItem(this.props.data._id));
                        tmpObj.passTest = true;
                        localStorage.setItem(
                            this.props.data._id, JSON.stringify(tmpObj));
                        this.showInfo('You\'ve passed testing. You can now submit your code.');
                    } else {
                        this.showInfo(
                            'Your submission is correct! Congrats :D');
                    }
                } else {
                    // No matter it's a test or a submission, always set the
                    // pass fail.
                    let tmpObj
                        = JSON.parse(localStorage.getItem(this.props.data._id));
                    tmpObj.passTest = false;
                    localStorage.setItem(
                        this.props.data._id, JSON.stringify(tmpObj));
                    if (isTest) {
                        this.setState({testResult:result});
                    } else {
                        this.closeDialog();
                        this.showErr('Failed! Please verify your code.');
                    }
                }
            } else {
                this.closeDialog();
                if(err.error && (err.error === 503)) {
                    this.showErr(err.reason);
                }
                else {
                    this.showErr(`[${err.error}] ${err.reason}`);
                }

            }
        });
    }

    closeDialog() {
        this.setState({runCode: false, testResult: null});
    }

    renderImages () {
        if (!this.props.data.images) {
            return;
        }
        return this.props.data.images.map((item, key) => (
            <div key={key}>
                <div
                    style={{
                        width:'100%',
                        textAlign:'center',
                        fontSize: '.875em',
                        fontStyle: 'italic',
                        margin: '.5em 0',
                        color: '#7a7a7a'
                    }}
                >
                    {item.title}
                </div>
                <img
                    src={item.content}
                    style={{width: '100%', opacity: '0.9'}}
                />
            </div>
        ));
    }

    alreadyPass () {
        let currentUser
            = getCurrentUserData(Meteor.user()._id, this.props._userData);
        if (isUserPassedProblem(currentUser, this.props.data._id)) {
            return true;
        }
        else {
            return false;
        }
    }

    render () {
        let currentUser = getCurrentUserData(Meteor.user()._id, this.props._userData);
        const editorOption = {
            $blockScrolling: true
        };
        const langIso = this.state.languageOverride
            || currentUser.language
            || (this.props._language.length > 0 ?
                this.props._language[0].iso : null);

        if (!langIso) {
            return;
        }
        // Back compatible, should be remove after codewar
        if (typeof this.props.data.title !== 'object') {
            let tmp = {};
            tmp.title = {};
            tmp.description = {};
            tmp.exampleInput = {};
            tmp.exampleOutput = {};
            tmp.title[langIso] = this.props.data.title;
            tmp.description[langIso] = this.props.data.description;
            tmp.exampleInput[langIso] = this.props.data.exampleInput;
            tmp.exampleOutput[langIso] = this.props.data.exampleOutput;
            Object.assign(this.props.data, tmp);
        }

        // indicaates if the current user has already passed the current problem
        let alreadyPass = this.alreadyPass();

        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <div>
                    {SetInfoErrDialog(this)}
                    {
                        alreadyPass &&
                            <Paper style={{width: '100%', textAlign: 'center'}}>
                                <h3 style={{color: 'green'}}>
                                    You've Solved This Problem!
                                </h3>
                            </Paper>
                    }
                    <div
                        style={{
                            display: 'inline-block',
                            width: '100%',
                            padding: '10px 0 0 0'
                        }}
                    >
                        <Paper
                            style={{
                                float: 'left',
                                width: '49.5%',
                                maxHeight: `calc(100vh - ${
                                    alreadyPass ? '153px' : '94px'
                                })`,
                                overflow: 'auto'
                            }}
                            zDepth={1}
                        >
                            <div style={textDiv}>
                                <SelectField
                                    value={langIso}
                                    onChange={this.updateDisplayLang.bind(this)}
                                    floatingLabelText="Display Language"
                                >
                                    {this.renderDisplayLangOptions()}
                                </SelectField>
                            </div>
                            <div
                                style={{
                                    ...textDiv,
                                    marginTop: '1em',
                                    display: 'flex'
                                }
                            }>
                                <div
                                    style={{
                                        width: 'calc(100% - 3.27272727273em)',
                                        marginRight: '1em',
                                        fontSize: '1.375em',
                                        fontWeight: '600',
                                        color: '#78909c'
                                    }}
                                >
                                    {this.props.data.title[langIso]}
                                </div>
                                <TextField
                                    floatingLabelText="Score"
                                    type="text"
                                    underlineShow={false}
                                    style={{width: '4.5em', top: '-30px'}}
                                    floatingLabelFocusStyle={{
                                        fontSize: '1.25em'
                                    }}
                                    inputStyle={{
                                        fontSize: '2em',
                                        fontWeight: '600',
                                        color: '#26a69a'
                                    }}
                                    value={this.props.data.score}
                                />
                            </div>
                            <div style={textDiv}>
                                <div
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        width: '100%',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    {this.props.data.description[langIso]}
                                </div>
                            </div>
                            <div style={textDiv}>
                                <dl className="in-out-examples">
                                    <dt>Input Example</dt>
                                    <dd>
                                        <pre className="code-entry">
                                            <code>{
                                                this
                                                .props
                                                .data
                                                .exampleInput[langIso] ?
                                                    this
                                                    .props
                                                    .data
                                                    .exampleInput[langIso]
                                                    : ''
                                            }</code>
                                        </pre>
                                    </dd>
                                    <dt>Output Example</dt>
                                    <dd>
                                        <pre className="code-entry">
                                            <samp>{
                                                this
                                                .props
                                                .data
                                                .exampleOutput[langIso] ?
                                                    this
                                                    .props
                                                    .data
                                                    .exampleOutput[langIso]
                                                    : ''
                                            }</samp>
                                        </pre>
                                    </dd>
                                </dl>
                            </div>
                            {
                                (this.props.data.images.length > 0) ?
                                    <Carousel
                                        showArrows={true}
                                        framePadding={'10px'}
                                    >
                                        {this.renderImages()}
                                    </Carousel>
                                    : ''
                            }
                        </Paper>
                        <div
                            style={{
                                width: '49.5%',
                                float:'right',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        width:'50%',
                                        display:'inline-block'
                                    }}
                                >
                                    <SelectField
                                        value={this.state.language}
                                        onChange={this.updateLang.bind(this)}
                                        floatingLabelText="Programming Language"
                                    >
                                        {this.renderLangOptions()}
                                    </SelectField>
                                </div>
                                {
                                    !alreadyPass &&
                                        <div
                                            style={{
                                                display:'inline-block',
                                                width: '50%',
                                                textAlign: 'right',
                                                marginTop: '1em',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <RaisedButton
                                                label="Test before submit"
                                                primary={true}
                                                onTouchTap={
                                                    this
                                                    .submitCode
                                                    .bind(this, true)
                                                }
                                            />
                                            <RaisedButton
                                                label="Submit"
                                                secondary={true}
                                                onTouchTap={
                                                    this
                                                    .submitCode
                                                    .bind(this, false)
                                                }
                                                style={{marginLeft: '5px'}}
                                            />
                                        </div>
                                }
                            </div>
                            {
                                this.state.langType ?
                                    <AceEditor
                                        mode={this.state.langType}
                                        theme={this.state.theme}
                                        onChange={this.updateCode.bind(this)}
                                        value={this.state.code}
                                        width='100%'
                                        name="UNIQUE_ID_OF_DIV"
                                        editorProps={editorOption}
                                        height={`calc(100vh - ${
                                            alreadyPass ? '225px' : '166px'
                                        })`}
                                    /> :
                                    <span>
                                        Choose a programming language to start
                                    </span>
                            }
                        </div>
                    </div>
                    <Dialog
                        title=" "
                        modal={false}
                        autoScrollBodyContent={true}
                        contentStyle={{
                            width: '90%',
                            maxWidth: '100%',
                            height: '95vh'
                        }}
                        open={this.state.runCode}
                        autoDetectWindowHeight={false}
                    >
                        {
                            this.state.testResult ?
                                <div>
                                    <span style={{color: 'red'}}>
                                        Not correct
                                    </span>
                                    <TextField
                                        floatingLabelText="Test Input"
                                        type="text"
                                        style={{width: '100%'}}
                                        multiLine={true}
                                        value={this.state.testResult.testInput}
                                    />
                                    <div style={{width: '100%', color: 'red'}}>
                                        {
                                            !this.state.testResult.stdout ?
                                                <span>
                                                    No test result.
                                                    Maybe execution time exceeds
                                                    the limitation?
                                                </span> : ''
                                        }
                                    </div>
                                    <div style={{width: '100%'}}>
                                        <div
                                            style={{
                                                width: '48%',
                                                float: 'left'
                                            }}
                                        >
                                            <TextField
                                                floatingLabelText="My Output"
                                                type="text"
                                                style={{width: '100%'}}
                                                value={
                                                    this.state.testResult.stdout
                                                }
                                                multiLine={true}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                width: '48%',
                                                float: 'right'
                                            }}
                                        >
                                            <TextField
                                                floatingLabelText="Expected Output"
                                                type="text"
                                                style={{width: '100%'}}
                                                value={
                                                    this
                                                    .state
                                                    .testResult
                                                    .expected
                                                }
                                                multiLine={true}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            width: '100%',
                                            float: 'left'
                                        }}
                                    >
                                        <FlatButton
                                            label="Exit"
                                            secondary={true}
                                            onTouchTap={
                                                this.closeDialog.bind(this)
                                            }
                                            style={{
                                                left: '50%',
                                                marginLeft: '-50px'
                                            }}
                                        />
                                    </div>
                                </div>
                                : <LinearProgress mode="indeterminate"/>
                        }
                    </Dialog>
                </div>
            </MuiThemeProvider>
        );
    }
}
ProblemEditor.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
};
ProblemEditor.propTypes = {
    _docker: PropTypes.array.isRequired,
    _userData: PropTypes.array.isRequired,
    currentUser: PropTypes.object,
    _sapporo: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('language');
    Meteor.subscribe('docker');
    Meteor.subscribe('userData');
    Meteor.subscribe('sapporo');
    return {
        _language: language.find({}).fetch(),
        _docker: docker.find({languages: true}).fetch(),
        _sapporo: sapporo.findOne({sapporo:true}),
        _userData: userData.find({}).fetch(),
        currentUser: Meteor.user()
    };
}, ProblemEditor);
