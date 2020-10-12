import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { HTTP } from 'meteor/http'
import {userData, batchAccount} from '../imports/api/db.js';

function createAccount(username, password) {
    let createResult = Accounts.createUser({
        username: username,
        password: password
    });
    if (!createResult) {
        throw new Meteor.Error(503, 'Unable to create account');
    } else {
        let findUser = batchAccount.findOne({username: username});
        if (!findUser) {
            batchAccount.insert({
                username: username,
                password: password,
                userID: createResult
            });
        } else {
            batchAccount.update({
                username: username
            }, {
                $set : {
                    username: username,
                    password: password,
                    userID: createResult
                }
            });
        }
    }
}

Meteor.startup(() => {
    Meteor.methods({
        'user.check'(id, username) {
            let user = userData.findOne({userID: id});
            if (!user) {
                userData.insert({
                    userID: id,
                    username: username
                });
            }
        },
        'user.importAccounts'(importUrl, sapporoSecret) {
            if (Meteor.user().username !== 'admin') return false;

            try {
                const result = HTTP.call('GET', importUrl, {
                    params: { admin: sapporoSecret }
                });

                const accounts = result.data;
                for (const account of accounts) {
                  createAccount(account['username'], account['password']);
                }
            } catch (e) {
                throw new Meteor.Error(503, 'Failed to query registration: ' + e.message);
            }
            return true;
        },
        'user.batchCreate'(username, password) {
            if (Meteor.user().username !== 'admin') return false;

            createAccount(username, password);
            return true;
        },
        'user.removeAll'() {
            if (Meteor.user().username !== 'admin') return false;

            userData.remove({});
            batchAccount.remove({});
            Meteor.users.remove({
                username: {
                    $ne: 'admin'
                }
            });
        },
        'clearUserData'() {
            userData.remove({});
            // Force logout everybody. A clean userdata will be created when they login again
            Meteor.users.update({}, {$set : { 'services.resume.loginTokens' : [] }}, {multi:true});
        }
    });
});

const updateProblem = function (userID, problemID, isCorrect, code, submitTime) {
    let user = userData.findOne({userID: userID});
    if (!user) return null;
    if (!user[problemID]) {
        user[problemID] = {
            result: false,
            log: []
        };
    }
    user[problemID].result = isCorrect;
    user[problemID].log.push({
        time: submitTime,
        code: code,
        result: isCorrect
    });
    userData.update({
        userID: userID
    }, {
        $set: user
    });
};

export {updateProblem};
