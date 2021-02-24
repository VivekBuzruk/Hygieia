/**
 * Controller for the dashboard route.
 * Render proper template.
 */
(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module)
        .controller('ProductSummaryController', ProductSummaryController);

    ProductSummaryController.$inject = ['dashboard', '$location', 'dashboardService', 'ScoreDisplayType'];
    function ProductSummaryController(dashboard, $location, dashboardService, ScoreDisplayType) {
        var ctrl = this;

        // if dashboard isn't available through resolve it may have been deleted
        // so redirect to the home screen
        if (!dashboard) {
            $location.path('/');
        }

        ctrl.dashboard = dashboard;

        //Add attributes for score
        ctrl.scoreEnabled = true;
        ctrl.scoreHeaderEnabled = true;
        // ctrl.scoreWidgetEnabled = ctrl.scoreEnabled && (dashboard.scoreDisplay === ScoreDisplayType.WIDGET);

        //Default options to use with score display in header
        ctrl.scoreRateItOptionsHeader = {
            readOnly : true,
            step : 0.1,
            starWidth : 22,
            starHeight : 22,
            class : "score"
        };

        //Default options to use with score display in widget
        ctrl.scoreRateItOptionsWidget = {
            readOnly : true,
            step : 0.1,
            starWidth : 40,
            starHeight : 40,
            class : "score"
        };

        function processAppsInDashboards(dashboard) {
            ctrl.apps = [];
            // console.log("**Vivek** admin, getApps = ", dashboards);
            if (!dashboard || dashboard.length == 0) {
                return;
            }
            for (var ix in dashboards) {
                if (dashboards.hasOwnProperty(ix)) {
                    var dashboard = dashboards[ix];
                    // console.log("**Vivek** dashboard admin, processAppsInDashboards dashboard = ", dashboard);
                    ctrl.apps.push({"appName" : dashboard.appName, 
                                    "dashboardType" : dashboard.type,
                                    "dashboardName" : dashboard.name, 
                                    "dashboardId" : dashboard.id});
                }
            }
            function compare( a, b ) {
                if ( a.appName < b.appName ){
                  return -1;
                }
                if ( a.appName > b.appName ){
                  return 1;
                }
                return 0;
            }
              
            ctrl.apps.sort( compare );
        }

        console.log('Dashboard', dashboard);
    }
})();
