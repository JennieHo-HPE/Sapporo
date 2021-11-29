import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { problem, language } from '../../api/db.js';

import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import { List, ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import ProblemIcon from 'material-ui/svg-icons/editor/insert-comment';
import LanguageIcon from 'material-ui/svg-icons/action/language';
import DeleteIcon from 'material-ui/svg-icons/action/delete';

const addStyle = {
    textAlign: 'center',
    marginTop: '20px'
};
const listStyle = {
    width: '80%',
    marginLeft: '10%'
};
const scoreStyle = {
    width: '100px',
    marginRight: '10px'
};
const titleStyle = {
    marginRight: '10px',
    width: '400px'
};
const inlineTestfield = {
    width: '49%',
    marginRight: '1%',
    verticalAlign: 'top'
};
const inlineTestfield2 = {
    width: 'calc(36%)',
    marginRight: '1%',
    verticalAlign: 'top'
};
const initState = {
    addScore : 0,
    addTitle : null,
    langIso: null,
    addIso : null,
    addText : null,
    selectProblem : null
};

class ProblemConfig extends Component {
    constructor(props) {
        super(props);
        this.state = initState;
    }

    componentDidUpdate () {
    }

    updateAddScore (event) {
        this.setState({
            addScore: event.target.value
        });
    }

    updateAddTitle (event) {
        this.setState({
            addTitle: event.target.value
        });
    }

    updateAddIso (event) {
        this.setState({
            addIso: event.target.value
        });
    }

    updateAddText (event) {
        this.setState({
            addText: event.target.value
        });
    }

    updateLangIso (event, idx, value) {
        this.setState({
            langIso: value
        });
    }

    renderProblems () {
        return this.props._problem.map((problem, key) => {
            // This is ugly....should remove this after codewar.
            // Backward compatitble.
            if (typeof problem.title !== 'object') {
                let tmp = {};
                tmp.title = {};
                tmp.description = {};
                tmp.exampleInput = {};
                tmp.exampleOutput = {};
                tmp.title[this.props._language[0].iso] = problem.title;
                tmp.description[this.props._language[0].iso]
                    = problem.description;
                tmp.exampleInput[this.props._language[0].iso]
                    = problem.exampleInput;
                tmp.exampleOutput[this.props._language[0].iso]
                    = problem.exampleOutput;
                Object.assign(problem, tmp);
            }
            let title = problem.title[this.props._language[0].iso];
            return (
                <ListItem
                    key={key}
                    primaryText={title}
                    secondaryText={problem.score}
                    leftIcon={<ProblemIcon />}
                    onTouchTap={this.clickProblem.bind(this, problem)}
                    style={{borderBottom: '1px solid #DDD'}}
                />
            );
        });
    }

    renderLangs () {
        return this.props._language.map((lang, key) => (
            <ListItem
                key={key}
                primaryText={lang.text}
                secondaryText={lang.iso}
                leftIcon={<LanguageIcon />}
                style={{borderBottom: '1px solid #DDD'}}
                rightIconButton={
                    <IconButton
                        touch={true}
                        tooltip="delete"
                        tooltipPosition="bottom-left"
                        onTouchTap={this.removeLang.bind(this, lang)}
                    >
                            <DeleteIcon />
                    </IconButton>
                }
            />
        ));
    }

    clickProblem (problem) {
        this.setState({
            langIso: this.props._language[0].iso,
            selectProblem: problem
        });
    }

    addProblem () {
        let problem = {
            title: {},
            description: {},
            exampleInput: {},
            exampleOutput: {},
            testInput: '',
            testOutput: '',
            score: this.state.addScore,
            verfication: [],
            images: []
        };
        problem.title[this.props._language[0].iso] = this.state.addTitle;
        Meteor.call('problem.add', problem);
        this.setState(initState);
    }

    updateProblem (data) {
        Meteor.call('problem.update', data);
        this.setState(initState);
    }

    deleteProblem (data) {
        Meteor.call('problem.delete', data);
        this.setState(initState);
    }

    addLang () {
        Meteor.call('language.add', {
            iso: this.state.addIso,
            text: this.state.addText
        });
        this.setState(initState);
    }

    addDefaultLanguages () {
        const defaultLanguages = [
            {
                iso: 'en-US',
                text: 'English'
            },
            {
                iso: 'zh-TW',
                text: 'Chinese'
            },
            {
                iso: 'es',
                text: 'Spanish'
            }
        ];
        for (const language of defaultLanguages) {
            Meteor.call('language.add', language);
        }

        this.setState(initState);
    }

    removeLang (data) {
        Meteor.call('language.delete', data);
        this.setState(initState);
    }

    exitEditor () {
        this.setState(initState);
    }

    updateSelected (attr, event) {
        let temp = this.state.selectProblem;
        temp[attr] = event.target.value;
        this.setState({
            selectProblem : temp
        });
    }

    updateSelectedWithLang (attr, event) {
        let temp = this.state.selectProblem;
        temp[attr][this.state.langIso] = event.target.value;
        this.setState({
            selectProblem : temp
        });
    }

    addVerificationCase () {
        let selected = this.state.selectProblem;
        selected.verfication.push({
            input: null,
            output: null
        });
        this.setState({
            selectProblem: selected
        });
    }

    updateVerificationCase (key, field, event) {
        let selected = this.state.selectProblem;
        selected.verfication[key][field] = event.target.value;
        this.setState({
            selectProblem : selected
        });
    }

    deleteVerificationCase (key) {
        let selected = this.state.selectProblem;
        selected.verfication.splice(key, 1);
        this.setState({
            selectProblem: selected
        });
    }

    renderVerification () {
        if (!this.state.selectProblem.verfication) {
            return;
        }
        return this.state.selectProblem.verfication.map((item, key) => (
            <div key={key}>
                <TextField
                    type="text"
                    floatingLabelText="Input"
                    value={item.input}
                    name={key+'input'}
                    multiLine={true}
                    underlineShow={true}
                    className="code-entry"
                    style={inlineTestfield2}
                    onChange={
                        this.updateVerificationCase.bind(this, key, 'input')
                    }
                    rows={1}
                    rowsMax={7}
                />
                <TextField
                    type="text"
                    floatingLabelText="Output"
                    value={item.output}
                    name={key+'output'}
                    multiLine={true}
                    underlineShow={true}
                    className="code-entry"
                    style={inlineTestfield2}
                    onChange={
                        this.updateVerificationCase.bind(this, key, 'output')
                    }
                    rows={1}
                    rowsMax={7}
                />
                <RaisedButton
                    label="Delete"
                    secondary={true}
                    style={{verticalAlign: 'middle', marginTop: '36px'}}
                    onTouchTap={this.deleteVerificationCase.bind(this, key)}
                />
            </div>
        ));
    }

    renderImages () {
        if (!this.state.selectProblem.images) {
            return;
        }
        return this.state.selectProblem.images.map((item, key) => (
            <div key={key} style={{marginTop: '.5em'}}>
                <img src={item.content} style={{height: '200px'}} />
                <TextField
                    type="text"
                    placeholder="Title"
                    name="title"
                    value={item.title}
                    style={{marginLeft: '.5em', verticalAlign: 'bottom'}}
                    onChange={this.updateImageTitle.bind(this, key)}
                />
                <RaisedButton
                    label="Delete"
                    secondary={true}
                    style={{marginLeft: '.5em', verticalAlign: 'bottom'}}
                    onTouchTap={this.deleteImage.bind(this, key)}
                />
            </div>
        ));
    }

    addImage (e) {
        let reader = new FileReader();
        let file = e.target.files;
        let selected = this.state.selectProblem;
        reader.onload = (upload)=>{
            selected.images.push({
                title: 'Figure ' + selected.images.length,
                content: upload.target.result
            });
            this.setState({
                selectProblem: selected
            });
        };
        reader.readAsDataURL(file[0]);
    }

    updateImageTitle (key, event) {
        let selected = this.state.selectProblem;
        selected.images[key].title = event.target.value;
        this.setState({
            selectProblem : selected
        });
    }

    deleteImage (key) {
        let selected = this.state.selectProblem;
        selected.images.splice(key, 1);
        this.setState({
            selectProblem: selected
        });
    }

    renderLangOptions () {
        return this.props._language.map(
            (lang, key) => (
                <MenuItem
                    key={key}
                    value={lang.iso}
                    primaryText={lang.text}
                />
            )
        );
    }

    renderEditor () {
        let selected = this.state.selectProblem;
        return (
            <div
                style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    width: '100%',
                    height: '100vh',
                    zIndex: '2000'
                }}
            >
                <div
                    style={{
                        position: 'fixed',
                        top: '5vh',
                        left: '5%',
                        width: '85%',
                        height: '85vh',
                        padding: '2.5vh 2.5%',
                        backgroundColor: 'white',
                        zIndex: '2500',
                        overflow: 'scroll'
                    }}
                >
                    <div>
                        <SelectField
                            value={this.state.langIso}
                            onChange={this.updateLangIso.bind(this)}
                            floatingLabelText="Language"
                            style={{
                                fontWeight: '600'
                            }}
                        >
                            {this.renderLangOptions()}
                        </SelectField>
                        <RaisedButton
                            label="Update" primary={true}
                            onTouchTap={this.updateProblem.bind(this, selected)}
                        />
                        <RaisedButton
                            label="Cancel"
                            onTouchTap={this.exitEditor.bind(this)}
                        />
                        <RaisedButton
                            label="Delete"
                            secondary={true}
                            onTouchTap={this.deleteProblem.bind(this, selected)}
                        />
                    </div>
                    <div>
                        <TextField
                            type="number"
                            min="0"
                            placeholder="Score"
                            name="number"
                            style={scoreStyle}
                            value={selected.score}
                            onChange={this.updateSelected.bind(this, 'score')}
                        />
                        <TextField
                            type="text"
                            placeholder="Title"
                            style={titleStyle}
                            name="title"
                            value={selected.title[this.state.langIso]}
                            onChange={
                                this.updateSelectedWithLang.bind(this, 'title')
                            }
                        />
                    </div>
                    <div>
                        <TextField
                            type="text"
                            floatingLabelText="Problem Description"
                            multiLine={true}
                            value={
                                selected.description[this.state.langIso] || ''
                            }
                            name="description"
                            rows={4}
                            rowsMax={10}
                            underlineShow={true}
                            style={{
                                width: '49%',
                                minWidth: '25em'
                            }}
                            onChange={
                                this
                                .updateSelectedWithLang
                                .bind(this, 'description')
                            }
                        />
                    </div>
                    <div>
                        <TextField
                            type="text"
                            floatingLabelText="Input Example"
                            multiLine={true}
                            value={
                                selected.exampleInput[this.state.langIso] || ''
                            }
                            name="exampleInput"
                            rows={1}
                            rowsMax={7}
                            underlineShow={true}
                            className="code-entry"
                            style={inlineTestfield}
                            onChange={
                                this
                                .updateSelectedWithLang
                                .bind(this, 'exampleInput')
                            }
                        />
                        <TextField
                            type="text"
                            floatingLabelText="Output Example"
                            multiLine={true}
                            value={
                                selected.exampleOutput[this.state.langIso] || ''
                            }
                            name="exampleOutput"
                            rows={1}
                            rowsMax={7}
                            underlineShow={true}
                            className="code-entry"
                            style={inlineTestfield}
                            onChange={
                                this
                                .updateSelectedWithLang
                                .bind(this, 'exampleOutput')
                            }
                        />
                    </div>
                    <div>
                        <TextField
                            type="text"
                            floatingLabelText="Test Input"
                            className="code-entry"
                            style={inlineTestfield}
                            name="testInput"
                            multiLine={true}
                            underlineShow={true}
                            value={selected.testInput}
                            onChange={
                                this.updateSelected.bind(this, 'testInput')
                            }
                            rows={1}
                            rowsMax={7}
                        />
                        <TextField
                            type="text"
                            floatingLabelText="Test Output"
                            className="code-entry"
                            style={inlineTestfield}
                            name="testOutput"
                            multiLine={true}
                            underlineShow={true}
                            value={selected.testOutput}
                            onChange={
                                this.updateSelected.bind(this, 'testOutput')
                            }
                            rows={1}
                            rowsMax={7}
                        />
                    </div>
                    <div
                        style={{
                            fontSize: '1rem',
                            margin: '2em 0 1em 0',
                            fontWeight: '600'
                        }}
                    >
                        Verifications
                    </div>
                    <div>
                        <RaisedButton
                            label="Add another verification"
                            primary={true}
                            onTouchTap={this.addVerificationCase.bind(this)}
                        />
                        {this.renderVerification()}
                    </div>
                    <div
                        style={{
                            fontSize: '1rem',
                            margin: '2em 0 1em 0',
                            fontWeight: '600'
                        }}
                    >
                        Upload image
                    </div>
                    <div>
                        <input
                            type="file"
                            onChange={this.addImage.bind(this)}
                        />
                        {this.renderImages()}
                    </div>
                </div>
            </div>
        );
    }

    renderProblemConfig () {
        if (this.props._language.length > 0) {
            return (
                <div>
                    <div style={addStyle}>
                        <TextField
                            type="number"
                            min="0"
                            placeholder="Score"
                            id="score"
                            style={scoreStyle}
                            value={this.state.addScore}
                            onChange={this.updateAddScore.bind(this)}
                        />
                        <TextField
                            type="text"
                            id="problemName"
                            placeholder={
                                `Title (${this.props._language[0].text})`
                            }
                            style={titleStyle}
                            value={this.state.addTitle}
                            onChange={this.updateAddTitle.bind(this)}
                        />
                        <RaisedButton
                            label="Add"
                            primary={true}
                            onTouchTap={this.addProblem.bind(this)}
                        />
                    </div>
                    <List style={listStyle}>
                        {this.renderProblems()}
                    </List>
                    {this.state.selectProblem? this.renderEditor():''}
                </div>
            );
        }
        else {
            return (
                <div style={{margin: '20px 10px'}}>
                    <h3>
                        Please at least add one language to Multi-Language
                        Configuration
                    </h3>
                </div>
            );
        }
    }

    renderLanguageConfig () {
        return (
            <div>
                <div style={addStyle}>
                    <TextField
                        type="text"
                        id="langIso"
                        placeholder="en-US"
                        id="score"
                        style={scoreStyle}
                        value={this.state.addIso}
                        onChange={this.updateAddIso.bind(this)}
                    />
                    <TextField
                        type="text"
                        id="langText"
                        placeholder="English"
                        style={titleStyle}
                        value={this.state.addText}
                        onChange={this.updateAddText.bind(this)}
                    />
                    <RaisedButton
                        label="Add"
                        primary={true}
                        onTouchTap={this.addLang.bind(this)}
                    />
                    <RaisedButton
                        label="Add defaults"
                        onTouchTap={this.addDefaultLanguages.bind(this)}
                    />
                </div>
                <List style={listStyle}>
                    {this.renderLangs()}
                </List>
            </div>
        );
    }

    render () {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <div>
                    <div>
                        <Toolbar style={{marginTop: '30px'}}>
                            <ToolbarGroup float="left">
                                <ToolbarTitle
                                    text="Multi-Language Configuration"
                                />
                            </ToolbarGroup>
                        </Toolbar>
                        {this.renderLanguageConfig()}
                    </div>
                    <div>
                        <Toolbar style={{marginTop: '30px'}}>
                            <ToolbarGroup float="left">
                                <ToolbarTitle text="Problem Configuration" />
                            </ToolbarGroup>
                        </Toolbar>
                        {this.renderProblemConfig()}
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}
ProblemConfig.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
};
ProblemConfig.propTypes = {
    _problem: PropTypes.array.isRequired,
    _language: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('problem');
    Meteor.subscribe('language');
    return {
        _problem: problem.find({}).fetch(),
        _language: language.find({}).fetch()
    };
}, ProblemConfig);
