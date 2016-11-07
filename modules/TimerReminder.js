
var CronJob = require('cron').CronJob;
var nodemailer = require('nodemailer');
var model = require("../model/model");


var job1 = new CronJob('00 00 10 * * 1-5',function(){
    console.log('job started');
    sendEmailToUser();
    },function(){
        console.log('job stopped');
    },
    true,
    'America/Los_Angeles'
);

var job2 = new CronJob('00 00 11 * * 1-5',function(){
        console.log('job started');
        sendEmailToUser();
    },function(){
        console.log('job stopped');
    },
    true,
    'America/Los_Angeles'
);

var job3 = new CronJob('00 00 12 * * 1-5',function(){
        console.log('job started');
        sendEmailToSuper();
    },function(){
        console.log('job stopped');
    },
    true,
    'America/Los_Angeles'
);

// send request to users at 10am and 11am
function sendEmailToUser(){

    var userlist = [];
    var userIds = [];
    var attendance = [];
    var usersCheckedin = [];
    model.ContactModel.find(function(err,result){
        if(!err){
            userlist = result;
            model.AttendanceModel.find({date:new Date().toDateString()}, function(err,result){
                if(!err){
                    attendance = result;
                    userlist.forEach(function(ele){
                        userIds.push(ele.google_id);
                    });
                    attendance.forEach(function(ele){
                        usersCheckedin.push(ele.google_id);
                    });
                    userIds = userIds.forEach(function(id){
                        if(usersCheckedin.indexOf(id) === -1){
                            (function amy(id){
                                model.ContactModel.findOne({google_id:id},function(err,result){
                                    sendEmail(result.email);
                                    model.RequestModel.create({receiver:id});
                                });
                            })(id)
                        }
                    });
                }
            });
        }
    });
}


// send request to supervisor at 12pm
function sendEmailToSuper(){

    var userlist = [];
    var userIds = [];
    var attendance = [];
    var usersCheckedin = [];
    model.ContactModel.find(function(err,result){
        if(!err){
            userlist = result;
            model.AttendanceModel.find({date:new Date().toDateString()}, function(err,result){
                if(!err){
                    attendance = result;
                    userlist.forEach(function(ele){
                        userIds.push(ele.google_id);
                    });
                    attendance.forEach(function(ele){
                        usersCheckedin.push(ele.google_id);
                    });
                    userIds = userIds.forEach(function(id){
                        if(usersCheckedin.indexOf(id) === -1){
                            (function amy(id){
                                model.ContactModel.findOne({google_id:id},function(err,result){
                                    var supervisor = result.supervisor;
                                    model.ContactModel.findOne({google_id:supervisor},function(err,result){
                                        if(!err){
                                            if(result){
                                                sendEmail(result.email);
                                                //model.ContactModel.findOne({google_id:s},function(err,result){
                                                model.RequestModel.create({receiver:supervisor});
                                            }
                                        }
                                    });
                                });
                            })(id)
                        }
                    });
                }
            });
        }
    });
}


// sendEmail
function sendEmail(receivers){
    var transporter = nodemailer.createTransport({
        service:'Gmail',
        auth:{
            user:'golivelabs@gmail.com',
            pass:'789uioJKL'
        }
    });

    var mailOptions = {
        from:'golivelabs@gmail.com',
        sender:'admin@golivelabs.com',
        to:receivers,
        subject:'Check In Please',
        text:"You haven't checked in today",
        html:"<b>You haven't checked in today</b>"
    };
    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            return console.log(error);
        }
        console.log(info);

    });
}






