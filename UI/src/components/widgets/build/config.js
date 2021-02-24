/**
 * Build widget configuration
 */
(function () {
    'use strict';
    angular
        .module(HygieiaConfig.module)
        .controller('BuildWidgetConfigController', BuildWidgetConfigController);
    BuildWidgetConfigController.$inject = ['modalData', '$scope', 'collectorData', '$uibModalInstance'];
    function BuildWidgetConfigController(modalData, $scope, collectorData, $uibModalInstance) {
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
            console.log("**Vivek** build-config loadSavedBuildJob, modalData.dashboard.application = ",
                        modalData.dashboard.application);

        	var buildCollector = modalData.dashboard.application.components[0].collectorItems.Build,
            savedCollectorBuildJob = buildCollector ? buildCollector[0].description : null;
             
            if(savedCollectorBuildJob) {
                console.log("**Vivek** build-config loadSavedBuildJob, Saved Build Job, buildCollector = ", buildCollector);

                ctrl.buildId = buildCollector[0].id;
            	$scope.getJobsById(ctrl.buildId).then(getBuildsCallback);
            }
        }
        
        function getBuildsCallback(data) {
            console.log("**Vivek** config getBuildsCallback, data = ", data);
            ctrl.collectorItemId = data;  // **Vivek** Copy added
        }

        function submitForm(valid, collector) {
            console.log("**Vivek** build-config submitForm, Adding new Build with id = ", widgetConfig.options.id);
            var lastChar = widgetConfig.options.id.substr(widgetConfig.options.id.length - 1);
            console.log("**Vivek** build-config submitForm, Build ID Widget Number = " + lastChar);
            console.log("**Vivek** build-config submitForm, modalData.dashboard.application = ", modalData.dashboard.application);
            console.log("**Vivek** build-config submitForm, collector = ", collector);        
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
