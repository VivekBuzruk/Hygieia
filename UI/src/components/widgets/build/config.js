/**
 * Build widget configuration
 */
(function () {
    'use strict';
    angular
        .module(HygieiaConfig.module)
        .controller('BuildWidgetConfigController', BuildWidgetConfigController);
    BuildWidgetConfigController.$inject = ['modalData', '$scope', 'collectorData', '$uibModalInstance', '$log'];
    function BuildWidgetConfigController(modalData, $scope, collectorData, $uibModalInstance, $log) {
        var ctrl = this,
        widgetConfig = modalData.widgetConfig;
        
        // public variables
        ctrl.buildDurationThreshold = 3;
        ctrl.buildConsecutiveFailureThreshold = 5;
        
        $scope.getJobs = function (filter) {
        	return collectorData.itemsByType('build', {"search": filter, "size": 20}).then(function (response){
        		return response;
        	});
        }

        $scope.getJobsById = function (id) {
            return collectorData.getCollectorItemById(id).then(function (response){
                return response;
            });
        }
        loadSavedBuildJob();
        // set values from config
        if (widgetConfig) {
            if (widgetConfig.options.buildDurationThreshold) {
                ctrl.buildDurationThreshold = widgetConfig.options.buildDurationThreshold;
            }
            if (widgetConfig.options.consecutiveFailureThreshold) {
                ctrl.buildConsecutiveFailureThreshold = widgetConfig.options.consecutiveFailureThreshold;
            }
        }
        // public methods
        ctrl.submit = submitForm;

        // method implementations
        function loadSavedBuildJob(){
            ctrl.buildId ="";
            $log.debug("**DIW-D** build-config loadSavedBuildJob, modalData.dashboard.application = ",
                        modalData.dashboard.application);

        	var buildCollector = modalData.dashboard.application.components[0].collectorItems.Build,
            savedCollectorBuildJob = buildCollector ? buildCollector[0].description : null;
             
            if(savedCollectorBuildJob) {
                $log.debug("**DIW-D** build-config loadSavedBuildJob, Saved Build Job, buildCollector = ", buildCollector);

                ctrl.buildId = buildCollector[0].id;
            	$scope.getJobsById(ctrl.buildId).then(getBuildsCallback);
            }
        }
        
        function getBuildsCallback(data) {
            $log.debug("**DIW-D** config getBuildsCallback, data = ", data);
            ctrl.collectorItemId = data;  // **DIW-D** Copy added
        }

        function submitForm(valid, collector) {
            $log.debug("**DIW-D** build-config submitForm, Adding new Build with id = ", widgetConfig.options.id);
            var lastChar = widgetConfig.options.id.substr(widgetConfig.options.id.length - 1);
            $log.debug("**DIW-D** build-config submitForm, Build ID Widget Number = " + lastChar);
            $log.debug("**DIW-D** build-config submitForm, modalData.dashboard.application = ", modalData.dashboard.application);
            $log.debug("**DIW-D** build-config submitForm, collector = ", collector);        
            if (valid) {
                var form = document.buildConfigForm;
                
                var postObj = {
                    name: 'build',
                    options: {
                    	id: widgetConfig.options.id,
                        buildDurationThreshold: parseFloat(form.buildDurationThreshold.value),
                        consecutiveFailureThreshold: parseFloat(form.buildConsecutiveFailureThreshold.value)
                    },
                    componentId: modalData.dashboard.application.components[parseInt(lastChar)].id,
                    collectorItemId: collector.id,
                };
                // pass this new config to the modal closing so it's saved
                $uibModalInstance.close(postObj);
            }
        }
    }
})();
