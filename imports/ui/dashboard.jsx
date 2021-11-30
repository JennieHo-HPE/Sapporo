import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { render } from 'react-dom';

import { GridList, GridTile } from 'material-ui/GridList';
import { List, ListItem } from 'material-ui/List';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';

import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import MessageIcon from 'material-ui/svg-icons/communication/mail-outline';
import ClockIcon from 'material-ui/svg-icons/device/access-time';
import TotalIcon from 'material-ui/svg-icons/toggle/star-half';
import PassIcon from 'material-ui/svg-icons/navigation/check';
import AboutIcon from 'material-ui/svg-icons/action/code';
import MailIcon from 'material-ui/svg-icons/content/mail';
import ReadIcon from 'material-ui/svg-icons/content/drafts';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import About from './about.jsx';
import Timer from './Timer.jsx';
import { problem, userData, liveFeed, timer, language } from '../api/db.js';
import {
    getTotalScore,
    getUserTotalScore,
    getCurrentUserData,
    getUserPassedProblem
} from '../library/score_lib.js';
import { setMailAsRead, isMailRead } from '../library/mail.js';

const styles = {
    gridList: {
        width: '100%',
        overflowY: 'auto',
        marginTop:'5px'
    }
};
const cellHeight = function () {
    if (window.innerWidth > 1600) {
        return 400;
    } else {
        return 300;
    }
};
const tileStyleOuter = {
    height: 'inherit',
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    position: 'relative'
};
const tileStyleInner = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translateY(-50%) translateX(-50%)',
    width: '90%'
};
const getTimerTile = function (timer) {
    return(
        <div
            style={{
                ...tileStyleOuter,
                fontSize: '1.875rem'
            }}
        >
            {timer}
        </div>
    );
};


class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            clickFeed: null
        };
    }

    tileStyle(tile) {
        return {
            backgroundImage:
                tile.image == undefined ? '' :  `url("${tile.image}")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition:
                tile.backgroundPosition == undefined ?
                'center' :
                tile.backgroundPosition,
            backgroundSize:
                tile.backgroundSize == undefined ?
                'cover' :
                tile.backgroundSize
        };
    }

    getScoreTile () {
        if (!this.props._problem || !Meteor.user()) return;
        let userData
            = getCurrentUserData(Meteor.user()._id, this.props._userData);
        let score = getUserTotalScore(userData, this.props._problem);
        let totalScore = getTotalScore(this.props._problem);
        return (
            <div
                style={{
                    ...tileStyleOuter,
                    fontSize: '4.5rem'
                }}
            >
                <div style={tileStyleInner}>
                    {score} / {totalScore}
                </div>
            </div>
        );
    }

    getLegalLinks() {
        return (
            <div
               style={{
                   ...tileStyleOuter,
                   fontSize: '1.875rem',
                   textShadow: '.1em .1em .1em #212121',
                   textAlign: 'left'
               }}
           >
               <div
                   style={{
                       ...tileStyleInner,
                       width: 'auto'
                   }}
               >
                    <div style={{whiteSpace: 'nowrap'}}>
                        🗎 <a
                            style={{
                                color: 'white !important',
                                textDecoration: 'none !important'
                            }}
                            target="_blank"
                            href="https://www.hpcodewars.com.tw/privacy-en"
                        >
                            Privacy
                        </a>
                        &nbsp;/&nbsp;
                        <a
                            style={{
                                color: 'white !important',
                                textDecoration: 'none !important'
                            }}
                            target="_blank"
                            href="https://www.hpcodewars.com.tw/privacy-zh"
                        >
                            隱私權
                        </a>
                        <br />
                        🗎 <a
                            style={{
                                color: 'white !important',
                                textDecoration: 'none !important'
                            }}
                            target="_blank"
                            href="https://www.hpcodewars.com.tw/terms-of-use-en"
                        >
                            Terms of Use
                        </a>
                        &nbsp;/&nbsp;
                        <a
                            style={{
                                color: 'white !important',
                                textDecoration: 'none !important'
                            }}
                            target="_blank"
                            href="https://www.hpcodewars.com.tw/terms-of-use-zh"
                        >
                            使用條款
                        </a>
                    </div>
               </div>
           </div>
        );
    }

    liveFeedLogs () {
        return this.props._liveFeed.map((item, key) => (
            <ListItem
                key={key}
                className="inbox-msg"
                style={{
                    backgroundColor: 'rgba(128, 216, 255,0.8)',
                    width: '98%',
                    margin: '0 1% .4em 1%',
                    boxShadow: '.1em .1em .2em #004D40'
                }}
                innerDivStyle={{
                    paddingRight: '1em',
                    paddingLeft: '3.375em'
                }}
                primaryText={item.title}
                secondaryText={item.date_created.toLocaleString()}
                onTouchTap={this.openFeed.bind(this, item)}
                leftIcon={isMailRead(item) ? <ReadIcon /> : <MailIcon />}
            />
        ));
    }

    getLiveFeedTile () {
        return (
            <div
                style={{
                    height: 'calc(100% - 48px)',
                    overflowY: 'auto'
                }}
            >
                <List>
                    {this.liveFeedLogs(this)}
                </List>
            </div>
        );
    }

    getPassProblemTile () {
        if (!this.props._problem || !Meteor.user()) return;
        let totalProblem = this.props._problem.length;
        let userData
            = getCurrentUserData(Meteor.user()._id, this.props._userData);
        let passProblem = getUserPassedProblem(userData, this.props._problem);
        return (
            <div
                style={{
                    ...tileStyleOuter,
                    fontSize: '4.5rem'
                }}
            >
                <div style={tileStyleInner}>
                    {passProblem} / {totalProblem}
                </div>
            </div>
        );
    }

    createUserManualCb() {
        ////let currentUser = getCurrentUserData(Meteor.user()._id, this.props._userData);
        ////let defaultLang = currentUser.language || (this.props._language[0]? this.props._language[0].iso : null);
        return function () {
            window.open('https://hpcodewars.com.tw/user-guides', 'popUpWindow');
        };
    }

    getContent (tile) {
        let contentStyle = {
            height: 'inherit',
            backgroundColor: tile.backgroundColor ?
                tile.backgroundColor: 'rgba(255,255,255,0.3)'
        };
        return (
            <div style={contentStyle}>
                {tile.content}
            </div>
        );
    }

    openFeed (item) {
        this.setState({
            dialogOpen: true,
            clickFeed: item
        });
        setMailAsRead(item);
    }

    textContent (text, style) {
        return (
            <div
                style={{
                    ...tileStyleOuter,
                    fontSize: '1.875rem',
                    ...style
                }}
            >
                <div
                    style={tileStyleInner}
                    dangerouslySetInnerHTML={{__html: text}}
                />
            </div>
        );
    }

    closeFeed () {
        this.setState({
            dialogOpen: false,
            clickFeed: null
        });
    }

    renderAbout(){
        render(<About />, document.getElementById('section'));
    }

    render () {
        const tilesData = [
            {
                title: Meteor.user() ?
                    (Meteor.user().username ?
                        Meteor.user().username
                        : (Meteor.user().profile ?
                            Meteor.user().profile.name
                            : ''))
                    : 'Invalid User',
                    //Will create Library for user credential later
                featured: true,
                cols: 2,
                image: '/images/cwinprogress.jpg',
                backgroundColor: 'rgba(33,33,33,0.6)',
                backgroundSize: '200%',
                backgroundPosition: '0 20%',
                icon: <IconButton><AccountIcon color="white" /></IconButton>,
                content: this.textContent(
                    'Hello! <span style="font-size: 1.4em">☺</span><br>'
                    + 'Welcome to CodeWars Programming Contest',
                    {textShadow: '.1em .1em .1em #212121'}
                )
            },
            {
                title: 'Inbox',
                cols: 2,
                backgroundColor: 'rgba(33,33,33,0.6)',
                backgroundSize: '200%',
                backgroundPosition: '100% 20%',
                titleBG: 'rgba(0,0,0,0.8)',
                image: '/images/cwinprogress.jpg',
                icon: <IconButton><MessageIcon color="white" /></IconButton>,
                content: this.getLiveFeedTile()
            },
            {
                title: 'Timer',
                cols: 2,
                backgroundColor: '#ff7043',
                icon: <IconButton><ClockIcon color="white" /></IconButton>,
                content: getTimerTile(<Timer/>)
            },
            {
                title: '# of Problems Solved',
                cols: 3,
                backgroundColor: '#26a69a',
                icon: <IconButton><PassIcon color="white" /></IconButton>,
                content: this.getPassProblemTile()
            },
            {
                title: 'Total Score',
                featured: true,
                cols: 3,
                backgroundColor: '#FFCA28',
                icon: <IconButton><TotalIcon color="white" /></IconButton>,
                content: this.getScoreTile()
            },
            {
                title: 'User Guide',
                cols: 2,
                backgroundColor: '#7e57c2',
                class: 'hoverItem',
                icon: <IconButton><AboutIcon color="white" /></IconButton>,
                click: this.createUserManualCb(),
                content: this.textContent(
                    '<span style="font-weight: 400">📖</span>',
                    {fontSize: '4.5rem'}
                )
            },
            {
                title: 'About',
                cols: 2,
                backgroundColor: 'rgba(33,33,33,0.6)',
                backgroundSize: '200%',
                backgroundPosition: '0 25%',
                icon: <IconButton><AboutIcon color="white" /></IconButton>,
                image: '/images/coders.jpg',
                class: 'hoverItem',
                content: this.textContent(
                    'CodeWars System 2021',
                    {textShadow: '.1em .1em .1em #212121'}
                ),
                click: this.renderAbout
            },
            {
                title: 'Legal',
                cols: 2,
                backgroundColor: 'rgba(33,33,33,0.6)',
                backgroundSize: '200%',
                backgroundPosition: '100% 25%',
                icon: <IconButton><AboutIcon color="white" /></IconButton>,
                image: '/images/coders.jpg',
                content: this.getLegalLinks()
            }
        ];
        const actions = [
            <FlatButton
                label="exit"
                primary={true}
                onTouchTap={this.closeFeed.bind(this)}
            />
        ];
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
                <div>
                    <GridList
                        cols={6}
                        cellHeight={cellHeight()}
                        padding={5}
                        style={styles.gridList}
                    >
                        {tilesData.map((tile, key) => (
                            <GridTile
                                key={key}
                                title={tile.title}
                                onTouchTap={tile.click}
                                className={tile.class?tile.class:''}
                                actionIcon={tile.icon}
                                actionPosition="left" titlePosition="bottom"
                                titleBackground={
                                    tile.titleBG ?
                                        tile.titleBG : 'rgba(0,0,0,0.6)'
                                }
                                children={this.getContent(tile)}
                                cols={tile.cols} rows={tile.rows? tile.rows:1}
                                style={this.tileStyle(tile)}
                            />
                        ))}
                    </GridList>
                    {
                        this.state.clickFeed ?
                            <Dialog
                                title={this.state.clickFeed.title}
                                actions={actions}
                                modal={false}
                                open={this.state.dialogOpen}
                                titleStyle={{
                                    lineHeight: '1.2',
                                    maxHeight: '3.6em',
                                    padding: '0',
                                    margin: '0 24px 20px 24px !important',
                                    position: 'relative',
                                    top: '24px',
                                    overflowX: 'auto',
                                    wordBreak: 'break-all'
                                }}
                                onRequestClose={this.closeFeed.bind(this)}
                            >
                                <h5>
                                    {this.state.clickFeed.date_created
                                        .toLocaleString()}
                                </h5>
                                <textArea
                                    value={this.state.clickFeed.content}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        maxHeight: '200px',
                                        border: 'none',
                                        fontFamily: 'Roboto, sans-serif',
                                        lineHeight: '1.6'
                                    }}
                                    readOnly={true}
                                />
                            </Dialog>
                            : ''
                    }
                </div>
            </MuiThemeProvider>
        );
    }
}
Dashboard.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
};
Dashboard.propTypes = {
    _userData: PropTypes.array.isRequired,
    _problem: PropTypes.array.isRequired,
    _liveFeed: PropTypes.array.isRequired,
    currentUser: PropTypes.object
};

export default createContainer(() => {
    Meteor.subscribe('timer');
    Meteor.subscribe('userData');
    Meteor.subscribe('liveFeed');
    Meteor.subscribe('language');

    // Pass coding to force resubscribing if coding
    // status changed.
    var db_time = timer.findOne({timeSync: true});
    Meteor.subscribe('problem', (db_time && db_time.coding));

    return {
        currentUser: Meteor.user(),
        _userData: userData.find({}).fetch(),
        _problem: problem.find({}).fetch(),
        _language: language.find({}).fetch(),
        _liveFeed: liveFeed.find({}, {sort: {date_created: -1}}).fetch()
    };
}, Dashboard);
