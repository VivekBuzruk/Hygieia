/**
 * Controller for the modal popup when creating
 * a new dashboard on the startup page
 */
(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module)
        .controller('CreateProductViewController', CreateProductViewController);

        CreateProductViewController.$inject = ['$location', '$uibModalInstance', 'dashboardData', 'DashboardType', 'cmdbData', 'dashboardService', 'paginationWrapperService','$uibModal', '$log' ];
    function CreateProductViewController($location, $uibModalInstance, dashboardData, DashboardType, cmdbData, dashboardService, paginationWrapperService, $uibModal, $log) {
        var ctrl = this;

        ctrl.prodDash = [];
        ctrl.selectedDashboard = 1;

        function processDashboardResponse(data) {
            $log.debug("**DIW-D** createProductView processDashboardResponse, data = ", data);
            ctrl.prodDash = paginationWrapperService
                              .processDashboardFilterResponse({ 'data': data, 'type' : DashboardType.PRODUCT })
                              .filter(retDashboard => retDashboard.isProduct);
            
            if (ctrl.prodDash.length == 1) {
                ctrl.selectedDashboard = ctrl.prodDash[0];
            }
        }

        function processDashboardError (data) {
            ctrl.selectedDashboard = [];
            return ctrl.selectedDashboard;
        }

        dashboardData.search().then(processDashboardResponse, processDashboardError);

         // public methods
        ctrl.submit = submit;

        // method implementations
        function submit(form) {
            $log.debug("**DIW-D** CreateProductView, selectedDashboard = ", ctrl.selectedDashboard);
            // redirect to the new dashboard
            $location.path('/dashboard/' + ctrl.selectedDashboard.id);
            $uibModalInstance.dismiss();
        }
    }

})();
