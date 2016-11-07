var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose');

//var localUser = new mongoose.Schema({});
//localUser.plugin(passportLocalMongoose);
//var LocalUserModel = mongoose.model('localUser',localUser);
//LocalUserModel.add({google_id: {
//    unique: true,
//    type: String
//}});
//LocalUserModel.add({google_user: mongoose.Schema.Types.Mixed,})
//LocalUserModel.add({name: {
//    first: String,
//    last: String
//},})
//LocalUserModel.add({photo:String})
//LocalUserModel.add({type:String})
//LocalUserModel.add({supervisor:String})
//LocalUserModel.add({status:String})
//LocalUserModel.add({address:{
//    github:String,
//    linkedin:String
//}})
var Userschema = new mongoose.Schema({
    //setting google id
    google_id: {
        type: String,
        unique:true,
        sparse:true
    },
    google_user: mongoose.Schema.Types.Mixed,
    name: {
        first: String,
        last: String
    },
    email:{
        unique:true,
        type:String
    },
    photo:String,
    type:String, //supervisor,staff,student
    supervisor:String,
    status:String,
    address:{
        github:String,
        linkedin:String
    },
    organization:String
});
Userschema.plugin(passportLocalMongoose);
var ContactModel = mongoose.model("attendanceUser", Userschema);
//var ContactModel = mongoose.model("googleUser", new mongoose.Schema({
//    //setting google id
//    google_id: {
//        unique: true,
//        type: String
//    },
//    google_user: mongoose.Schema.Types.Mixed,
//    name: {
//        first: String,
//        last: String
//    },
//    email: String,
//    photo:String,
//    type:String, //supervisor,staff,student
//    supervisor:String,
//    status:String,
//    address:{
//        github:String,
//        linkedin:String
//    }
//}));

var AttendanceModel = mongoose.model("attendance", new mongoose.Schema({
    //setting google id
    google_id: {
        type: String
    },
    user_id:String,
    date:{ type: Date },
    attendance:{ type: Boolean, default: false },
    comment:{type:String},
    timestamp:{ type: Date, default: Date.now() }
}));

var LogModel = mongoose.model('log',new mongoose.Schema({
    google_id:String,
    changer_id:String,
    date:{type:Date},
    attendance:{type:Boolean},
    timestamp:{type:Date,default:Date.now()}
}));

var RequestModel = mongoose.model('request',new mongoose.Schema({
    name:String,
    receiver:String,
    timestamp:{type:String,default:Date.now()}
}));

var ReminderModel = mongoose.model('reminder',new mongoose.Schema({
    time:String,
    escalation:String,
    buffer:String
}));

module.exports = {
    ContactModel: ContactModel,
    AttendanceModel:AttendanceModel,
    LogModel:LogModel,
    RequestModel:RequestModel,
    ReminderModel:ReminderModel
};
