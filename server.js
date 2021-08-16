const express = require("express");
const app = express();
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const https = require("https");
const qs = require("querystring");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
//setting ejs as viewengine
app.set('view engine', 'ejs');
//using local files
app.use(express.static("public"));
//allowing app to use body parser
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb+srv://admin-manan:adminmanan@cluster0.svut7.mongodb.net/razorpay', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set("useCreateIndex", true);









let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hackathonproject77@gmail.com',
        pass: 'hackathon611@nitj'
    }
});







const userSchema = new mongoose.Schema({
  password: String,
  fullName: String,
  email: String,
  state : String,
  country : String,
  essay : String,
  key : String,
  paymentMade : Boolean,
  grade1 : Number,
  grade2: Number,
  grade : Number,
  remarks  :String
});

const referralSchema = new mongoose.Schema({
  referralCode : String,
  nameOfMarketor : String,
  accBalance : Number,
  phoneNumber : Number,
  email : String,
  passwordOfMarketor : String
});


const User = new mongoose.model("User",userSchema );
const Referral = new mongoose.model("Referral", referralSchema);

const razorpay = new Razorpay({
  key_id: 'rzp_test_RjJi59dIpovzTJ',
  key_secret : 'MT6DjVUAzD0uG91nzxoCQxAB'
})

app.post("/:routeKey/orders", function(req, res){
  console.log("the route key is " + req.params.routeKey);
  console.log("the essay is " + req.body.essay);


  console.log("categeory is " + req.body.categeory);
  User.findOneAndUpdate({ key: req.params.routeKey }, { essay: req.body.essay, state : req.body.categeory} , (err, update) => {
    if (err) {
      console.log(err);
    } else {
      console.log("essay and categeory updated");
    }
  })



  let options = {
    amount : "50000",
    currency : "INR",
  }
  // console.log(req);/
  razorpay.orders.create(options, function(err, order){
    // console.log(order);
    // var orderid = order.id;
    // console.log(orderid);
    res.json(order);
  })
});


app.post("/:referralCode/:routeKey/orders", function(req, res){
  console.log("the route key is " + req.params.routeKey);
  console.log("the details are " +  JSON.stringify(req.body));
  console.log("the referral code is " + req.params.referralCode);



  User.findOneAndUpdate({ key: req.params.routeKey }, { essay: req.body.essay, state : req.body.categeory} , (err, update) => {
    if (err) {
      console.log(err);
    } else {
      console.log("essay and categeory updated");
    }
  })
  let options = {
    amount : "50000",
    currency : "INR",
  }
  // console.log(req);/
  razorpay.orders.create(options, function(err, order){
    // console.log(order);
    // var orderid = order.id;
    // console.log(orderid);
    res.json(order);
  })
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.post("/payment-complete/:routeKey", function(req, res){
        console.log("req body in payment-complete is " + JSON.stringify(req.body));


        User.findOneAndUpdate({ key: req.params.routeKey }, { paymentMade: true} , (err, update) => {
          if (err) {
            console.log(err);
          } else {
            console.log("data updated");
          }
        })




        // Referral.findOne({referralCode : referralCodeInput }, function(err, data){
        //    if(data){
        //         console.log(data);
        //          prevBalance = data.accBalance;
        //          console.log("Prev balance is " + prevBalance);
        //          Referral.findOneAndUpdate({ referralCode: ref }, { accBalance: prevBalance+10} , (err, update) => {
        //            if (err) {
        //              console.log(err);
        //            } else {
        //              console.log("data updated");
        //            }
        //          })
        //    }
        //    else{
        //      console.log(err);
        //    }
        // });


        let email;
        User.findOne({key : req.params.routeKey }, function(err, data){
           if(data){
                console.log(data);
                email = data.email;
                let mailDetails = {
                    from: 'hackathonproject77@gmail.com',
                    to: email,
                    subject: "Payment Done!",
                    text: 'We have recieved your payment and submitted your essay.\nWe will inform you whenever the result will come.'
                };

                mailTransporter.sendMail(mailDetails, function(err, data) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log('Email sent successfully');
                    }
                });
           }
           else{
             console.log(err);
           }
        });








        res.sendFile(__dirname + "/payment-done.html");
})

// const referral = new Referral({
//   referralCode : "ppqr",
//   nameOfMarketor : "marketor",
//   accBalance : 0,
//   phoneNumber : "69849849",
//   email : "email@marketor.com"
// })
// referral.save();
// console.log("marketor saved");

app.post("/payment-complete/:userUId/:routeKey", function(req, res){
        console.log(req.body);



        User.findOneAndUpdate({ key: req.params.routeKey }, { paymentMade: true} , (err, update) => {
          if (err) {
            console.log(err);
          } else {
            console.log("data updated");
          }
        })





        Referral.findOne({referralCode : req.params.userUId }, function(err, data){
           if(data){
                console.log(data);
                let prevBalance = data.accBalance;
                 console.log("Prev balance is " + prevBalance);
                 Referral.findOneAndUpdate({ referralCode: req.params.userUId }, { accBalance: prevBalance+10} , (err, update) => {
                   if (err) {
                     console.log(err);
                   } else {
                     console.log("data updated");
                   }
                 })
           }
           else{
             console.log(err);
           }
        });



        let email;
        User.findOne({key : req.params.routeKey }, function(err, data){
           if(data){
                console.log(data);
                email = data.email;
                let mailDetails = {
                    from: 'hackathonproject77@gmail.com',
                    to: email,
                    subject: "Payment Done!",
                    text: 'We have recieved your payment and submitted your essay.\nWe will inform you whenever the result will come.'
                };

                mailTransporter.sendMail(mailDetails, function(err, data) {
                    if(err) {
                        console.log('Error Occurs');
                    } else {
                        console.log('Email sent successfully');
                    }
                });

           }
           else{
             console.log(err);
           }
        });




















        res.sendFile(__dirname + "/payment-done.html");
})





app.get("/", (req, res) => {
  //user comes to the homepage and then is going to fill the form.
  res.sendFile(__dirname + "/home-signup.html");
});
app.get('/:userUId', function (req, res) {
  //user has came to the site using a refferal and is going to fill the form
  //the userUId is the referral code attached along with the url

  res.render("home-signup-referral", {referralCode : req.params.userUId});

});


app.post("/", function(req, res){
  //user has filled the form of the normal website
   var nameEntered = req.body.name;
   var emailEntered = req.body.email;
   var passwordEntered = req.body.password;
   var stateEntered = req.body.state;
   var countryEntered = req.body.country;
   //key is been generated.
   const key = makeid(4) + (Math.floor(Math.random()*10000) + 1);
   // console.log("the key is " + key);
   //new user object is being created with payment done = false
   //and essay as an empty string
   var newuser = new User({
     password: passwordEntered,
     fullName: nameEntered,
     email: emailEntered,
     state : stateEntered,
     country : countryEntered,
     essay : "",
     key : key,
     paymentMade : false,
     grade1 : 0,
     grade2 : 0,
     grade: 0,
     remarks:"not yet given"
   })
   //saving user
   newuser.save();

   let mailDetails = {
       from: 'hackathonproject77@gmail.com',
       to: emailEntered,
       subject: "Registration Done!",
       text: 'Your unique key is '+ key + ' and password is ' + passwordEntered + '\nYou can login later using these credentials to see the result when announced.'
   };

   mailTransporter.sendMail(mailDetails, function(err, data) {
       if(err) {
           console.log('Error Occurs');
       } else {
           console.log('Email sent successfully');
       }
   });














   //directing to the dashboard passing key as the parameters.
   res.redirect("/dashboard/" + dashboardNumber +"/" + key);
})


app.post("/:userUId/", function(req, res){

  //user has filled the form using some refferal code website
   var nameEntered = req.body.name;
   var emailEntered = req.body.email;
   var passwordEntered = req.body.password;
   var stateEntered = req.body.state;
   var countryEntered = req.body.country;

   //unique key for user is generated
   const key = makeid(4) + (Math.floor(Math.random()*10000) + 1);
   // new user creation
   var newuser = new User({
     password: passwordEntered,
     fullName: nameEntered,
     email: emailEntered,
     state : stateEntered,
     country : countryEntered,
     essay : "",
     key : key,
     paymentMade : false,
     grade1 : 0,
     grade2 : 0,
     grade : 0,
     remarks:"not yet given"
   })
   newuser.save();



   let mailDetails = {
       from: 'hackathonproject77@gmail.com',
       to: emailEntered,
       subject: "Registration Done!",
       text: 'Your unique key is '+ key + ' and password is ' + passwordEntered + '\nYou can login later using these credentials to see the result when announced.'
   };

   mailTransporter.sendMail(mailDetails, function(err, data) {
       if(err) {
           console.log('Error Occurs');
       } else {
           console.log('Email sent successfully');
       }
   });

   //user is now redirected to dashboard with paramters as 1.) the referral code
   // 2.) the unique key of the user.
   res.redirect("/" + req.params.userUId + "/dashboard/" + dashboardNumber + "/" + key);
})
var dashboardNumber = 1;

app.get("/dashboard/"  + 1 + "/:key", function(req, res){
  //once user comes here, we show two options
  // 1.) refer to friend
  //2.) fill the esssay form
  //and these both things are included in the same form
  //route key is passed because when user will make post request on ordre page,
  //this routeKey(uniqueKey will be attached there also)
  //(this routeKey is used in axios post request )
  setTimeout(myFunc, 2000, 'funky');
  function myFunc(){
    User.findOne({key : req.params.key }, function(err, data){
       if(data){
            // console.log("the data is " + data);
            let paymentMade  = data.paymentMade;
            let password = data.password;
            let sendingData = "";
            for(var i = 0; i<password.length - 3; i++){
                sendingData = sendingData + "*";
            }
            sendingData = sendingData + password.substr(password.length-3, password.length);
            // console.log(sendingData);
            // console.log(password);
            // console.log(paymentMade);
            res.render("dashboard", {routeKey : req.params.key, password : sendingData, paymentMade : paymentMade });
       }
       else{
              res.render("dashboard", {routeKey : req.params.key, password : "*******", paymentMade : paymentMade });
       }
    });

  }



})



app.get("/dashboard/"  + 2 + "/:key", function(req, res){
  //once user comes here, we show two options
  // 1.) refer to friend
  //2.) fill the esssay form
  //and these both things are included in the same form
  //route key is passed because when user will make post request on ordre page,
  //this routeKey(uniqueKey will be attached there also)
  //(this routeKey is used in axios post request )
  setTimeout(myFunc, 2000, 'funky');
  function myFunc(){
    User.findOne({key : req.params.key }, function(err, data){
       if(data){
            console.log("the data is " + data);
            let paymentMade  = data.paymentMade;
            let password = data.password;
            let sendingData = "";
            for(var i = 0; i<password.length - 3; i++){
                sendingData = sendingData + "*";
            }
            sendingData = sendingData + password.substr(password.length-3, password.length);
            console.log(sendingData);
            console.log(password);
            // console.log(paymentMade);
            res.render("dashboard2", {routeKey : req.params.key, password : sendingData, paymentMade : paymentMade });
       }
       else{
              res.render("dashboard2", {routeKey : req.params.key, password : "*******", paymentMade : paymentMade });
       }
    });

  }



})
app.get("/:userUId/dashboard/" + 1 + "/:key", function(req, res){
  User.findOne({key : req.params.key }, function(err, data){
     if(data){
          console.log(data);
          let paymentMade  = data.paymentMade;
          let password = data.password;
          let sendingData = "";
          for(var i = 0; i<password.length - 3; i++){
              sendingData = sendingData + "*";
          }
          sendingData = sendingData + password.substr(password.length-3, password.length);

          res.render("dashboard-referral", {routeKey :req.params.key, referralCode : req.params.userUId, password : sendingData, paymentMade : paymentMade  });
     }
     else{
       console.log(err);
     }
  });

})




app.get("/:userUId/dashboard/" + 2 + "/:key", function(req, res){
  User.findOne({key : req.params.key }, function(err, data){
     if(data){
          console.log(data);
          let paymentMade  = data.paymentMade;
          let password = data.password;
          let sendingData = "";
          for(var i = 0; i<password.length - 3; i++){
              sendingData = sendingData + "*";
          }
          sendingData = sendingData + password.substr(password.length-3, password.length);

          res.render("dashboard-referral2", {routeKey :req.params.key, referralCode : req.params.userUId, password : sendingData, paymentMade : paymentMade  });
     }
     else{
       console.log(err);
     }
  });

})

app.get("/referral/signup", function(req,res){
  res.sendFile(__dirname + "/signup-marketor.html");
})
app.post("/referral/signup", function(req,res){
  User.findOne({key : req.body.routeKey }, function(err, data){
     if(data){
       const referralCodeGenerated = makeid(6);
       console.log(data);
       const newMarketor = new Referral({
         referralCode : referralCodeGenerated,
         nameOfMarketor : req.body.name,
         accBalance : 0,
         email : data.email,
         passwordOfMarketor : data.password
       })
       newMarketor.save();
       let mailDetails = {
           from: 'hackathonproject77@gmail.com',
           to: data.email,
           subject: "Referral Link generated!",
           text: 'Your referral link is https://fast-dusk-69618.herokuapp.com/' + referralCodeGenerated +" and password is " + data.password + "\nYou can check your balance later using these credentials."
       };

       mailTransporter.sendMail(mailDetails, function(err, data) {
           if(err) {
               console.log('Error Occurs');
           } else {
               console.log('Email sent successfully');
           }
       });
       var link =  'https://fast-dusk-69618.herokuapp.com/' + referralCodeGenerated;
       res.render('referral-signup-done', {link : link});
     }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });

})



app.get("/login/marketor", function(req, res){
  res.sendFile(__dirname + "/login-marketor.html");
})

app.post("/login/marketor" , function(req, res){
  Referral.findOne({referralCode : (req.body.referralLink).substr(req.body.referralLink.length-6,req.body.referralLink.length ), passwordOfMarketor : req.body.password}, function(err, data){
     if(data){
           var currentbalance = data.accBalance;
           res.render('balance-check', {balance : currentbalance});
     }
     else{
       console.log(err);
     }
  });
})


app.get("/login/person", function(req, res){
  res.sendFile(__dirname + "/home-login.html");
})
app.post("/login/person", function(req, res){
  User.findOne({key : req.body.routeKey }, function(err, data){
     if(data){
          if(data.password == req.body.password){
            console.log(dashboardNumber);
              res.redirect("/dashboard/" + dashboardNumber + "/"+ req.body.routeKey );
          }

     }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });
});




app.get("/login/person/:userUId", function(req, res){
  res.render("home-login-referral" , {userUId : req.params.userUId});
})
app.post("/login/person/:userUId", function(req, res){
  User.findOne({key : req.body.routeKey }, function(err, data){
     if(data){
          if(data.password == req.body.password){
            console.log(dashboardNumber);
            res.redirect("/"+ req.params.userUId + "/dashboard/"  + dashboardNumber + "/"+  req.body.routeKey );
          }
          else{
            res.send("WRONG PASSWORD");
          }

     }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });
});

var referrals;
var users;
app.get("/admin/dashboard", function(req, res){
  User.find().exec(function (err, results) {
  users = (results.length);
  console.log("total users are "  + users);
          Referral.find().exec(function (err, results) {
          referrals = results.length;
          console.log("total referrals are "  + referrals);
          User.find({paymentMade : true }, function(err, data){
             if(data){
                  console.log(data.length);
                  res.render("admin-dashboard-main", {referrals : referrals, registrations : users, submissions: data.length});
             }
             else{
               res.send("NO SUCH DATA FOUND");
             }
          });

          });


  });
})

app.get("/admin/dashboard/qwertyuiop/grading1", function(req, res){
  User.find().exec(function (err, results) {
  users = (results.length);
  console.log("total users are "  + users);
          Referral.find().exec(function (err, results) {
          referrals = results.length;
          console.log("total referrals are "  + referrals);
          User.find({paymentMade : true }, function(err, data){
             if(data){
                  console.log(data.length);
                  res.render("admin-dashboard-1", {referrals : referrals, registrations : users, submissions: data.length});
             }
             else{
               res.send("NO SUCH DATA FOUND");
             }
          });

          });


  });
})




app.get("/admin/dashboard/zxcvbnm/grading2", function(req, res){
  User.find().exec(function (err, results) {
  users = (results.length);
  console.log("total users are "  + users);
          Referral.find().exec(function (err, results) {
          referrals = results.length;
          console.log("total referrals are "  + referrals);
          User.find({paymentMade : true }, function(err, data){
             if(data){
                  console.log(data.length);
                  res.render("admin-dashboard-2", {referrals : referrals, registrations : users, submissions: data.length});
             }
             else{
               res.send("NO SUCH DATA FOUND");
             }
          });

          });


  });
})








app.get("/admin/grading1/qwertyuiop", function(req, res){
  User.find({paymentMade : true }, function(err, data){
     if(data){
          console.log(data.length);
          res.render("admin-grading-1", {dataArray : data});
     }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });
})

app.post("/admin/grading1/:routeKey/qwertyuiop", function(req, res){
  User.findOneAndUpdate({ key: req.params.routeKey }, { grade1 : req.body.grade1} , (err, update) => {
    if (err) {
      console.log(err);
    } else {
      console.log("grade updated");
      User.find({paymentMade : true }, function(err, data){
         if(data){
              console.log(data.length);
              res.render("admin-grading-1", {dataArray : data});
         }
         else{
           res.send("NO SUCH DATA FOUND");
         }
      });
    }
  })

})












app.get("/admin/grading2/zxcvbnm", function(req, res){
  User.find({paymentMade : true }, function(err, data){
     if(data){
          console.log(data.length);
          res.render("admin-grading-2", {dataArray : data});
     }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });
})

app.post("/admin/grading2/:routeKey/zxcvbnm", function(req, res){
  User.findOneAndUpdate({ key: req.params.routeKey }, { grade2 : req.body.grade2} , (err, update) => {
    if (err) {
      console.log(err);
    } else {
      console.log("grade updated");
      User.find({paymentMade : true }, function(err, data){
         if(data){
              console.log(data.length);
              res.render("admin-grading-2", {dataArray : data});
         }
         else{
           res.send("NO SUCH DATA FOUND");
         }
      });
    }
  })

})





app.get("/admin/grading/asdfghjkl", function(req, res){
  User.find({paymentMade : true }, function(err, data){
     if(data){
          console.log(data.length);
          res.render("admin-grading-main", {dataArray : data});
     }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });
})

app.post("/admin/grading/:routeKey/asdfghjkl", function(req, res){
  User.findOneAndUpdate({ key: req.params.routeKey }, { grade : req.body.grade} , (err, update) => {
    if (err) {
      console.log(err);
    } else {
      console.log("grade updated");
      User.find({paymentMade : true }, function(err, data){
         if(data){
              console.log(data.length);
              res.render("admin-grading-main", {dataArray : data});
         }
         else{
           res.send("NO SUCH DATA FOUND");
         }
      });
    }
  })

})




app.get("/essay/reading/:routeKey", function(req, res){
  User.find({key : req.params.routeKey }, function(err, data){
     if(data){

          res.render("essay-full", {data : data});
     }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });
})


app.get("/findresult/student", function(req, res){
      res.render("find-result", {data : null});
})

app.post("/findresult/student", function(req, res){
  User.find({key : req.body.routeKey }, function(err, data){
     if(data){
          console.log(data.length);
          res.render("find-result", {data : data, overAllGrade : Math.floor((data[0].grade1 + data[0].grade2 +  data[0].grade)/3) });
     }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });
})


app.post("/announce/result/done", function(req, res){
      dashboardNumber = 2;
      console.log("done");
      res.send("done");
})

app.get("/announce/result", function(req, res){
  res.sendFile(__dirname + "/announce.html");
})





app.get("/forgot/password", function(req, res){
  res.sendFile(__dirname + "/forgot-password.html");
})
app.post("/forgot/password", function(req, res){
  User.find({email : req.body.email }, function(err, data){
     if(data.length == 0){
       console.log(data);
       let mailDetails = {
           from: 'hackathonproject77@gmail.com',
           to: req.body.email,
           subject: "Forgot Password?",
           text: 'Here is your unique key :' + data[0].key +" and password is " + data[0].password + "\nYou can login now"
       };

       mailTransporter.sendMail(mailDetails, function(err, data) {
           if(err) {
               console.log('Error Occurs');
           } else {
               console.log('Email sent successfully');
           }
       });
          res.sendFile(__dirname + "/email-sent-for-password.html");
     }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });
})


app.get("/download/newcertificate", function(req, res){
  res.sendFile(__dirname + "/download-certificate.html");
})
app.post("/download/certificate/:key", function(req, res){
  User.find({key : req.params.key }, function(err, data){
     if(data){
          console.log(data);
          console.log(data[0].fullName);
          res.render("download-certificate", {name : data[0].fullName, remarks : data[0].remarks});
        }
     else{
       res.send("NO SUCH DATA FOUND");
     }
  });

})



app.listen(port, function() {
  console.log("Server started succesfully");
});


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
   }
   return result;
}
