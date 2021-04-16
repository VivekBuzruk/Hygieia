(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module)
        .controller('EditApiTokenController', EditApiTokenController);

    EditApiTokenController.$inject = ['$uibModalInstance','userData','tokenItem'];
    function EditApiTokenController($uibModalInstance, userData, tokenItem) {

        var ctrl = this;
        ctrl.apiUser = tokenItem.apiUser;
        ctrl.date =  new Date(tokenItem.expirationDt);

        // public methods
        ctrl.submit = submit;

        function submit(form) {

            form.expDt.$setValidity('apiTokenError', true);

            if (form.$valid) {
                $log.info('**DIW-Info** val is ' + document.cdf.apiUser);
                $log.info('**DIW-Info** val is ' + document.cdf.apiUser.value);
                $log.info('**DIW-Info** dt is ' + document.cdf.expDt);
                $log.info('**DIW-Info** dt is ' + document.cdf.expDt.value);
                var id = tokenItem.id
                var selectedDt = Date.parse(document.cdf.expDt.value);
                var momentSelectedDt = moment(selectedDt);
                var timemsendOfDay = momentSelectedDt.endOf('day').valueOf();

                var apitoken = {
                    "apiUser" : document.cdf.apiUser.value,
                    "expirationDt" : timemsendOfDay
                };

                userData
                    .updateToken(apitoken, id)
                    .success(function (response) {
                        $log.info('**DIW-Info** ' + response);
                        $uibModalInstance.close();
                    })
                    .error(function(response) {
                        $log.error('**DIW-E** ' + response);
                        form.expDt.$setValidity('apiTokenError', false);
                    });
            }
        }
    }
})();