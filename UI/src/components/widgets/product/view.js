(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module)
        .controller('productViewController', productViewController)
        .filter('flattenToArray', function() { return function(obj) {
            if (!(obj instanceof Object)) return obj;
            return Object.keys(obj).map(function (key) { return obj[key]; });
        }});


    productViewController.$inject = ['$scope', '$document', '$uibModal', '$location', '$q', '$stateParams', '$timeout', 'buildData', 'codeAnalysisData', 'collectorData', 'dashboardData', 'pipelineData', 'testSuiteData', 'productBuildData', 'productCodeAnalysisData', 'productCommitData', 'productSecurityAnalysisData', 'productTestSuiteData', 'cicdGatesData', 'paginationWrapperService'];
    function productViewController($scope, $document, $uibModal, $location, $q, $stateParams, $timeout, buildData, codeAnalysisData, collectorData, dashboardData, pipelineData, testSuiteData, productBuildData, productCodeAnalysisData, productCommitData, productSecurityAnalysisData, productTestSuiteData, cicdGatesData, paginationWrapperService) {
        /*jshint validthis:true */
        var ctrl = this;

        //region Dexie configuration
        // setup our local db
        var db = new Dexie('ProductPipelineDb');
        Dexie.Promise.on('error', function(err) {
            // Log to console or show en error indicator somewhere in your GUI...
            console.log('Uncaught Dexie error: ' + err);
        });

        // IMPORTANT: when updating schemas be sure to version the database
        // https://github.com/dfahlander/Dexie.js/wiki/Design#database-versioning
        db.version(1).stores({
            lastRequest: '[type+id]',
            testSuite: '++id,timestamp,[componentId+timestamp]',
            codeAnalysis: '++id,timestamp,[componentId+timestamp]',
            securityAnalysis: '++id,timestamp,[componentId+timestamp]',
            buildData: '++id,timestamp,[componentId+timestamp]',
            prodCommit: '++id,timestamp,[collectorItemId+timestamp]'
        });

        // create classes
        var LastRequest = db.lastRequest.defineClass({
            id: String,
            type: String,
            timestamp: Number
        });

        // ad a convenience method to save back the request
        LastRequest.prototype.save = function() {
            db.lastRequest.put(this);
        };

        db.open();

        // clear out any collection data if there is a reset parameter
        if($stateParams.delete) {
            db.delete().then(function() {
                // redirect to this page without the parameter
                window.location.href = '/#/dashboard/' + $stateParams.id;
            });
        }

        // remove any data from the existing tables
        if($stateParams.reset || HygieiaConfig.local) {
            db.lastRequest.clear();
            db.codeAnalysis.clear();
            db.testSuite.clear();
            db.buildData.clear();
            db.prodCommit.clear();
        }
        // endregion

        // private properties
        var teamDashboardDetails = {},
            isReload = null;

        console.log('**Vivek** product view controller: $scope = ', $scope);

        // set our data before we get things started
        var widgetOptions = angular.copy($scope.widgetConfig.options);

        if (widgetOptions && widgetOptions.teams) {
            ctrl.configuredTeams = widgetOptions.teams;
        }

        ctrl.teamCrlStages = {};
        ctrl.prodStages={};
        ctrl.orderedStages = {};
        ctrl.autoLoadTeams = false;

        // pull all the stages from pipeline. Create a map for all ctrl stages for each team.
        ctrl.load = function() {
            var now = moment(),
                ninetyDaysAgo = now.add(-90, 'days').valueOf(),
                dateBegins = ninetyDaysAgo;
            var nowTimestamp = moment().valueOf();
            // get our pipeline commit data. start by seeing if we've already run this request
            _(ctrl.configuredTeams).forEach(function (configuredTeam) {
                var collectId = configuredTeam.collectorItemId;
                var orderedStages = orderKeys();
                var stages = [];
                console.log("**Vivek** product view.js load, collectId = ", collectId);
                pipelineData
                    .commits(dateBegins, nowTimestamp, collectId)
                    .then(function (response) {
                        console.log("**Vivek** product view.js load pipelineCommits, response = ", response);
                        response = response[0];
                        for (var x in response.stages) {
                            orderedStages.push(x, x);
                        }
                        stages = orderedStages.keys();
                        ctrl.teamCrlStages[collectId] = stages;
                        ctrl.prodStages[collectId] = response.prodStage;
                        ctrl.orderedStages[collectId] = response.orderMap;
                    }).then(processLoad);
            });
        };

        // make ordered list
        function orderKeys() {
            var keys = [];
            var val = {};
            return {
                push: function(k,v){
                    if (!val[k]) keys.push(k);
                    val[k] = v;
                },
                keys: function(){return keys},
                values: function(){return val}
            };
        }


        // public methods
        ctrl.addTeam = addTeam;
        ctrl.editTeam = editTeam;
        ctrl.openDashboard = openDashboard;
        ctrl.teamDashboardId = teamDashboardId;
        ctrl.viewTeamStageDetails = viewTeamStageDetails;
        ctrl.viewQualityDetails = viewQualityDetails;
        ctrl.viewGatesDetails = viewGatesDetails;
        ctrl.initPerc = initPerc;

        // public data methods
        ctrl.teamStageHasCommits = teamStageHasCommits;

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

        //region public methods
        function processLoad() {
            ctrl.sortableOptions = {
                additionalPlaceholderClass: 'product-table-tr',
                placeholder: function(el) {
                    // create a placeholder row
                    var tr = $document[0].createElement('div');
                    for(var x=0;x<=$scope.widgetConfig.options.teams.length+1;x++) {
                        var td = $document[0].createElement('div');
                        td.setAttribute('class', 'product-table-td');

                        if(x == 0) {
                            // add the name of the row so it somewhat resembles the actual data
                            var name = $document[0].createElement('div');
                            name.setAttribute('class', 'team-name');
                            name.innerText = el.element[0].querySelector('.team-name').innerText;
                            td.setAttribute('class', 'product-table-td team-name-cell');
                            td.appendChild(name);
                        }
                        tr.appendChild(td);
                    }

                    return tr;
                },
                orderChanged: function() {
                    // re-order our widget options
                    var teams = ctrl.configuredTeams,
                        existingConfigTeams = $scope.widgetConfig.options.teams,
                        newConfigTeams = [];

                    _(teams).forEach(function(team) {
                        _(existingConfigTeams).forEach(function(configTeam) {
                            if(team.collectorItemId == configTeam.collectorItemId) {
                                newConfigTeams.push(configTeam);
                            }
                        });
                    });
                    $scope.widgetConfig.options.teams = newConfigTeams;
                    updateWidgetOptions($scope.widgetConfig.options);
                }
            };

            // determine our current state
            if (isReload === null) {
                isReload = false;
            }
            else if(isReload === false) {
                isReload = true;
            }

            collectTeamStageData(widgetOptions.teams, [].concat(ctrl.teamCrlStages));

            var requestedData = getTeamDashboardDetails(widgetOptions.teams);
            if(!requestedData) {
                for(var collectorItemId in teamDashboardDetails) {
                    getTeamComponentData(collectorItemId);
                }
            }
        }

        // remove data from the db where data is older than the provided timestamp
        function cleanseData(table, beforeTimestamp) {
            table.where('timestamp').below(beforeTimestamp).toArray(function(rows) {
                _(rows).forEach(function(row) {
                    table.delete(row.id);
                })
            });
        }

        if ($scope.dashboard.template && $scope.dashboard.template == "application-dashboard") {
            ctrl.autoLoadTeams = true;
            dashboardData.search().then(addMyTeams);
        }

        function processAppsInDashboards(dashboards) {
            ctrl.apps = [];
            var dashFound = false;
            // console.log("**Vivek** components widgets product view, processAppsInDashboards = ", dashboards);
            if (!dashboards || dashboards.length == 0) {
                return dashFound;
            }
            for (var ix in dashboards) {
                if (dashboards.hasOwnProperty(ix)) {
                    var dashboard = dashboards[ix];
                    if (dashboard.type !== 'Team') {
                        continue;
                    }
                    // console.log("**Vivek** components widgets product view,  processAppsInDashboards dashboard = ", dashboard);
                    if (dashboard.appName == $scope.dashboard.application.name) {
                        console.log("**Vivek** components widgets product view, processAppsInDashboards dashboard = ", dashboard);
                        ctrl.apps.push({"appName" : dashboard.appName, "dashboardName" : dashboard.name,
                                        "dashboardId" : dashboard.id});
                        dashFound = true;
                    }
                }
            }
            return dashFound;
        }

        function addAppWidgets(apps) {
            // prepare our response for the widget upsert
            var options = $scope.widgetConfig.options;

            // make sure it's an array
            if (!options.teams || !options.teams.length) {
                options.teams = [];
            } else {
                return false;
            }
        // init
            collectorData.itemsByType('product').then(function(result) {

                // limit to team dashboards
                var boards = [];

                _(result).forEach(function(item) {
                    console.log("**Vivek** components product addAppWidgets, item = ", item);
                    if(item.description) {
                        boards.push({
                            id: item.id,
                            title: item.description,
                            dashboardId: item.options.dashboardId
                        });
                    }
                });

                ctrl.myDashboards = boards;
                for (var index = 0; index < ctrl.apps.length; index++) {
                    console.log("**Vivek** component widgets product view, Selected App ", ctrl.apps[index]);
                    // get team dashboard details and see if build and commit widgets are available
                    var dashId = ctrl.apps[index].dashboardId;

                    dashboardData.detail(dashId).then(function (resultDash) {
                        var res = resultDash;
                        var thisDashId = resultDash.id;
                        var buildInd = false;
                        var repoInd = false;
                        var myCollectorItemId = false;
                        var widgets = [];    

                        widgets = resultDash.widgets;
                        _(widgets).forEach(function (widget) {
                            if (widget.name == "build") buildInd = true;
                            if (widget.name == "repo") repoInd = true;

                        });
                        for (var index2 = 0; index2 < ctrl.myDashboards.length; index2++) {
                            if (ctrl.myDashboards[index2].dashboardId == thisDashId) {
                                myCollectorItemId = ctrl.myDashboards[index2].id;
                                break;
                            }
                        }    
                        var config = {
                            collectorItemId: myCollectorItemId,
                            name: resultDash.title,
                            customName: resultDash.application.name,
                            dashBoardId: thisDashId
                        };
                        options.teams.push(config);
                        updateWidgetOptions(options);
                    });
                }
            });
        }

        function addMyTeams(data) {
            console.log("**Vivek** product addMyTeams ");
            ctrl.dashboards = paginationWrapperService.processDashboardResponse({"data" : data});
            processAppsInDashboards(ctrl.dashboards); // Use of ==> const myPromise = (new Promise( ** will be better
            addAppWidgets(ctrl.apps);
        }

        function addTeam() {
            $uibModal.open({
                templateUrl: 'components/widgets/product/add-team/add-team.html',
                controller: 'addTeamController',
                controllerAs: 'ctrl'
            }).result.then(function(config) {
                if(!config) {
                    return;
                }

                // prepare our response for the widget upsert
                var options = $scope.widgetConfig.options;

                // make sure it's an array
                if(!options.teams || !options.teams.length) {
                    options.teams = [];
                }

                var itemInd = false;

                // iterate over teams and set itemInd to true if team is already added to prod dashboard.
                for(var i=0;i < options.teams.length;i++){
                    if(options.teams[i].collectorItemId == config.collectorItemId){
                        itemInd = true; break;
                    }
                }
                // get team dashboard details and see if build and commit widgets are available
                var dashId = config.dashBoardId;
                var buildInd = false;
                var repoInd = false;
                var widgets=[];
                dashboardData.detail(dashId).then(function(result) {
                    var res = result;
                     widgets = result.widgets;
                    _(widgets).forEach(function (widget) {
                        if(widget.name == "build") buildInd = true;
                        if(widget.name =="repo") repoInd = true;

                    });

                    // prompt a message if team is already added or add to prod dashboard otherwise.
                    if(itemInd){
                        swal(config.name+' dashboard added already');
                    }else if(widgets==null || !buildInd || !repoInd){
                        swal('Configure Build and Code Repository for '+config.name+' before adding to Product Dashboard');
                    }else{
                        // add our new config to the array
                        options.teams.push(config);

                        console.log("**Vivek** components widgets product view, addTeam config = ", config);
                        console.log("**Vivek** components widgets product view, addTeam options = ", options);

                        updateWidgetOptions(options);
                    }
                });
            });
        }

        function editTeam(collectorItemId) {
            var team = false;
            _($scope.widgetConfig.options.teams)
                .filter({collectorItemId: collectorItemId})
                .forEach(function(t) {
                    team = t;
                });

            if(!team) { return; }

            $uibModal.open({
                templateUrl: 'components/widgets/product/edit-team/edit-team.html',
                controller: 'editTeamController',
                controllerAs: 'ctrl',
                resolve: {
                    editTeamConfig: function() {
                        return {
                            team: team
                        }
                    }
                }
            }).result.then(function(config) {
                if(!config) {
                    return;
                }

                var newOptions = $scope.widgetConfig.options;

                // take the collector item out of the team array
                if(config.remove) {
                    // do remove
                    var keepTeams = [];

                    _(newOptions.teams).forEach(function(team) {
                        if(team.collectorItemId != config.collectorItemId) {
                            keepTeams.push(team);
                        }
                    });

                    newOptions.teams = keepTeams;
                }
                else {
                    for(var x=0;x<newOptions.teams.length;x++) {
                        if(newOptions.teams[x].collectorItemId == config.collectorItemId) {
                            newOptions.teams[x] = config;
                        }
                    }
                }

                updateWidgetOptions(newOptions);
            });
        }

        function openDashboard(item) {
            var dashboardDetails = teamDashboardDetails[item.collectorItemId];
            if(dashboardDetails) {
                $location.path('/dashboard/' + dashboardDetails.id);
            }
        }

        function teamDashboardId(item) {
            var dashboardDetails = teamDashboardDetails[item.collectorItemId];
            if(dashboardDetails) {
                // console.log("**Vivek** components product, teamDashboardId = ", dashboardDetails);
                return dashboardDetails.id;
            }
            return false;
        }

        function viewTeamStageDetails(team, stage) {
            // only show details if we have commits
            if(!teamStageHasCommits(team, stage)) {
                console.log("**Vivek** components product viewTeamStageDetails team & stage 1 = ", team, stage);
                return false;
            }
            console.log("**Vivek** components product viewTeamStageDetails team & stage 2 = ", team, stage);

            $uibModal.open({
                templateUrl: 'components/widgets/product/environment-commits/environment-commits.html',
                controller: 'productEnvironmentCommitController',
                controllerAs: 'ctrl',
                size: 'lg',
                resolve: {
                    modalData: function() {
                        return {
                            team: team,
                            stage: stage,
                            stages: ctrl.teamCrlStages[team.collectorItemId]
                        };
                    }
                }
            });
        }

        function viewGatesDetails(team){
            dashboardData.detail(team.dashBoardId).then(function(res){
               var componentId = res.widgets[0].componentId;

            $uibModal.open({
                templateUrl: 'components/widgets/product/cicd-gates/cicd-gates.html',
                controller: 'CicdGatesController',
                controllerAs: 'ctrl',
                size: 'lg',
                resolve : {
                    team : function (){
                        return team;
                    },
                    dashboardId : function (){
                      return team.dashBoardId;
                    },
                    componentId: function (){
                      return componentId;
                    }
                }
            })
          })
        }

        function initPerc(team) {
          var name = team.customname || team.name;
          dashboardData.detail(team.dashBoardId).then(function(res) {
            var componentId = res.widgets[0].componentId;
            cicdGatesData.details(name, team.dashBoardId, team.collectorItemId, componentId).then(function(response) {
              var pass = 0;
              for (var i = 0; i < response.length; i++) {
                pass += response[i].value == "pass" ? 1 : 0;
              }
              team.passedGates = pass;
              team.totalGates = response.length;
              console.log("**Vivek** components product, view initPerc 1 = ", team)
            }).catch (function (e) {
                team.passedGates = 0;
                team.totalGates = 0;
                console.log("**Vivek** components product, view initPerc 2 = ", team)                
            });
          })
        };

        function viewQualityDetails(team, stage, metricIndex) {
            $uibModal.open({
                templateUrl: 'components/widgets/product/quality-details/quality-details.html',
                controller: 'productQualityDetailsController',
                controllerAs: 'ctrl',
                size: 'lg',
                resolve: {
                    modalData: function() {
                        return {
                            team: team,
                            stage: stage,
                            metricIndex: metricIndex
                        }
                    }
                }
            })
        }
        //endregion

        //region private methods
        function setTeamData(collectorItemId, data) {
            var team = false,
                idx = false;

            _(ctrl.configuredTeams).forEach(function(configuredTeam, i) {
                if(configuredTeam.collectorItemId == collectorItemId) {
                    idx = i;
                    team = configuredTeam;
                }
            });

            if(!team) { return; }

            var obj = ctrl.configuredTeams[idx];

            // hackish way to update the configured teams object in place so their entire
            // object does not need to be replaced which would cause a full refresh of the
            // row instead of just the numbers. some deep merge tools did not replace everything
            // correctly so this way we can be explicit in the behavior
            for(var x in data) {
                var xData = data[x];
                if(typeof xData == 'object' && obj[x] != undefined) {
                    for(var y in xData) {
                        var yData = xData[y];

                        if(typeof yData == 'object' && obj[x][y] != undefined) {
                            for (var z in yData) {
                                var zData = yData[z];
                                obj[x][y][z] = zData;
                            }
                        }
                        else {
                            obj[x][y] = yData;
                        }
                    }
                }
                else {
                    obj[x] = xData;
                }
            }

            _(ctrl.configuredTeams).forEach(function(configuredTeam, i) {
                if(configuredTeam.collectorItemId == collectorItemId) {
                    idx = i;
                    team = configuredTeam;
                }
            });
        }

        function getTeamDashboardDetails(teams) {
            var update = false;
            _(teams).forEach(function(team) {
                if(!teamDashboardDetails[team.collectorItemId]) {
                    update = true;
                }
            });

            // if we already have all the teams, don't make the call
            if (!update) {
                return false;
            }

            // let's grab our products and update all the board info
            collectorData.itemsByType('product').then(function(response) {
                _(teams).forEach(function(team) {
                    _(response).forEach(function(board) {
                        if (team.collectorItemId == board.id) {
                            dashboardData.detail(board.options.dashboardId).then(function(result) {
                                teamDashboardDetails[team.collectorItemId] = result;

                                getTeamComponentData(team.collectorItemId);
                            });
                        }
                    });
                });
            });

            return true;
        }

        function updateWidgetOptions(options) {
            // get a list of collector ids
            var collectorItemIds = [];
            _(options.teams).forEach(function(team) {
                collectorItemIds.push(team.collectorItemId);
            });

            var data = {
                name: 'product',
                componentId: $scope.dashboard.application.components[0].id,
                collectorItemIds: collectorItemIds,
                options: options
            };

            console.log("**Vivek** product view, updateWidgetOptions data = ", data);
            $scope.upsertWidget(data);
        }

        // return whether this stage has commits. used to determine whether details
        // will be shown for this team in the specific stage
        function teamStageHasCommits(team, stage) {
            console.log("**Vivek** product view, teamStageHasCommits team, stage = ", team, stage);
            return team.stages && team.stages[stage] && team.stages[stage].commits && team.stages[stage].commits.length;
        }

        function getTeamComponentData(collectorItemId) {
            var team = teamDashboardDetails[collectorItemId],
                componentId = team.application.components[0].id;

            console.log("**Vivek** product view, getTeamComponentData team = ", team);

            function getCaMetric(metrics, name, fallback) {
                var val = fallback === undefined ? false : fallback;
                _(metrics).filter({name:name}).forEach(function(item) {
                    val = item.value || parseFloat(item.formattedValue);
                });
                return val;
            }
            function getMyComponentId(widgetName) {
                var component2Id = []
                for (var i = 0; i < team.application.components.length; i++) {
                    for (var j = 0; j < team.widgets.length; j++) {
                        if ( team.widgets[j].name == widgetName && team.application.components[i].id == team.widgets[j].componentId) {
                            component2Id.push(team.application.components[i].id); 
                            break;
                        }
                    }
                }
                return component2Id;
            }

            var processDependencyObject = {
                db: db,
                componentId: componentId,
                collectorItemId: collectorItemId,
                setTeamData: setTeamData,
                cleanseData: cleanseData,
                isReload: isReload,
                $timeout: $timeout,
                $q: $q,
                component2Id:[]
            };
            //console.log("**Vivek** product view, getTeamComponentData processDependencyObject = ", processDependencyObject);

            // request and process our data
            processDependencyObject.component2Id = getMyComponentId('codeanalysis');
            if (processDependencyObject.component2Id.length > 0) {
                processDependencyObject.componentId = processDependencyObject.component2Id[processDependencyObject.component2Id.length - 1];
                processDependencyObject.component2Id.pop();
            }
            productSecurityAnalysisData.process(angular.extend(processDependencyObject, { codeAnalysisData: codeAnalysisData, getCaMetric: getCaMetric }));
            productCodeAnalysisData.process(angular.extend(processDependencyObject, { codeAnalysisData: codeAnalysisData, getCaMetric: getCaMetric }));
            productTestSuiteData.process(angular.extend(processDependencyObject, { testSuiteData: testSuiteData }));

            processDependencyObject.component2Id = getMyComponentId('build');
            if (processDependencyObject.component2Id.length > 0) {
                processDependencyObject.componentId = processDependencyObject.component2Id[processDependencyObject.component2Id.length - 1];
                processDependencyObject.component2Id.pop();
            }
            productBuildData.process(angular.extend(processDependencyObject, { buildData: buildData }));
        }

        function collectTeamStageData(teams, teamCtrlStages) {
            // no need to go further if teams aren't configured
            if(!teams || !teams.length) {
                return;
            }

            var nowTimestamp = moment().valueOf();
            // loop through each team and request pipeline data
            _(teams).forEach(function(configuredTeam) {
                var commitDependencyObject = {
                    db: db,
                    configuredTeam: configuredTeam,
                    nowTimestamp: nowTimestamp,
                    setTeamData: setTeamData,
                    cleanseData: cleanseData,
                    pipelineData: pipelineData,
                    $q: $q,
                    $timeout: $timeout,
                    ctrlStages: ctrl.teamCrlStages[configuredTeam.collectorItemId],
                    // teamCtrlStages[configuredTeam.collectorItemId], // 
                    prodStageValue:ctrl.prodStages[configuredTeam.collectorItemId]
                };

                productCommitData.process(commitDependencyObject);
            });
        }
        //endregion
    }
})();
