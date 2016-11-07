var express = require('express');
var router = express.Router();
var passport = require('passport');
var model = require("../model/model");
var request = require('../modules/TimerReminder');
var fs = require("fs");
var blacklist = fs.readFileSync('free_email_provider_domains.txt').toString().split("\r\n");

//router.use(function(req,res,next){
//  if(req.user){
//    next();
//  }else{
//    res.status(401).json({ message: "need to be authenticated before moving on" })
//  }
//});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// validate user before any behavior
router.get("/validate", function(req,res){
  model.ContactModel.findOne({google_id:req.user.id},function(err,result){
    if(!err){
      res.status(200).json(result);
    }else{
      res.status(401);
    }
  });
});

router.post('/register',function(req,res){
  console.log(req.body);
  var domin = req.body.email.match(/@\w+.+/gi)[0].slice(1,-1);
  if(req.body.type == "admin"){
    if(blacklist.indexOf(domin)!= -1){
      res.status(401).json({message:'You can not registered using this email'});
    }else{
      model.ContactModel.register(new model.ContactModel(req.body),req.body.password,function(err){
        if(err){
          console.log(err);
          res.status(400).json({message:'username has been registered'});
        }else{
          res.status(201).json({message:"user has been created successfully"});
        }
      });
    }
  }else{
    model.ContactModel.register(new model.ContactModel(req.body),req.body.password,function(err){
      if(err){
        console.log(err);
        res.status(400).json({message:'username has been registered'});
      }else{
        res.status(201).json({message:"user has been created successfully"});
      }
    });
  }

});

router.post('/login',passport.authenticate('local'),function(req,res){
  console.log(req.user);
  res.status(200).json(req.user);
});


// get all users information
router.get('/contacts',function(req,res){
  model.ContactModel.find(function(err,result){
    if(!err){
      res.status(200).json(result);
    }
  })
});

// update user's profile
router.put('/contacts/:id', function (req, res) {
  console.log(req.body);
  model.ContactModel.findByIdAndUpdate(req.params.id,req.body,function(err,result){
    if(!err){
      res.status(200).json({message:'success'});
    }
  });
});


router.get('/supervisor/:date',function(req,res){
  var date = decodeURIComponent(req.params.date);
  console.log(date);
  model.AttendanceModel.find({date:date}, function(err,result){
    if(!err){
      console.log(result);
      res.status(200).json(result);
    }
  });
});


router.put('/supervisor',function(req,res){
  console.log(req.body);
  if(Array.isArray(req.body)){
    req.body.forEach(function(ele){
      saveAttendance(ele,res);
    });
  }else{
    saveAttendance(req.body,res);
  }
  res.status(201).json({message:'success'});
});

router.get('/attendance/:id',function(req,res){

  model.AttendanceModel.find({google_id:req.params.id}).sort('-date').exec(function(err,result){
    if(!err){
      //console.log(result);
      res.status(200).json(result);
    }else{
      //console.log(err);
    }
  });
});

router.put('/attendance/:id',function(req,res){
  console.log(req.body);
  model.AttendanceModel.findByIdAndUpdate(req.params.id,req.body,function(err,result){
    if(!err){
      console.log(result);
      res.status(200).json({message:'success'});
    }else{
      console.log(err);
      res.status(500).json({message:'server error'});
    }
  })
});

router.post('/log',function(req,res){
  if(Array.isArray(req.body)){
    req.body.forEach(function(ele){
      model.LogModel.create({google_id:ele.google_id,changer_id:ele.google_id,date:ele.date,attendance:ele.attendance},function(err,result){

      })
    })
  }else{
    model.LogModel.create({google_id:req.body.google_id,changer_id:req.body.google_id,date:req.body.date,attendance:req.body.attendance},function(err,result){
      if(!err){
        res.status(201).json({message:'success!'});
      }else{
        res.send(500);
      }
    });
  }
});

router.get('/reminder',function(req,res){
  model.ReminderModel.find(function(err,result){
    if(!err){
      console.log(result);
      res.status(200).json(result);
    }
  })

});
router.post('/reminder',function(req,res){
  console.log('req.body',req.body);
  model.ReminderModel.create(req.body,function(err,result){
    if(!err){
      console.log(result);
      res.status(200).json(result);
    }
  })
})

router.get('/request',function(req,res){
  model.RequestModel.find(function(err,result){
    if(!err){
      res.status(200).json(result);
    }
  })
});

function saveAttendance(body,res){
  model.AttendanceModel.find({google_id:body.google_id,date:body.date},function(err,result){
    if(!err) {
      if(result.length != 0){
        model.AttendanceModel.update({google_id:body.google_id,date:body.date},{attendance:body.attendance},function(err,update_result){
          if(!err){
          }
        });
      }else{
        model.AttendanceModel.create({google_id:body.google_id,date:body.date,attendance:body.attendance, timestamp:body.timestamp},function(err,save_result){
          if(!err){
          }
        });
      }
    }else{
      res.status(500).json(err);
    }
  })
}


module.exports = router;

//router.put('/attendance',function(req,res) {
//  console.log(req.body);
//
//  model.AttendanceModel.find({date: req.body[0].date}, function (err, result) {
//    console.log("result", result);
//    if (!err) {
//      if (result.length != 0) {
//        console.log("updating=================");
//        req.body.forEach(function(ele){
//          result.find({google_id:ele.google_id},function(err,result){
//            if(!err){
//              if(result.length != 0){
//                model.AttendanceModel.update({
//                  google_id: ele.google_id,
//                  date: ele.date
//                }, {attendance: ele.attendance}, function (err, update_result) {
//                  if (!err) {
//                  }
//                });
//              }else{
//                model.AttendanceModel.create({
//                  google_id: ele.google_id,
//                  date: ele.date,
//                  attendance: ele.attendance,
//                  timestamp: ele.timestamp
//                }, function (err, save_result) {
//                  if (!err) {
//
//                  }
//                });
//              }
//            }
//          })
//        });
//        res.status(200).json({message:'success'});
//
//      } else {
//        var lastuser = req.body.reduce(function(pre,cur){
//          model.AttendanceModel.create({
//            google_id: pre.google_id,
//            date: pre.date,
//            attendance: pre.attendance,
//            timestamp: pre.timestamp
//          }, function (err, save_result) {
//            if (!err) {
//
//            }
//          });
//          return cur;
//        });
//        model.AttendanceModel.create({
//          google_id: lastuser.google_id,
//          date: lastuser.date,
//          attendance: lastuser.attendance,
//          timestamp: lastuser.timestamp
//        }, function (err, save_result) {
//          if (!err) {
//            res.status(201).json({message:'success'});
//          }
//        });
//      }
//
//    } else {
//      console.log(err);
//      res.status(500).json(err);
//    }
//  })
//});

