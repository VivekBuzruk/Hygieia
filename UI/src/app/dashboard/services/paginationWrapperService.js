(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module)
        .service('paginationWrapperService', paginationWrapperService);
    paginationWrapperService.$inject = ['$q', 'DashboardType', 'dashboardData', 'dashboardService', 'userService'];

    function paginationWrapperService ($q, DashboardType, dashboardData, dashboardService, userService) {
        var currentPage = 0;
        var pageSize = 10;
        var currentPageMyDash = 0;
        var searchFilter="";
        var dashboards;
        var dashboardTypes;
        var totalItems;
        var totalItemsMyDash;
        var username = userService.getUsername();
        var mydash;

        this.calculateTotalItems = function (type) {
            return dashboardData.count(type).then(function (data) {
                totalItems = data;
            });
        }

        this.calculateTotalItemsMyDash = function (type) {
            return dashboardData.myDashboardsCount(type).then(function (data) {
                totalItemsMyDash = data;
            });
        }

        this.getTotalItems = function () {
            return totalItems;
        }

        this.getTotalItemsMyDash = function () {
            return totalItemsMyDash;
        }

        this.getCurrentPage = function () {
            return currentPage;
        }

        this.getPageSize = function () {
            return pageSize;
        }

        this.getDashboards = function () {
            return dashboards;
        }

        this.getMyDashboards = function () {
            return mydash;
        }

        this.setDashboards = function (paramDashboards) {
            dashboards = paramDashboards;
        }

        var getInvalidAppOrCompError = function (data) {
            var showError = false;
            if ( (data.configurationItemBusServName != undefined && !data.validServiceName)
                || (data.configurationItemBusAppName != undefined && !data.validAppName) ) {
                showError = true;
            }

            return showError;
        }

        this.pageChangeHandler = function (pageNumber, type) {
            currentPage = pageNumber;

            if (searchFilter=="") {
               return dashboardData.searchByPage({"search": '', "type": type, "size": pageSize, "page": pageNumber-1})
                    .then(this.processDashboardResponse, this.processDashboardError);
            } else {
               return dashboardData.filterByTitle({"search": searchFilter, "type": type, "size": pageSize, "page": pageNumber-1})
                    .then(this.processDashboardFilterResponse, this.processDashboardError);
            }
        }

        this.pageChangeHandlerForMyDash = function (pageNumber, type) {
            currentPageMyDash = pageNumber;

            if(searchFilter==""){
                return  dashboardData.searchMyDashboardsByPage({"username": username, "type": type, "size": pageSize, "page": pageNumber-1})
                    .then(this.processMyDashboardResponse, this.processMyDashboardError);
            } else {
                return dashboardData.filterMyDashboardsByTitle({"search":  searchFilter, "size": pageSize, "page": pageNumber-1})
                    .then(this.processFilterMyDashboardResponse, this.processMyDashboardError);
            }
        }

        var getDashboard = function (dashboardData) {
            var board = {
                id: dashboardData.id,
                name: dashboardService.getDashboardTitle(dashboardData),
                type: dashboardData.type,
                appName: dashboardService.getDashboardAppName(dashboardData),
                validServiceName: dashboardData.validServiceName,
                validAppName: dashboardData.validAppName,
                configurationItemBusServName: dashboardData.configurationItemBusServName,
                configurationItemBusAppName: dashboardData.configurationItemBusAppName,
                isProduct: dashboardData.type && dashboardData.type.toLowerCase() === DashboardType.PRODUCT.toLowerCase(),
                scoreEnabled: dashboardData.scoreEnabled,
                scoreDisplay: dashboardData.scoreDisplay
            };
            return board;
        }

        this.processDashboardResponse = function (response) {
            var data = response.data;
            var type = response.type;

            // add dashboards to list
            dashboards = [];
            var dashboardsLocal = [];

            for (var x = 0; x < data.length; x++) {
                var board = getDashboard(data[x]);
                if(board.isProduct) {
                    //console.log(board);
                }
                dashboardsLocal.push(board);
            }

            dashboards = dashboardsLocal;
            dashboardData.count(type).then(function (data) {
                totalItems = data;
            });

            return dashboardsLocal;
        }

        this.processDashboardFilterResponse = function (response) {
            var data = response.data;
            var type = response.type;

            dashboards = [];
            var dashboardsLocal = [];

            for (var x = 0; x < data.length; x++) {
                var board = {
                    id: data[x].id,
                    name: dashboardService.getDashboardTitle(data[x]),
                    isProduct: data[x].type && data[x].type.toLowerCase() === DashboardType.PRODUCT.toLowerCase()
                };

                if(board.isProduct) {
                    //console.log(board);
                }
                dashboardsLocal.push(board);
            }

            dashboards = dashboardsLocal;
            if (searchFilter=="") {
                dashboardData.count(type).then(function (data) {
                    totalItems = data;
                });
            }

            return dashboardsLocal;
        }

        this.processDashboardError = function (data) {
            dashboards = [];
            return dashboards;
        }

        var getMyDashboard = function (dashboardData, showErrorVal) {
            var board = {
                id: dashboardData.id,
                name: dashboardService.getDashboardTitle(dashboardData),
                type: dashboardData.type,
                isProduct: dashboardData.type && dashboardData.type.toLowerCase() === DashboardType.PRODUCT.toLowerCase(),
                appName: dashboardService.getDashboardAppName(dashboardData),
                validServiceName: dashboardData.validServiceName,
                validAppName: dashboardData.validAppName,
                configurationItemBusServName: dashboardData.configurationItemBusServName,
                configurationItemBusAppName: dashboardData.configurationItemBusAppName,
                showError: showErrorVal,
                scoreEnabled: dashboardData.scoreEnabled,
                scoreDisplay: dashboardData.scoreDisplay
            };
            return board;
        }

        this.processMyDashboardResponse = function (response) {
            var mydata = response.data;
            var type = response.type;

            // add dashboards to list
            mydash = [];
            var dashboardsLocal = [];

            for (var x = 0; x < mydata.length; x++) {
                var showErrorVal = getInvalidAppOrCompError(mydata[x]);
                var board = getMyDashboard(mydata[x], showErrorVal);
                dashboardsLocal.push(board);
            }

            mydash = dashboardsLocal;
            dashboardData.myDashboardsCount(type).then(function (data) {
                totalItemsMyDash = data;
            });


            return dashboardsLocal;
        }

        this.processFilterMyDashboardResponse = function (response) {
            var mydata = response.data;
            var type = response.type;

            // add dashboards to list
            mydash = [];
            var dashboardsLocal = [];

            for (var x = 0; x < mydata.length; x++) {
                var showErrorVal = getInvalidAppOrCompError(mydata[x]);
                var board =  getMyDashboard(mydata[x], showErrorVal);
                dashboardsLocal.push(board);
            }

            mydash = dashboardsLocal;
            if(searchFilter=="") {
                dashboardData.myDashboardsCount(type).then(function (data) {
                    totalItemsMyDash = data;
                });
            }

            return dashboardsLocal;
        }

        this.processMyDashboardError = function (data) {
            mydash = [];
            return mydash;
        }

        this.filterByTitle = function (title, type) {
            currentPage = 0;
            currentPageMyDash = 0;
            searchFilter = title;
            var promises = [];

            if(title=="") {
                promises.push(dashboardData.searchByPage({"search": '', "type": type, "size": pageSize, "page": 0})
                                .then(this.processDashboardResponse, this.processDashboardError));

                promises.push(dashboardData.searchMyDashboardsByPage({"username": username, "type": type, "size": pageSize, "page": 0})
                                .then(this.processMyDashboardResponse, this.processMyDashboardError));
            } else {
                promises.push(dashboardData.filterCount(title, type).then(function (data) {totalItems = data;}));

                promises.push(dashboardData.filterByTitle({"search": title, "type": type, "size": pageSize, "page": 0})
                    .then(this.processDashboardFilterResponse, this.processDashboardError));

                promises.push(dashboardData.filterMyDashboardCount(title, type).then(function (data) {totalItemsMyDash = data;}));

                promises.push(dashboardData.filterMyDashboardsByTitle({"search": title, "type": type, "size": pageSize, "page": 0})
                    .then(this.processFilterMyDashboardResponse, this.processMyDashboardError));
            }

            return promises;
        }
    }
})();
