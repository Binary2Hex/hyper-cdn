$(document).ready(function(){
    $('.modal').modal();
});

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope,$http) {

$scope.username = '';
$scope.password = '';
$scope.taskURL = '';

$scope.loginSuccess = false;

$scope.login = function() {
      $http({
          method: 'POST',
          url: '/login',
          data: {username: $scope.username, password: $scope.password}
      }).then(function successCallback (resp){
          console.log(resp);
          if(resp.data.OK) {
              $('#loginModal').modal('close');
              $scope.loginSuccess = true;
              getTaskList();
          } else {
              alert('Login failed');
          }
      }, function errorCallback(response) {
        alert('failed');
      });
};

$scope.submit = function() {
      $http({
          method: 'POST',
          url: '/submitTask',
          data: {url: $scope.taskURL}
      }).then(function successCallback (resp){
          console.log(resp);
          if(resp.statusText == 'OK') {
              $('#submitModal').modal('close');
              // alert('Submit successful');
                setTimeout(function() {
                    getTaskList();
                }, 2000);
          } else {
              alert('Submit failed');
          }
      }, function errorCallback(response) {
        alert('failed');
      });
};

$scope.fetchReport = function () {
    $http.get('/report').success(function(response) {
        $scope.reportList = [];
        if(response.result.status == 'OK') {
            $scope.reportList = JSON.parse(response.result.message);
            $scope.totalBytes = 0;
            $scope.reportList.forEach(function (report) {
                $scope.totalBytes += report.size;
            })
        }
    });
};

function getTaskList() {
  if (!($scope.loginSuccess)) {
    return;
  }
  console.log("get Task List");
  $http.get("getTaksList").success(function (response) {
    var taskToShow = [];
    response.result.forEach(function(task) {
      if (!$scope.customer || $scope.customer == task.customer) {
        taskToShow.push(task);
      }

      if (task.nodes) {
          task.nodesText = '';
          task.nodes.forEach(function(node) {
            if (task.nodesText.length > 0) {
              task.nodesText += ', ';
            }
            task.nodesText += node;
          });
      } else {
          task.nodesText = '';
      }
    });
    $scope.tasks = taskToShow;
    console.log($scope.tasks);
  });
}

function join(x){
  var element = document.getElementById("row"+x.id);
  element.style.visibility = 'visible';
  var width = 1;
  var id = setInterval(function () {
    element.style.width = width + '%';
    if (width >= 900) {
      clearInterval(id);
    } if (width >= 100) {
      width = 0;
    } else {
      width++;
    }
  }, 10);
  $http({
      method: 'POST',
      url: '/join',
      data: {data: x}
  }).then(function successCallback (req){
      console.log(req);
      width = 999;
      var posn = x.url.lastIndexOf('/');
      var fileName = x.url.substring(posn + 1);
      setTimeout(function() {
          getTaskList();
      }, 2000);
      // alert('The file ' + fileName + ' is downloaded successfully.');
  }, function errorCallback(response) {
    alert('failed');
  });
}

$scope.$watch('loginSuccess', function () {
    if($scope.loginSuccess) {
        getTaskList();
        $http.get('getSiteName').success(function(response) {
            $scope.name = response.siteName;
        });
    }
});


$http.get('getCustomerName').success(function(response) {
    $scope.customer = response.customer;
    $scope.isCustomer = $scope.customer && $scope.customer.length > 0;
});

$scope.getTaskList = getTaskList;
$scope.join = join;
});
