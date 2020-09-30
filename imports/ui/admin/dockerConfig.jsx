import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import LinearProgress from 'material-ui/lib/linear-progress';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import DeleteIcon from 'material-ui/lib/svg-icons/action/delete';
import IconButton from 'material-ui/lib/icon-button';
import NotpassIcon from 'material-ui/lib/svg-icons/image/panorama-fish-eye';
import DoneIcon from 'material-ui/lib/svg-icons/action/check-circle';

import { docker, sapporo } from '../../api/db.js';
import { commandForTest } from '../../library/docker.js';

import brace from 'brace';
import * as langType from '../../library/lang_import.js';

const fieldStyle = {
    display: 'inline-block',
    width: '16.6%'
};

class DockerConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            selectLang: null,
            runningTest: false
        };
    }
    closeAddDialog () {
        this.setState({
            dialogOpen: false,
            selectLang: null
        });
    }
    clickLang (lang) {
        this.setState({
            dialogOpen: true,
            selectLang: lang
        });
    }
    addLang () {
        this.setState({
            dialogOpen: true,
            selectLang: {
                mountPath:'/usr/src/myapp/'
            }
        });
    }
    updateLang () {
        let obj = this.state.selectLang;
        if (obj !== null) {
            obj['languages'] = true;
            Meteor.call('docker.add', obj, (err) => {
                if (err) {
                    alert(err);
                }
                this.closeAddDialog();
            });
        }
    }
    remove (lang) {
        Meteor.call('docker.remove', lang, (err) => {
            if (err) {
                alert(err);
            }
        });
    }
    renderLangOptions () {
        let langList = [];
        for (var key in langType) {
            if (key !== '__esModule') {
                langList.push(key);
            }
        }
        return langList.map((lang, key) => (
            <MenuItem key={key} value={lang} primaryText={lang}></MenuItem>
        ));
    }
    deleteIcon (item) {
        return (
            <IconButton touch={true} tooltip="delete" tooltipPosition="bottom-left" onTouchTap={this.remove.bind(this, item)}>
                <DeleteIcon />
            </IconButton>
        );
    }
    renderLanguages () {
        return this.props._dockerLangs.map((lang, key) => (
            <ListItem key={key} primaryText={lang.title} secondaryText={lang.image} rightIconButton={this.deleteIcon(lang)}
                      onTouchTap={this.clickLang.bind(this, lang)} style={{borderBottom: '1px solid #DDD'}}/>
        ));
    }
    updateLangState (field, event) {
        let temp = this.state.selectLang;
        temp[field] = event.target.value;
        this.setState({
            selectLang : temp
        });
    }
    updateLangType (event, index, value) {
        let temp = this.state.selectLang;
        temp['langType'] = value;
        this.setState({
            selectLang: temp
        });
    }
    showCommandLine (lang) {
        if (!this.props._sapporo) {
            return 'Command line preview not available yet';
        }
        let timeout = this.props._sapporo.timeout;
        let strArray = commandForTest(lang, timeout);
        return '/bin/bash -c "' + strArray.join(' ') + '"';
    }
    startTesting () {
        this.setState({runningTest: true});
        Meteor.call('docker.testLang', (err, result) => {
            if (err) {
                alert(err);
            } else {
                for (var key in result) {
                    alert(result[key].title + ' : ' + result[key].output);
                }
            }
            this.setState({runningTest: false});
        });
        // Meteor.call('docker.checkImage', (err, result) => {
        //     if (err) {
        //         alert(err);
        //     } else {
        //         for (var key in result) {
        //             if (!result[key].find) {
        //                 alert(result[key].image + ' not found, abort.');
        //                 this.setState({runningTest: false});
        //                 return;
        //             }
        //         }
        //         alert('All images found! Ready to run them');
        //         Meteor.call('docker.testImage', (err, result) => {
        //             if (err) {
        //                 alert(err);
        //             } else {
        //                 for (var key in result) {
        //                     alert(result[key].title + ' : ' + result[key].output);
        //                 }
        //             }
        //             this.setState({runningTest: false});
        //         });
        //     }
        // });
    }
    // updateGlobal (field, event) {
    //     let tmp = this.state._dockerGlobal;
    //     tmp[field] = event.target.value;
    //     this.setState({
    //         _dockerGlobal : tmp
    //     });
    // }
    // checkDockerHost () {
    //     let obj = this.state._dockerGlobal;
    //     Meteor.call('docker.useMachine', obj, (err) => {
    //         if (err) {
    //             alert(err);
    //         } else {
    //             Meteor.call('docker.listImage', (err, result) => {
    //                 if (err) {
    //                     alert(err);
    //                 }  else {
    //                     alert(result);
    //                 }
    //             });
    //         }
    //     });
    // }
    componentWillUpdate () {

    }
    renderDockerMachines () {
        return this.props._dockerMachines.map((machine, key) => (
            <ListItem key={key} primaryText={machine.address} secondaryText={machine.port} style={{borderBottom: '1px solid #DDD'}}
                      onTouchTap={this.checkDockerMachine.bind(this, machine)}  rightIconButton={this.deleteIcon(machine)}
                      leftIcon={
                          machine.available? <DoneIcon />: <NotpassIcon />
                      } />
        ));
    }
    addDockerMachine () {
        let address = prompt('Please enter Docker API address (without port)', '');
        let port = prompt(`Please enter port for ${address}`);
        Meteor.call('docker.addMachine', {
            address: address,
            port: port
        }, (err)=>{
            if (err) {
                alert(err);
            }
        });
    }
    checkDockerMachine (machine) {
        Meteor.call('docker.info', machine, (err) => {
             if (err) {
                 alert(err);
                 alert('This docker machine is not working properly');
             }  else {
                 //console.log(result);
                 //alert(`Good! Got response from ${machine.address}:${machine.port}`);
                 Meteor.call('docker.checkImage', machine, (err, result)=>{
                     if (err) {
                         alert(err);
                     } else {
                         let notFound = false;
                         for (var key in result) {
                             if (!result[key].find) {
                                 notFound = true;
                                 alert(`Image (${result[key].image}) is needed but not found on this Docker host`);
                             }
                         }
                         if (!notFound) {
                             alert(`Success! ${machine.address}:${machine.port} is reachable and has all images needed`);
                         }
                     }
                 });
             }
        });
    }
    checkAllMachines(){
        Meteor.call('docker.checkAllMachines', ()=>{
            return;
        });
    }
    render () {
        const actions = [
            <FlatButton label="Cancel" secondary={true} onTouchTap={this.closeAddDialog.bind(this)}/>,
            <FlatButton label="Submit" primary={true}   onTouchTap={this.updateLang.bind(this, null)}/>
        ];
        return (
            <div>
                <div>
                    <Toolbar style={{marginTop:'30px'}}>
                        <ToolbarGroup float="left">
                            <ToolbarTitle text="Docker API Configuration" />
                            <RaisedButton label="Add" onTouchTap={this.addDockerMachine.bind(this)}/>
                            <RaisedButton label="Check" secondary={true} onTouchTap={this.checkAllMachines.bind()}/>
                        </ToolbarGroup >
                    </Toolbar>
                    <List>
                        {this.renderDockerMachines()}
                    </List>
                </div>

                <div>
                    <Toolbar style={{marginTop:'30px'}}>
                        <ToolbarGroup float="left">
                            <ToolbarTitle text="Language Configuration" />
                            <RaisedButton label="Add" onTouchTap={this.addLang.bind(this)}/>
                            <RaisedButton label="Test" secondary={true} onTouchTap={this.startTesting.bind(this)}/>
                        </ToolbarGroup >
                        <ToolbarGroup float="right">

                        </ToolbarGroup >
                    </Toolbar>
                    <List>
                        {this.renderLanguages()}
                    </List>

                </div>
                {this.state.selectLang?
                    <Dialog title="Programming Language Configuration" actions={actions} modal={false} autoScrollBodyContent={true} contentStyle={{width:'90%', maxWidth:'100%'}}
                            open={this.state.dialogOpen} onRequestClose={this.closeAddDialog.bind(this)} autoDetectWindowHeight={true}>
                        <div>
                            <SelectField  value={this.state.selectLang.langType}  onChange={this.updateLangType.bind(this)}
                                          floatingLabelText="Language Family" style={{top:'-8px'}}>{this.renderLangOptions()}</SelectField>
                            <TextField type="text" value={this.state.selectLang.title} floatingLabelText="Language Name" onChange={this.updateLangState.bind(this, 'title')} />
                            <TextField type="text" value={this.state.selectLang.image} floatingLabelText="Docker Image"  onChange={this.updateLangState.bind(this, 'image')}/>
                            <TextField type="text" value={this.state.selectLang.mountPath} floatingLabelText="Mounted Path on Docker" onChange={this.updateLangState.bind(this, 'mountPath')} />
                        </div>
                        <div>
                            <TextField type="text" value={this.state.selectLang.executable} floatingLabelText="Executable" onChange={this.updateLangState.bind(this, 'executable')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.preArg} floatingLabelText="Args_1" onChange={this.updateLangState.bind(this, 'preArg')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.file} floatingLabelText="File Name" onChange={this.updateLangState.bind(this, 'file')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.middleArg} floatingLabelText="Args_2" onChange={this.updateLangState.bind(this, 'middleArg')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.testInputFile} floatingLabelText="Test Input File" onChange={this.updateLangState.bind(this, 'testInputFile')} style={fieldStyle}/>
                            <TextField type="text" value={this.state.selectLang.postArg} floatingLabelText="Args_3" onChange={this.updateLangState.bind(this, 'postArg')} style={fieldStyle}/>
                            <span style={{float:'right'}}>{this.showCommandLine(this.state.selectLang)}</span>
                        </div>
                        <div>
                            <TextField type="text" value={this.state.selectLang.testInput} floatingLabelText="STD input for test" onChange={this.updateLangState.bind(this, 'testInput')} multiLine={true} style={{width:'100%'}}/>
                            <TextField type="text" value={this.state.selectLang.helloworld} floatingLabelText="Testing Script" onChange={this.updateLangState.bind(this, 'helloworld')} multiLine={true} style={{width:'100%'}}/>
                        </div>
                        <div>{this.state.selectLang._id}</div>
                    </Dialog>
                :''
                }
                <Dialog title="Running Test..." modal={false} open={this.state.runningTest} >
                    <LinearProgress />
                </Dialog>
            </div>
        );
    }
}

DockerConfig.propTypes = {
    _dockerGlobal: PropTypes.object,
    _sapporo: PropTypes.object,
    _dockerLangs:  PropTypes.array.isRequired,
    _dockerMachines:  PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('docker');
    Meteor.subscribe('sapporo');
    return {
        _dockerGlobal: docker.findOne({global: true}),
        _sapporo: sapporo.findOne({sapporo: true}),
        _dockerLangs:  docker.find({languages: true}).fetch(),
        _dockerMachines: docker.find({machine: true}).fetch()
    };
}, DockerConfig);
