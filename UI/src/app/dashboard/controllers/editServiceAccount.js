(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module)
        .controller('EditServiceAccountController', EditServiceAccountController);

    EditServiceAccountController.$inject = ['$uibModalInstance','serviceAccountData','account'];
    function EditServiceAccountController($uibModalInstance, serviceAccountData, account) {

        var ctrl = this;
        ctrl.serviceAccount = account.serviceAccountName;
        ctrl.fileNames = account.fileNames;
        ctrl.id =  account.id;
        // public methods
        ctrl.submit = submit;

        function submit(form) {

            if (form.$valid) {

                $log.info('**DIW-Info** val is ' + document.cdf.serviceAccount.value);
                $log.info('**DIW-Info** val is ' + document.cdf.fileNames.value);

                var account = {
                    "serviceAccount" : document.cdf.serviceAccount.value,
                    "fileNames" : document.cdf.fileNames.value

                };

                serviceAccountData
                    .updateAccount(account,ctrl.id)
                    .success(function (response) {
                        $log.info('**DIW-Info** ' + response);
                        //$scope.apiKey = response;

                        $uibModalInstance.close();
                    })
                    .error(function(response) {
                        $log.error('**DIW-E** ' + response);

                    });
            }
        }
    }
})();