/**
 * Gets build related data
 */
(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module + '.core')
        .factory('signupData', signupData);

    function signupData($http, $log) {
        var testDetailRoute = 'test-data/signup_detail.json';
        var SignupDetailRoute = '/api/registerUser';

        return {
            signup: signup
        };


        // reusable helper
        function getPromise(id,passwd,route) {
          var postData={
              'id': id,
              'passwd': passwd
            };
            return $http.get(route).then(function (response) {
              $log.info("**DIW-Info** Data="+ JSON.stringify(response.data));
                return response.data;
            });
        }

      function signup(id,passwd){
        var postData={
    				'username': id,
    				'password': passwd
    			};
          if(HygieiaConfig.local)
          {
            $log.info("**DIW-Info** In local testing");
            return getPromise(id,passwd,testDetailRoute);
          }
          else
          {
        return $http.post(SignupDetailRoute,postData);
      }
    }
  }
})();
