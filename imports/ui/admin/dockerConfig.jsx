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
    addDefaultLanguages () {
        const defaultLanguages = [
            {
                langType: 'python',
                title: 'Python 2',
                image: 'python:2',
                mountPath: '/usr/src/myapp/',
                executable: 'timeout 10 python2',
                preArg: '',
                file: 'test.py',
                middleArg: '<',
                testInputFile: 'input',
                postArg: '',
                testInput: 'sss',
                // TODO: Add actual example that prints the input
                helloworld: 'print "This is Python2"'
            },
            {
                langType: 'python',
                title: 'Python 3',
                image: 'python:3',
                mountPath: '/usr/src/myapp/',
                executable: 'timeout 10 python3',
                preArg: '',
                file: 'test.py',
                middleArg: '<',
                testInputFile: 'input',
                postArg: '',
                testInput: 'sss',
                // TODO: Add actual example that prints the input
                helloworld: 'print("This is Python3")'
            },
            {
                langType: 'java',
                title: 'Java 8',
                image: 'azul/zulu-openjdk:8',
                mountPath: '/usr/src/myapp/',
                executable: 'javac',
                preArg: '',
                file: 'codewars.java',
                middleArg: '> /dev/null 2>&1 && cd /; timeout 10 java codewars <',
                testInputFile: 'input',
                postArg: '',
                testInput: 'sss',
                // TODO: Add actual example that prints the input
                helloworld: 'class codewars { public static void main(String[] args) { System.out.println("This is Java"); } }'
            },
            {
                langType: 'c_cpp',
                title: 'C',
                image: 'gcc:10.2.0',
                mountPath: '/usr/src/myapp/',
                executable: 'gcc',
                preArg: '-o output -O2',
                file: 'test.c',
                middleArg: '&& timeout 10 ./output <',
                testInputFile: 'input',
                postArg: '',
                testInput: 'sss',
                // TODO: Add actual example that prints the input
                helloworld: '#include<stdio.h>\nint main() { printf("This is C\\n"); return 0; }'
            },
            {
                langType: 'c_cpp',
                title: 'C++ 11',
                image: 'gcc:10.2.0',
                mountPath: '/usr/src/myapp/',
                executable: 'g++',
                preArg: '-o output -std=c++11 -O2',
                file: 'test.cpp',
                middleArg: '&& timeout 10 ./output <',
                testInputFile: 'input',
                postArg: '',
                testInput: 'sss',
                // TODO: Add actual example that prints the input
                helloworld: '#include <iostream>\nint main() { std::cout << "This is C++\\n"; return 0; }'
            },
            {
                langType: 'rust',
                title: 'Rust 1.46',
                image: 'rust:1.46',
                mountPath: '/usr/src/myapp/',
                executable: 'rustc',
                preArg: '',
                file: 'test.rs',
                middleArg: '&& timeout 10 ./test <',
                testInputFile: 'input',
                postArg: '',
                testInput: 'sss',
                helloworld: 'use std::io::{self, BufRead}; fn main() { let mut line = String::new(); io::stdin().lock().read_line(&mut line).expect("Could not read line"); println!("Hello from Rust! {}", line) }'
            },
            {
                langType: 'swift',
                title: 'Swift 5.3',
                image: 'swift:5.3',
                mountPath: '/usr/src/myapp/',
                executable: 'swiftc',
                preArg: '',
                file: 'test.swift',
                middleArg: '&& timeout 10 ./test <',
                testInputFile: 'input',
                postArg: '',
                testInput: 'sss',
                // TODO: Add actual example that prints the input
                helloworld: 'print("Hello World")'
            }
        ];

        for (const language of defaultLanguages) {
            language['languages'] = true;
            Meteor.call('docker.add', language, (err) => {
                if (err) {
                    alert(err);
                }
            });
        }
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
                const resString = result.map(res => `${res.title}:\n${res.output}`).join('\n\n');
                alert(`Test results:\n\n${resString}`);
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
        let address = prompt('Please enter Docker API address (without port)', '172.17.0.1');
        let port = prompt(`Please enter port for ${address}`, '2376');
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
                alert('This docker machine is not working properly.');
                alert(err);
            }  else {
                console.log(`Good! Got info response from ${machine.address}:${machine.port}`);
                Meteor.call('docker.checkImage', machine, (err, result) => {
                    console.log(`Got checkImage response from ${machine.address}:${machine.port}`);

                    if (err) {
                        alert(err);
                        return;
                    }

                    console.log(result);

                    const missingImages = result.filter(image => image.find == false);

                    console.log('Missing images:');
                    console.log(missingImages);

                    if (missingImages.length === 0) {
                        alert(`Success! ${machine.address}:${machine.port} is reachable and has all images needed`);
                    } else {
                        alert(`Images \n${missingImages.map(i => i.image).join(' ')}\n are needed but aren't available on ${machine.address}:${machine.port}`);
                    }
                });
            }
        });
    }
    checkAllMachines(){
        Meteor.call('docker.checkAllMachines', () => {
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
                            <RaisedButton label="Add defaults" onTouchTap={this.addDefaultLanguages.bind(this)}/>
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
