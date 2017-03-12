var config = require('../config');
var request = require('request');
module.exports.getTaskList = function(req, res) {
request.post({
     url: config.CHAINHOST + "/chaincode",
     headers: {
        "Content-Type": "application/json"
     },
     body: {
        "jsonrpc": "2.0",
        "method": "query",
        "params": {
          "type": 1,
          "chaincodeID": {
            "name": config.CHAINCODE
          },
          "ctorMsg": {
            "function": "getTaskList",
            "args": [
              "string"
            ]
          },
          "secureContext": "user_type1_0"
        },
        "id": 0
      },
     json:true
}, function(error, response, body){
   console.log(response.body);
   var message = response.body.result.message;
   if (!message) {
     res.json({status: 'Error', result: 'Message is null.'});
     return;
   } 
   var tasks = JSON.parse(message);
   if (!tasks) {
     res.json({status: 'Error', result: 'Task is null.'});
     return;
   } 
   for (var i = 0; i < tasks.length; i++) {
        var urlStrings = tasks[i].url.split('/');
        tasks[i].package = urlStrings[urlStrings.length - 1];
        tasks[i].joined = false;
        tasks[i].buttonText = "Join";
        var nodes = tasks[i].nodes;
        if (nodes !== null) {
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j] == config.CDN_NODE_NAME) {
                    tasks[i].joined = true;
                    tasks[i].buttonText = "Joined";
                    break;
                }
            }
        }
   }
   res.json({status: 'OK', result: tasks});
});
}

module.exports.registerCDNNode = function() {
    request.post({
     url: config.CHAINHOST + "/chaincode",
     headers: {
        "Content-Type": "application/json"
     },
     body: {
        "jsonrpc": "2.0",
        "method": "invoke",
        "params": {
            "type": 1,  
            "chaincodeID": {
            "name": config.CHAINCODE
            },
            "ctorMsg": {
            "function": "registerCDNNode",
            "args": [
                "{\"name\":\"" + config.CDN_NODE_NAME + "\", \"ip\": \"" + config.CDN_NODE_HOST + "\"}"
            ]
            },
            "secureContext": "user_type1_0"
        },
        "id": 0
    },
     json:true
    }, function(error, response, body){
        console.log(config.CDN_NODE_NAME, 'is registered.');
    });
};

module.exports.claimTask = function(taskid) {
    request.post({
     url: config.CHAINHOST + "/chaincode",
     headers: {
        "Content-Type": "application/json"
     },
     body: {
        "jsonrpc": "2.0",
        "method": "invoke",
        "params": {
            "type": 1,
            "chaincodeID": {
            "name": config.CHAINCODE
            },
            "ctorMsg": {
            "function": "claimTask",
            "args": [
                config.CDN_NODE_NAME, taskid
            ]
            },
            "secureContext": "user_type1_0"
        },
        "id": 0
    },
     json:true
    }, function(error, response, body){
      console.log(response.body.result);
    });
}

module.exports.submitTask = function(req, res, callback) {
  var task = req.body;

  var urlStrings = task.url.split('/');
  var filename = urlStrings[urlStrings.length - 1];
  filename = filename.replace(".zip", "");

  task.id = filename;
  task.type = 'Video';
  task.size = '24MB';
  task.contentSize = '120MB';

  request.post({
      url: config.CHAINHOST + "/chaincode",
      headers: {
          "Content-Type": "application/json"
      },
      body: {
          "jsonrpc": "2.0",
          "method": "invoke",
          "params": {
            "type": 1,
            "chaincodeID": {
              "name": config.CHAINCODE
            },
            "ctorMsg": {
              "function": "submitTask",
              "args": [
                  JSON.stringify({"id": task.id, "customer": config.CUSTOMER, "url": task.url, "type": task.type, "size": task.size, "contentSize": task.contentSize})
              ]
            },
            "secureContext": "user_type1_0"
          },
          "id": 0
        },
      json:true
  }, function(error, response, body){
      console.log(response.body.result);
      callback();
  });
};

module.exports.login = function(username, password, cb) {
    request.post({
     url: config.CHAINHOST + "/registrar",
     headers: {
        "Content-Type": "application/json"
     },
     body: {
        "enrollId": username,
        "enrollSecret": password
    },
     json:true
    }, cb
    );
};

module.exports.getReport = function(customerID, cdnNodeName, cb) {
    console.log('Getting report for', config.CUSTOMER, config.CDN_NODE_HOST);
    request.post({
        url: config.CHAINHOST + "/chaincode",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            "jsonrpc": "2.0",
            "method": "query",
            "params": {
                "type": 1,
                "chaincodeID": {
                    "name": config.CHAINCODE
                },
                "ctorMsg": {
                    "function": "getReport",
                    "args": [
                        config.CUSTOMER || "", config.CDN_NODE_HOST || ""
                    ]
                },
                "secureContext": "user_type1_0"
            },
            "id": 0
        },
        json:true
    }, cb);
    
};

module.exports.confirmRecordVisit = function(taskID, endpointIP, cb) {
    console.log('Getting report for', config.CUSTOMER, config.CDN_NODE_HOST);
    request.post({
        url: config.CHAINHOST + "/chaincode",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            "jsonrpc": "2.0",
            "method": "invoke",
            "params": {
                "type": 1,
                "chaincodeID": {
                    "name": config.CHAINCODE
                },
                "ctorMsg": {
                    "function": "confirmRecordVisit",
                    "args": [
                        taskID, config.CDN_NODE_HOST, endpointIP
                    ]
                },
                "secureContext": "user_type1_0"
            },
            "id": 0
        },
        json:true
    }, cb);
};

