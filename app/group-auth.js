/**
 * Created by ae86 on 3/2/17.
 */
var config = require('./config');
var groupAuth = config.get('GROUP_AUTH');

function _filter_file(user, f) {
    if(user.group === undefined){
        var match = false;
        for(var k in groupAuth){
            for (var i=0; i< groupAuth[k]['users'].length; i++){
                var u = groupAuth[k]['users'][i];
                if (user.username == u){
                   user.group = k;
                   match = true;
                   break;
                }
            }
        }
        if(!match)
            user.group = null;
    }
    if(user.group === null){
        console.log( 'User (' + user.username + ') group undefined!');
        return false;
    }
    var regExps = groupAuth[user.group]['regex'];
    for(var i=0; i < regExps.length; i++){
        var regExp = regExps[i];
        console.log('regExp' + regExps[i]);
        if(new RegExp(regExps[i]).test(f))
            return true;
    }
    return false;
}


function _activate() {
    return Boolean(groupAuth);
}

module.exports = {
    activate: _activate,
    filter_file: _filter_file,
};