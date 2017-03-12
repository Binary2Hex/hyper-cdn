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
   var message = response.body.result.message;
   var tasks = JSON.parse(message);
/*
   var tasks = [{ID:'001',customer: 'Movie Candy', url: 'https://abc-lqi.mybluemix.net/movie-candy.zip',type:'Video Image',size:'24MB',contentSize:'120MB',accelerateSites:'12' },
               {ID:'002',customer: 'BCD.com', url: 'xxx',type:'Image',size:'12MB',contentSize:'89MB',accelerateSites:'6' },
               {ID:'003',customer: 'CDE.com', url: 'xxx',type:'JS Image',size:'5MB',contentSize:'20MB',accelerateSites:'90'}];
*/
   for (var i = 0; i < tasks.length; i++) {
       var urlStrings = tasks[i].url.split('/');
       tasks[i].package = urlStrings[urlStrings.length - 1];
   }
   res.json({status: 'OK', result: tasks});
});
}

module.exports.registerCDNNode = function(req, res) {
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
                "{\"name\":\"cdnName1\", \"ip\": \"9.1.2.3\"}"
            ]
            },
            "secureContext": "user_type1_0"
        },
        "id": 0
    },
     json:true
    }, function(error, response, body){
        res.json({status: 'OK'});
    });
}

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
                "cdnName1", taskid
            ]
            },
            "secureContext": "user_type1_0"
        },
        "id": 0
    },
     json:true
    }, function(error, response, body){
        console.log(response);
    });
}

module.exports.submitTask = function(req, res) {
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
                "{\"id\": \"023\",\"customer\": \"For Test\",\"url\":\"https://movie-candy-download-errortest.mybluemix.net/movies.zip\", \"type\": \"Video\",\"size\": \"20MB\",\"contentSize\": \"30MB\"}"
              ]
            },
            "secureContext": "user_type1_0"
          },
          "id": 0
        },
      json:true
  }, function(error, response, body){
      res.end();
  });
};

module.exports.locateCDN = function (ip, taskId, callback) {
  console.log(ip, taskId);

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
          "function": "locateCDN",
          "args": [
            ip, taskId
          ]
        },
        "secureContext": "user_type1_0"
      },
      "id": 0
    },
    json: true
  }, function (error, response, body) {
    console.log(response.body.result);
    if (response.body.result) {
      callback(response.body.result.message);
       module.exports.resourceVisited(taskId, response.body.result.message,ip);
    } else {
      console.error("No Result is shown", error, response.body);
    }
  });
};

module.exports.resourceVisited = function (taskId, nodeName, endPointIP) {

  var reqbody={
      "jsonrpc": "2.0",
      "method": "invoke",
      "params": {
        "type": 1,
        "chaincodeID": {
          "name": config.CHAINCODE
        },
        "ctorMsg": {
          "function": "recordVisit",
          "args": [
            "{\"taskId\":\""+taskId+"\", \"cdnNodeName\": \""+nodeName+"\", \"endpointIP\": \""+ endPointIP + "\", \"size\": 100}"
            ]
        },
        "secureContext": "user_type1_0"
      },
      "id": 0
  };
  console.log(JSON.stringify(reqbody));
  request.post({
    url: config.CHAINHOST + "/chaincode",
    headers: {
      "Content-Type": "application/json"
    },
    body: reqbody,
    json: true
  }, function (error, response, body) {
    console.error("Errors:=======================",error);
  });
};
