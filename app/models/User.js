const mongoose = require('mongoose'), Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    password: String,
    group : { type: Schema.Types.ObjectId, ref: 'dashboard_group' }
}, { timestamps: true });

userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    if(this.password == candidatePassword){
       cb(null, true);
    }else{
        cb(null, false);
    }
};

userSchema.methods.filterFile = function filterFile(f) {
    if(!this.group || !this.group.filter_regex)
        return false;
    var regExps = this.group.filter_regex;
    for(var i=0; i < regExps.length; i++){
        var regExp = regExps[i];
        console.log('regExp' + regExps[i]);
        if(new RegExp(regExps[i]).test(f))
            return true;
    }
    return false;
}


const User = mongoose.model('dashboard_user', userSchema);


const groupSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    filter_regex: [String],
}, { timestamps: true });


const Group = mongoose.model('dashboard_group', groupSchema);
module.exports = User;