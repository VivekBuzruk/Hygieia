(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module + '.core')
        .directive('apiStatus', apiStatus);

    apiStatus.$inject = ['$log'];
    function apiStatus($log) {
        return {
            restrict: 'E',
            templateUrl: 'app/dashboard/views/api-status.html',
            controller: ['$scope', '$http', '$log', function ApiStatusController($scope, $http, $log) {
              function getAppVersion(){
                  var url = '/api/appinfo';
                  $http.get(url, {skipAuthorization: true})
                  .then(function (response){
                    $scope.appVersion = response.data;
                    $scope.apiup = (response.status == 200);
                    $log.debug("**DIW-D** status:" + response.status);
                }).catch(function(response) {
                    $scope.apiup = false;
                    $scope.appVersion="0.0";
                    $log.error('**DIW-E** Error occurred:', response.status, response.data);
                }).finally(function() {
                    $log.debug("**DIW-D** Task Finished.");
                //   success(function (data, status) {
                //       $log.debug("**DIW-D** appinfo:"+data);
                //       $scope.appVersion=data;
                //       $scope.apiup = (status == 200);
                //   }).error(function(data,status){
                //       $log.error("**DIW-E** appInfo:"+data);
                //       $scope.appVersion="0.0";
                //       $scope.apiup = false;
                  });
              }
              getAppVersion();
            }]
        };
    }
})();
