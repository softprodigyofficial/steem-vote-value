const async     = require('async');
const steem     = require('steem');
const request   = require("request");

function user(params) {
    
    return new Promise( function(resolve, reject) {
        
        steem.api.getAccounts([params.handle], function(err, accounts) {
            if(err){
                reject(err);
            }
            else{
                if(accounts.length > 0){
                    var reputation  = 
                    accounts[0].formatted_reputation = steem.formatter.reputation(accounts[0].reputation);
                    resolve(accounts[0]);
                }
                else{
                    reject("account not found");
                }
            }
        });
        
    });
    
}

function getRewardFund() {
    
    return new Promise( function(resolve, reject) {
        
        steem.api.getRewardFund("post", function(err, result) {
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
        
    });
    
}

function getDynamicGlobalProperties() {
    
    return new Promise( function(resolve, reject) {
        
        steem.api.getDynamicGlobalProperties(function(err, result) {
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
        
    });
    
}

function vote_value(params) {
    
    return new Promise( function(resolve, reject) {
        
        async.parallel([
            //user
            function(callback) {
                user(params).then(function(user) {
                    callback(null,user);
                }).catch(function(user_error){
                    callback(user_error,null);
                });
            },
            //reward_fund
            function(callback) {
                getRewardFund().then(function(rewardFund) {
                    callback(null,rewardFund);
                }).catch(function(rewardFund_error){
                    callback(rewardFund_error,null);
                });
            },
            //glolab_props
            function(callback) {
                getDynamicGlobalProperties().then(function(dynamicGlobalProperties) {
                    callback(null,dynamicGlobalProperties);
                }).catch(function(dynamicGlobalProperties_error){
                    callback(dynamicGlobalProperties_error,null);
                });
            },
            //market_value
            function(callback){
                steem.api.getCurrentMedianHistoryPrice(function(err, currentMedianHistoryPrice) {
                    if(err){
                        callback(err,null);
                    }
                    else{
                        callback(null,currentMedianHistoryPrice);
                    }
                });
            }
        ],
        function(err, results) {
            
            if(err){
                reject(err);
            }
            
            try{
                var user         = results[0];
                var reward_fund  = results[1];
                var glolab_props = results[2];
                var market_value = results[3];
                
                user.vesting_power   = steem.formatter.vestToSteem(user.vesting_shares          , glolab_props.total_vesting_shares, glolab_props.total_vesting_fund_steem);
                user.received_power  = steem.formatter.vestToSteem(user.received_vesting_shares , glolab_props.total_vesting_shares, glolab_props.total_vesting_fund_steem);
                user.delegated_power = steem.formatter.vestToSteem(user.delegated_vesting_shares, glolab_props.total_vesting_shares, glolab_props.total_vesting_fund_steem);
                user.net_steem_power = user.vesting_power + user.received_power - user.delegated_power;
                
                var secondsago        = (new Date - new Date(user.last_vote_time + "Z")) / 1000;
                var vpow              = user.voting_power + (10000 * secondsago / 432000);
                user.new_voting_power = Math.min(vpow / 100, 100).toFixed(2);
                
                var e = user.net_steem_power,
                    t = user.new_voting_power,
                    n = params.vote_percent, // %vote
                    a = glolab_props.total_vesting_fund_steem.replace(" STEEM", "") / glolab_props.total_vesting_shares.replace(" VESTS", ""),
                    i = reward_fund.reward_balance.replace(" STEEM", "") / reward_fund.recent_claims,
                    r = e / a,
                    p = 10000,
                    o = market_value.base.replace(" SBD", ""),
                    m = parseInt(100 * t * (100 * n) / p);
                m = parseInt((m + 49) / 50);
                var l = parseInt(r * m * 100) * i * o;
                
                resolve({
                         "user": user.name,
                         "steem_power": user.net_steem_power,
                         "voting_power": user.new_voting_power,
                         "vote_value":  l.toFixed(2),
                         "vote_percent":  n
                        });
            }
            catch(e){
                reject(e);
            }
        });
        
    });

}

function getSteemVoteValue(username,vote_percent) {
    return new Promise( function(resolve, reject) {
        vote_value({"handle":username,"vote_percent":vote_percent})
        .then(function(result) {
            resolve(result);
        })
        .catch(function(error){
            reject(error);
        });
    });
}

module.exports = getSteemVoteValue;
