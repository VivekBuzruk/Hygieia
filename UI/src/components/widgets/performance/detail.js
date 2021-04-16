(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module)
        .controller('PerformanceDetailController', PerformanceDetailController);

    PerformanceDetailController.$inject = ['$uibModalInstance','index', 'warnings', 'good', 'bad', 'DashStatus', '$log'];
    function PerformanceDetailController($uibModalInstance, index, warnings, good, bad, DashStatus, $log) {
        /*jshint validthis:true */
        var ctrl = this;

        $log.info("**DIW-Info** " + index);

        if (index == 0){
          ctrl.healthruleviolations = good.reverse();
        }else if (index == 1){
          ctrl.healthruleviolations = warnings.reverse();
        }else{
          ctrl.healthruleviolations = bad.reverse();
        }

    }
})();
