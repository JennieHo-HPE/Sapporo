import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { render } from 'react-dom';

import About from './about.jsx';

import Timer from './Timer.jsx';

import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import AccountIcon from 'material-ui/lib/svg-icons/action/account-circle';
//import HelpIcon from 'material-ui/lib/svg-icons/action/help-outline';
import MessageIcon from 'material-ui/lib/svg-icons/communication/mail-outline';
import ClockIcon from 'material-ui/lib/svg-icons/device/access-time';
import TotalIcon from 'material-ui/lib/svg-icons/toggle/star-half';
import PassIcon from 'material-ui/lib/svg-icons/navigation/check';
//import OnlineIcon from 'material-ui/lib/svg-icons/action/question-answer';
import AboutIcon from 'material-ui/lib/svg-icons/action/code';
import IconButton from 'material-ui/lib/icon-button';

import { problem, userData, liveFeed, timer, language } from '../api/db.js';
import { getTotalScore, getUserTotalScore, getCurrentUserData, getUserPassedProblem } from '../library/score_lib.js';
import { setMailAsRead } from '../library/mail.js';

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
const customTileStyle = {
    height: 'inherit',
    textAlign:'center',
    lineHeight: String(cellHeight())+'px',
    fontSize: String(cellHeight())+'%',
    fontWeight: 'bold',
    color: 'white'
};
const getTimerTile = function (timer) {

    return(
        <div style={{
                fontSize: '30px',
                height: 'inherit',
                textAlign:'center',
                fontWeight: 'bold',
                color: 'white',
            }}>
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
            backgroundImage: 'url("' + tile.image + '")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
        };
    }
    getScoreTile () {
        if (!this.props._problem || !Meteor.user()) return;
        let userData = getCurrentUserData(Meteor.user()._id, this.props._userData);
        let score = getUserTotalScore(userData, this.props._problem);
        let totalScore = getTotalScore(this.props._problem);
        return (
            <div style={customTileStyle}>
                <span>{score} / {totalScore}</span>
            </div>
        );
    }
    liveFeedLogs () {
        return this.props._liveFeed.map((item, key) => (
            <ListItem key={key} style={{borderBottom:'1px solid #AAA', backgroundColor:'rgba(255,255,255,0.5)', width:'99%', margin:'0.5%'}}
                      primaryText={item.title} secondaryText={item.date_created.toLocaleTimeString()}
                      onTouchTap={this.openFeed.bind(this, item)}/>
        ));
    }
    getLiveFeedTile () {
        return (
            <List>
                {this.liveFeedLogs(this)}
            </List>
        );
    }
    getPassProblemTile () {
        if (!this.props._problem || !Meteor.user()) return;
        let totalProblem = this.props._problem.length;
        let userData = getCurrentUserData(Meteor.user()._id, this.props._userData);
        let passProblem = getUserPassedProblem(userData, this.props._problem);
        return (
            <div style={customTileStyle}>
                <span>{passProblem} / {totalProblem}</span>
            </div>
        );
    }
    createUserManualCb() {
        let currentUser = getCurrentUserData(Meteor.user()._id, this.props._userData);
        let defaultLang = currentUser.language || (this.props._language[0]? this.props._language[0].iso : null);

        return function () {
            window.open('https://hpcodewars.com.tw/user-guides', 'popUpWindow');
        };
    }
    getContent (tile) {
        let contentStyle = {
            height: 'inherit',
            backgroundColor: tile.backgroundColor? tile.backgroundColor:'rgba(255,255,255,0.3)'
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
    textContent (text) {
        return (
            <div style={customTileStyle}><span>{text}</span></div>
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
        const tilesData = [{
            title: Meteor.user()? (Meteor.user().username? Meteor.user().username:(Meteor.user().profile?Meteor.user().profile.name:'')):'Invalid User', //Will create Library for user credential later
            featured: true,
            cols: 2,
            image: '/images/1.jpg',
            backgroundColor: 'rgba(0,40,80,0.3)',
            icon: <IconButton><AccountIcon color="white" /></IconButton>,
            content: this.textContent('Hello :)')
        }, {
            title: 'Inbox Preview',
            cols: 2,
            backgroundColor: 'rgba(0,165,165,0.6)',
            titleBG: 'rgba(0,0,0,0.8)',
            image: '/images/2.jpg',
            icon: <IconButton><MessageIcon color="white" /></IconButton>,
            content: this.getLiveFeedTile()
        },  {
            title: 'Time',
            cols: 2,
            image: '/images/6.jpg',
            backgroundColor: 'rgba(0,40,80, 0.6)',
            content: getTimerTile(<Timer/>),
            icon: <IconButton><ClockIcon color="white" /></IconButton>
        }, {
            title: 'Total Score',
            featured: true,
            cols: 3,
            image: '/images/4.jpg',
            backgroundColor: 'rgba(150,50,50,0.6)',
            content: this.getScoreTile(),
            icon: <IconButton><TotalIcon color="white" /></IconButton>
        }, {
            title: 'Passed Problems',
            cols: 3,
            image: '/images/3.jpg',
            backgroundColor: 'rgba(100,20,60,0.6)',
            content: this.getPassProblemTile(),
            icon: <IconButton><PassIcon color="white" /></IconButton>
        }, {
            title: 'User Guide',
            cols: 2,
            backgroundColor: 'rgba(0,165,165,0.6)',
            image: '/images/7.png',
            class: 'hoverItem',
            icon: <IconButton><AboutIcon color="white" /></IconButton>,
            click: this.createUserManualCb(),
        }, {
            title: 'Codewars World Wide',
            cols: 2,
            backgroundColor: 'rgba(0,80,160, 0.6)',
            icon: <IconButton><AboutIcon color="white" /></IconButton>,
            image: '/images/8.jpg',
            class:'hoverItem',
            content: this.textContent('Everywhere')
        }, {
            title: 'About This System',
            cols: 2,
            backgroundColor: 'rgba(0,165,165,0.6)',
            icon: <IconButton><AboutIcon color="white" /></IconButton>,
            image: '/images/5.jpg',
            class: 'hoverItem',
            content: this.textContent('Oh?'),
            click: this.renderAbout
        }];
        const actions = [
            <FlatButton label="exit" primary={true} onTouchTap={this.closeFeed.bind(this)} />
        ];
        return (
            <div>
                <GridList cols={6} cellHeight={cellHeight()} padding={5} style={styles.gridList}>
                          {tilesData.map((tile, key) => (
                    <GridTile key={key} title={tile.title}
                              onTouchTap={tile.click}
                              className={tile.class?tile.class:''}
                              actionIcon={tile.icon}
                              actionPosition="left" titlePosition="bottom"
                              titleBackground={tile.titleBG?tile.titleBG:'rgba(0, 0, 0, 0.6)'} children={this.getContent(tile)}
                              cols={tile.cols} rows={tile.rows? tile.rows:1} style={this.tileStyle(tile)}>
                    </GridTile>
                  ))}
                </GridList>
                { this.state.clickFeed?
                    <Dialog title={this.state.clickFeed.title} actions={actions} modal={false}
                            open={this.state.dialogOpen} onRequestClose={this.closeFeed.bind(this)}>
                        <h5>{this.state.clickFeed.date_created.toLocaleTimeString()}</h5>
                        <textArea value={this.state.clickFeed.content} style={{width:'100%', height:'200px', maxHeight:'200px', border:'none'}} readOnly={true}></textArea>
                    </Dialog>
                :''
                }
            </div>
        );
    }
}

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
