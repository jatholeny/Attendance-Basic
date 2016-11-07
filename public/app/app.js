var app = angular.module("contactApp", ["ui.router",'ngMaterial']);
app.controller("mainCtrl", function($scope){
    $scope.message = "Hello World";
});

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('landing', {
        url: '/landing',
        controller: 'LandingController',
        templateUrl: 'app/_landing.html'
    }).state('login',{
        ulr:'^/login',
        controller:'LoginController',
        templateUrl:'app/_login.html'
    }).state('checkin',{
        url:'^/checkin',
        controller:'CheckinController',
        templateUrl:'app/_checkin.html'
    }).state('profile', {
        url: '^/profile',
        controller: 'ProfileController',
        templateUrl: 'app/_profile.html'
    }).state('landing.supervisor',{
        url: '^/supervisor',
        controller: 'SupervisorController',
        templateUrl: 'app/_supervisor.html'
    }).state('attendance',{
        url:'^/attendance',
        controller:'AttendanceController',
        templateUrl:'app/_attendance.html'
    }).state('landing.admin',{
        url:'^/admin',
        controller:'AdminController',
        templateUrl:'app/_admin.html'
    });

    $urlRouterProvider.otherwise('/landing');
});
app.controller("LoginController",function($scope , ContactService){
    $scope.user = {};
    $scope.login = function(){
        if(typeof $scope.user.username ==='undefined' || typeof $scope.user.password==='undefined'){
            alert('Please fill info!');
        }else{
            ContactService.login($scope.user).then(function(response){
                $scope.message = response.data.message;
                $scope.user = {};
                console.log("success",response.data);
                //ContactService.user = response.data.user;

                $window.location.href = '/';
                //$state.go('authenticated');
            }, function(response){
                console.log(response);
                $scope.message = response.data;
                $scope.user = {};
            });
        }}
});

app.controller("LandingController", function($scope, $rootScope,ContactService){
    $scope.googleUrl = '/auth/google';
    //if(!$scope.user){
    //    ContactService.validate().then(function(config){
    //        console.log(config.data);
    //        $rootScope.user = config.data;
    //    });
    //}
    $scope.user = {};
    $scope.admin = false;
    $scope.register = function(){
        console.log($scope.user);
        $scope.user.email = $scope.user.username;
        if($scope.admin==true){
            $scope.user.type = "admin"
        }else{
            $scope.user.type = "staff"
        }
        ContactService.register($scope.user).then(function(response){
            $scope.message = response.data.message;
            //$scope.user = {};
        },function(response){
            $scope.message = response.data.message;
            //$scope.user = {};
        })
    }
});

app.controller('CheckinController',function($scope,ContactService,$state){
    ContactService.validate().then(function(config){
        $scope.user = config.data;
        $scope.today = new Date();
        $scope.user.date = new Date().toDateString();
    },function(){
       $state.go('landing');
    });
    $scope.check = function(c){
        $scope.user.attendance = c;
        ContactService.updateAllAttendence($scope.user).then(function(result)
        {
           $scope.message = result.data.message;
            $scope.user.changer_id = $scope.user.google_id;
           ContactService.saveLog($scope.user).then(function(result){
               console.log(result.data);
           });
        });
    };
});
app.controller('ProfileController',function ($scope, $state, ContactService) {
    ContactService.validate().then(function(config){
        console.log(config.data);
        $scope.user = config.data;
    },function(){
        $state.go('landing');
    });
    $scope.save = function ($event) {
        // saves the user to the database
        console.log($scope.user._id);
        ContactService.updateProfile($scope.user).then(function (data) {
            console.log(data.data);
            $scope.message = data.data.message;
        }, function (config) {
            console.log('error');
            $scope.message = 'connection error';
            //ErrorDialog.showDialog($event);
        });
    };

});

app.controller('SupervisorController', function($scope,$state, ContactService){
    ContactService.validate().then(function(config){
        console.log(config.data);
        $scope.user = config.data;
    },function(){
        $state.go('landing');
    });
    $scope.date = new Date();
    $scope.maxDate = new Date();
    $scope.pickdate = function(){
            $scope.message = '';
            var date = encodeURIComponent($scope.date.toDateString());
            ContactService.getAllAttendance(date).then(function(data_attendance) {
                if (data_attendance.data.length != 0 ) {
                    console.log("right now change the front end",data_attendance.data );
                    $scope.userlist.forEach(function(ele_contact){
                        ele_contact.attendance = false;
                        data_attendance.data.forEach(function(ele_attendance){
                            if (ele_attendance.google_id === ele_contact.google_id) {
                                ele_contact.attendance = ele_attendance.attendance;
                            }
                        })
                    })
                } else {
                    $scope.userlist.forEach(function (ele_contact) {
                        ele_contact.attendance = false;
                        console.log(ele_contact);
                    })
                }
                console.log("change over", $scope.userlist);
            },function(){
                $scope.userlist.forEach(function (ele_contact) {
                    ele_contact.attendance = false;
                    console.log(ele_contact);
                });
            });
    };
    ContactService.getProfiles().then(function(result){
        $scope.userlist = result.data;
        $scope.pickdate();
    },function(){
        //ErrorDialog.showDialog();
    });

    $scope.save = function(userlist){
        $scope.attendance=[];
        userlist.forEach(function(ele){
            ele.change_id = $scope.user.google_id;
            ele.date = $scope.date.toDateString();
            $scope.attendance.push(ele);
        });
        ContactService.updateAllAttendence($scope.attendance).then(function(result){
            $scope.message = result.data.message;
            ContactService.saveLog($scope.attendance).then(function(result){
                console.log(result.data);
            })
        },function(){
            $scope.message = 'connection error!';
            //ErrorDialog.showDialog();
        })
    };
    $scope.requests;

    $scope.getrequest = function(){
        ContactService.getrequests().then(function(result){
            $scope.requests = result.data;
        })
    }
});

app.controller('AttendanceController',function($scope,$state,ContactService){
    ContactService.validate().then(function(config){
        $scope.user = config.data;
        ContactService.getPersonalAtt($scope.user.google_id).then(function(result){
            $scope.result = result.data;
            console.log(result.data);
            $scope.result.forEach(function(ele){
                ele.date = new Date(ele.date).toISOString().substr(0,10);
            });
        },function(err){
        })
    },function(){
        $state.go('landing');
    });
    $scope.saveComment = function(attendance){
        console.log('aa');
        ContactService.updatePersonalAtt(attendance).then(function(result){
            console.log(result.data);
        },function(err){
            console.log(err);
            //ErrorDialog.showDialog();
        });
    }

});
app.controller('AdminController',function($scope,$state,ContactService){
    $scope.usertype=['staff','student','supervisor','admin'];
    $scope.times=['09:00AM','10:00AM','11:00AM','12:00PM','1:00PM',];
    $scope.timebuffers=['15min','30min','45min','59min'];
    $scope.userstatus=['available','positioned','notavailable']
    $scope.reminders;
    ContactService.getProfiles().then(function(result){
        console.log(result.data);
        $scope.userlist=result.data;
    })
    ContactService.getreminder().then(function(result){
        console.log(result.data);
        $scope.reminders = result.data;
    })
    $scope.addtime=function(addtimerule){
        console.log(addtimerule);
        ContactService.postTimerules(addtimerule).then(function(result){
            console.log(result.data);
            ContactService.getreminder().then(function(result){
                console.log(result.data);
                $scope.reminders = result.data;
            })
        })
    };
    $scope.save=function(users){
        users.forEach(function(ele){
            ContactService.updateProfile(ele).then(function(result){
                console.log(result.data);
            })
        })

    }
});

app.factory('ErrorDialog',function($mdDialog){
    return{
        showDialog:function($event){
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(document)
                    .clickOutsideToClose(true)
                    .title('Error')
                    .textContent('Please check your connection!')
                    .ok('Got it')
                    .targetEvent($event)
            );
        }
    }
});
app.factory('ContactService',function($http){
   return{
       validate:function(){
           return $http.get('validate');
       },
       register:function(user){
           return $http.post('/register',user);
       },
       login:function(user){
           return $http.post('/login',user);
       },
       getProfiles:function(){
           return $http.get('/contacts');
       },
       updateProfile:function(body){
           return $http.put('/contacts/'+body._id,body);
       },
       getAllAttendance:function(date){
           return $http.get('/supervisor/'+date)
       },
       updateAllAttendence:function(body){
           return $http.put('/supervisor',body)
       },
       getPersonalAtt:function(id){
           return $http.get('/attendance/'+id)
       },
       updatePersonalAtt:function(body){
           return $http.put('/attendance/'+body._id,body)
       },
       saveLog:function(body){
           return $http.post('/log',body);
       },
       getreminder:function(){
           return $http.get('/reminder');
       },
       postTimerules:function(addtimerule){
           return $http.post('/reminder',addtimerule);
       },
       getrequests:function(){
           return $http.get('/request');
       }

   }
});

