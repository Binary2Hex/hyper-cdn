/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var request = require('request');
var str2json = require('string-to-json');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var http = require('http');
var fs = require('fs');
var path = require('path');
var https = require('https');
var bodyParser = require('body-parser');
// create a new express server
var app = express();
var config = require('./config');
var unzip = require('./routes/unzip');
var logger = require('morgan');
var chaincode = require('./routes/chaincode');


app.use(function (req, res, next) {
    console.log('before response', req.url);
    if (req.url.indexOf('61fee44e-9365-403d-95ec-41be918b8cca') != -1) {
        confirm(req, '61fee44e-9365-403d-95ec-41be918b8cca');
      }
    if (req.url.indexOf('d1657a60-132a-4fa1-ae14-f060172ef85c') != -1) {
        confirm(req, 'd1657a60-132a-4fa1-ae14-f060172ef85c');
      }
    next();
});

// serve the files out of ./public as our main files
app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/resources'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); 




app.get('/', function (req, res) {
  res.render('index');
});
app.get('/getCustomerName', function (req, res) {
  console.log('/getCustomerName', config.CUSTOMER);
  res.json({ customer: config.CUSTOMER});
});
app.get('/getSiteName', function (req, res) {
  if (config.CUSTOMER) {
    res.json({ siteName: config.CUSTOMER});
  } else {
    res.json({ siteName: config.CDN_NODE_NAME});
  }
});

app.get('/getTaksList', function(req, res) {
  chaincode.getTaskList(req, res);
});

function confirm(req, packageID) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // ::ffff:9.123.229.184
  var posn = ip.lastIndexOf(':');
  if (posn !== -1) {
    ip = ip.substring(posn + 1);
  }
  console.log('confirm', packageID, ip);
  chaincode.confirmRecordVisit(packageID, '116.226.172.55, 108.168.250.152');
}
// /Users/liangqi/hyperledger-hackathon/cdn-provider../resources/61fee44e-9365-403d-95ec-41be918b8cca/videos/RESIDENT_EVIL_1080.mp
//For tempopary use to submit task to blockchain.
// app.get('/61fee44e-9365-403d-95ec-41be918b8cca/videos/RESIDENT_EVIL_1080.mp4', function (req, res){
//   var filepath = path.join(__dirname, 'resources/61fee44e-9365-403d-95ec-41be918b8cca/videos/RESIDENT_EVIL_1080.mp4');
//   console.log(filepath);
//   var file = fs.readFileSync(filepath, 'binary');
//   res.setHeader('Content-Length', file.length);
//   res.write(file, 'binary');
//   res.end();
//   confirm(req, '61fee44e-9365-403d-95ec-41be918b8cca');
// });

app.get('/submit', function (req, res){
  chaincode.submitTask(req, res);
});


app.post('/submitTask', function (req, res){
  chaincode.submitTask(req, res, function() {
    res.redirect('/');
  });
});

app.post('/login', function (req, res){
  chaincode.login(req.body.username, req.body.password, function(error, response, body) {
    res.send(body);
  });
});

app.get('/report', function (req, res){
    chaincode.getReport(req.body.username, req.body.password, function(error, response, body) {
        res.send(body);
    });
});

app.post('/join', function (req, res){
  var task = req.body.data;
  var urlStrings = task.url.split('/');
  var filename = urlStrings[urlStrings.length - 1];
  var filepath = path.join(config.RESOURCES_FIR, filename);
  var fileDir = path.join(config.RESOURCES_FIR, filename.replace(".zip", ""));
  var file = fs.createWriteStream(filepath);
  var request = https.get(task.url, function(response) {
    if (response.statusCode == 200) {
      var filePipe = response.pipe(file);
      filePipe.on('close', function() {
        fs.mkdir(fileDir, function(err) {
          if (err && err.code !== "EEXIST") {
            console.log('DEBUG[failure]: mkdir to ' + fileDir);
            res.json({status: 'error'});
          } else {
            unzip(fileDir, filepath).then(function(data) {
              chaincode.claimTask(task.id);
              res.json({status: 'ok'});
              console.log('DEBUG[success]: unziped to ' + fileDir);
            }).catch(function(err) {
              res.json({status: 'error'});
              console.log('DEBUG[failure]: failed to unzip ' + fileDir);
            });
            console.log('DEBUG[success]: Stored to ' + filepath);
          }
        });
      });
    } else {
        res.json({status: 'error'});
    }
  });
}); 

if(config.CDN_NODE_NAME) {
    chaincode.registerCDNNode();
}

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
