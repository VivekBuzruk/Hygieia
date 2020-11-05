/**
 * Controller for the dashboard route.
 * Render proper template.
 */
(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module)
        .controller('CapOneVivekTemplateController', CapOneVivekTemplateController);

    function CapOneVivekTemplateController() {
        var ctrl = this;

        ctrl.tabs = [
            { name: "Widget"},
            { name: "Pipeline"},
            { name: "Cloud"}
        ];


        ctrl.minitabs = [
            { name: "Quality"},
            { name: "Performance"}

        ];

        ctrl.miniBtabs = [
            { name: "Build 1"},
            { name: "Build 2"}
        ];

        ctrl.miniRtabs = [
                { name: "Repo 1"},
                { name: "Repo 2"}
    
        ];

        ctrl.miniFeaturetabs = [
            { name: "Feature"},
            { name: "Team"}

        ];

        ctrl.widgetView = ctrl.tabs[0].name;
        ctrl.toggleView = function (index) {
            ctrl.widgetView = typeof ctrl.tabs[index] === 'undefined' ? ctrl.tabs[0].name : ctrl.tabs[index].name;
        };

        ctrl.miniWidgetView = ctrl.minitabs[0].name;
        ctrl.miniToggleView = function (index) {
            ctrl.miniWidgetView = typeof ctrl.minitabs[index] === 'undefined' ? ctrl.minitabs[0].name : ctrl.minitabs[index].name;
        };

        ctrl.miniBWidgetView = ctrl.miniBtabs[0].name;
        ctrl.miniBToggleView = function (index) {
            ctrl.miniBWidgetView = typeof ctrl.miniBtabs[index] === 'undefined' ? ctrl.miniBtabs[0].name : ctrl.miniBtabs[index].name;
        };

        ctrl.miniRWidgetView = ctrl.miniRtabs[0].name;
        ctrl.miniRToggleView = function (index) {
            ctrl.miniRWidgetView = typeof ctrl.miniRtabs[index] === 'undefined' ? ctrl.miniRtabs[0].name : ctrl.miniRtabs[index].name;
        };

        ctrl.miniFeatureWidgetView = ctrl.miniFeaturetabs[0].name;
        ctrl.miniFeatureToggleView = function (index) {
            ctrl.miniFeatureWidgetView = typeof ctrl.miniFeaturetabs[index] === 'undefined' ? ctrl.miniFeaturetabs[0].name : ctrl.miniFeaturetabs[index].name;
        };

    }
})();
