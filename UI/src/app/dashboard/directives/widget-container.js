/**
 * Manages all communication with widgets and placeholders
 * Should be included at the root of the layout file and pass in the dashboard
 */
(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module + '.core')
        .directive('widgetContainer', widgetContainer);

    widgetContainer.$inject = ['$compile', '$log'];
    function widgetContainer($compile, $log) {
        return {
            restrict: 'A',
            scope: {
                dashboard: '='
            },
            link: link,
            controller: controller

        };

        function controller($scope) {
            /*jshint validthis:true */
            if (!$scope.dashboard) {
                throw new Error('dashboard not accessible by widget-container directive');
            }
            $log.debug('**DIW-D** widgetContainer controller ');
            // keep track of the various types of widgets
            $scope.placeholders = [];
            $scope.registeredWidgets = {};
            $scope.processedWidgetNames = [];

            // public methods
            this.registerPlaceholder = registerPlaceholder;
            this.registerWidget = registerWidget;
            this.upsertWidget = upsertWidget;
            this.upsertComponent = upsertComponent;

            // add a new placeholder
            function registerPlaceholder(placeholder) {
                $scope.placeholders.push(placeholder);
            }

            // add a new widget
            function registerWidget(widget) {
                if(!widget.attrs.name) {
                    throw new Error('Widget name not defined');
                }
                $log.debug('**DIW-D** widgetContainer registerWidget, widget = ' + widget.attrs.name);
                var name = widget.attrs.name = widget.attrs.name.toLowerCase();

                if(!$scope.registeredWidgets[name]) {
                    $scope.registeredWidgets[name] = [];
                }

                $scope.registeredWidgets[name].push(widget);

                // give the widget an id based on index
                /**
                 * TODO: this widget naming is a hack that won't work with placeholders
                 * and configuring widgets out of order in a layout.
                 * Maybe adding a placeholder index to the widget
                 */
                var widgetNum = ($scope.registeredWidgets[name].length - 1);
                var widgetId = name + widgetNum;
                if (widget.attrs["widgetIndex"]) {
                    $log.debug('**DIW-D** widgetContainer registerWidget, WidgetNum = ' + widgetNum +
                                 ', widget index = ' + widget.attrs["widgetIndex"]);
                    if (widgetNum !== widget.attrs["widgetIndex"]) {
                        widgetId = name + widget.attrs["widgetIndex"];
                    }
                }
                var foundConfig = {options: {id: widgetId}};
                var configInDashboard = false;

                // get currently saved widget config
                _($scope.dashboard.widgets).forEach(function (config) {
                    if (config.options && config.options.id == widgetId) {
                        // process widget with the config object
                        foundConfig = config;
                        configInDashboard = true;
                        $log.debug('**DIW-D** widgetContainer registerWidget, id = ' + widgetId);
                    }
                });

                if (widget.callback) { // widget -> processWidget
                    $scope.processedWidgetNames.push(widgetId);
                    // $log.debug('**DIW-D** widgetContainer registerWidget, callback = ' + widget.callback);
                    widget.callback(configInDashboard, foundConfig, $scope.dashboard);
                }
            }

            function upsertComponent(newComponent) {
                // not all widgets have to have components so this may be null
                if(newComponent == null) {
                    return;
                }

                // Currently there will only be one component on the dashboard, but this logic should work
                // when that changes and multiple are available
                var foundComponent = false;
                _($scope.dashboard.application.components).forEach(function (component, idx) {
                    if(component.id == newComponent.id) {
                        foundComponent = true;
                        $log.debug('**DIW-D** In widgetContainer upsertComponent, component = ', component);
                        $log.debug('**DIW-D** In widgetContainer upsertComponent, newComponent = ', newComponent);
                        $scope.dashboard.application.components[idx] = newComponent;
                        // var buildCollector = modalData.dashboard.application.components[0].collectorItems.Build,
                        // savedCollectorBuildJob = buildCollector ? buildCollector[0].description : null;
                         
                        // if(!savedCollectorBuildJob) {
                        //     $scope.dashboard.application.components[idx] = newComponent;
                        // } else if (savedCollectorBuildJob !== newComponent.collectorItems.Build[0].description) {
                            
                        // }
                    }
                });

                if(!foundComponent) {
                    $log.debug('**DIW-D** In widgetContainer upsertComponent, component not found = ', newComponent);
                    $scope.dashboard.application.components.push(newComponent);
                }
            }

            function upsertWidget(newConfig) {
                // update the local config id
                // widget directive handles api updates
                var foundMatch = false;
                _($scope.dashboard.widgets)
                    .filter(function(config) {
                        return config.options.id === newConfig.options.id;
                    }).forEach(function (config, idx) {
                        foundMatch = true;
                        $log.debug('**DIW-D** In widgetContainer upsertWidget, foundMatch config updated = ', config);                       
                        $scope.dashboard.widgets[idx] = angular.extend(config, newConfig);
                    });
                    $log.debug('**DIW-D** In widgetContainer upsertWidget, newConfig = ', newConfig);
                if(!foundMatch) {
                    $scope.dashboard.widgets.push(newConfig);
                }
                $log.debug('**DIW-D** In widgetContainer upsertWidget, dashboard.widgets = ', dashboard.widgets);                
            }
        }

        // TODO: loop through placeholders and place any widgets not already processed in them
        function link($scope) {
            // process placeholders
            // get the dashboard controller (just need widgets?)
            if ($scope.placeholders.length === 0) {
                return;
            }
            $log.debug('**DIW-D** widgetContainer Link');
            _($scope.dashboard.widgets)
                .filter(function (widget) {
                    return $scope.processedWidgetNames.indexOf(widget.options.id) == -1;
                })
                .forEach(function (item, idx) {
                    var remainder = idx % $scope.placeholders.length;
                    var widget = $scope.dashboard.widgets[idx];
                    $log.debug('**DIW-D** widgetContainer Link, Linked ' + widget.name);
                    var el = $compile('<widget name="' + widget.name + '"></widget>')($scope);

                    $scope.placeholders[remainder].element.append(el);
                });
        }
    }
})();