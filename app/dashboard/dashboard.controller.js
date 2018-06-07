(function() {
    'use strict'

    angular.module('app.dashboard')
    .controller('DashboardController', DashboardController);

    /**
     * @ngdoc Injector
     * @name DashboardController
     * @private
     * @module app.dashboard
     * @description
     * DashboardController.
     * @author Ideas2IT Technologies
     * @copyright
     */
    DashboardController.$inject = ['$scope', '$rootScope','NgMap', '$mdDialog', '$timeout'];

    /**
     * @ngdoc dashboardcontroller
     * @name dashboardcontroller
     * @module app.dashboard
     * @requires
     * @description
     * dashboardcontroller.
     * @author Ideas2IT Technologies
     * @copyright
     */
    function DashboardController($scope, $rootScope, NgMap, $mdDialog, $timeout) {
        var vm = this;
        vm.d3 = d3;
        vm.value = 1;
        vm.currentGridMode = 'current';
        vm.markerAddress = '';
        vm.selectedCustomer = '';
        vm.selectedMarker = {};
        vm.sortBy = 'last 6 months';
        vm.isMdDialogOpen = false;
        vm.searchMonitor = '';
        vm.powerConsumtionList = [];
        vm.metersDetails = [];
        vm.center = [-25.77628933,28.26657067];
        vm.show = {
            loader: false
        };

        /**
         * To load initial dashboard
         *
         * @author Ideas2IT Technologies
         */
        vm.initializeDashboard = function() {
            NgMap.getMap().then(function(map) {
                vm.map = map;
            });
            vm.markers = [];
            d3.csv('GPS_final_csv.csv', function(meter) {
                vm.markers.push(meter);
            });
            d3.csv('Customers_final_csv.csv', function(meterDetails){
                vm.metersDetails.push(meterDetails);
            });
        };

        /**
         * To switch between grid
         *
         * @param {String} mode
         * @author Ideas2IT Technologies
         */
        vm.switchGrid = function (mode) {
            if(vm.currentGridMode !== mode) {
                vm.show.gridLoader = true;
                $timeout(function() {
                    vm.metersDetails = vm.metersDetails.reverse();
                    vm.currentGridMode = mode;
                    vm.show.gridLoader = false;
                },700);   
            }           
        };

        /**
         * Change the graph view into searched location
         */
        vm.getPlace = function() {
            var place = this.getPlace();
            vm.center = [];
            vm.center = [place.geometry.location.lat(), place.geometry.location.lng()]
        };

        /**
         * Get location of using longitude and latitude
         * 
         * @param {Event} event
         * @param {marker} marker
         * @author Ideas2IT Technologies
         */
        vm.getLocationName = function(event, marker) {
            var geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(marker.GPS_Location_X, marker.GPS_Location_Y);
            geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        vm.markerAddress = results[1].formatted_address;
                    } else {
                        vm.markerAddress = 'Location not found';
                    }
                } else {
                    vm.markerAddress = 'Location not found';
                }
            });
            vm.selectedCustomer = _.findWhere(vm.metersDetails,{CustomerID: marker.Customer}) || '';
            vm.selectedMarker = marker;
            vm.map.showInfoWindow('marker-info', marker.MeterId);
        };

        /**
         * To open the md-dialog 
         *
         * @param {String} target
         * @author Ideas2IT Technologies
         */
        vm.openMetersConsumtionDialog = function(target) {
            vm.powerConsumtionList = {
                currentConsumtion:[{"date":"5/1/2017","value":42000},{"date":"6/1/2017","value":43000},{"date":"7/1/2017","value":43000},{"date":"8/1/2017","value":43000},{"date":"11/1/2017","value":43980},{"date":"1/1/2018","value":45000},{"date":"2/1/2018","value":46000},{"date":"3/1/2018","value":44000},{"date":"5/1/2018","value":42000}],
                predicitiveConsumtion: [
                    {"date":"6/1/2018","value":41000},
                    {"date":"7/1/2018","value":44000},
                    {"date":"8/1/2018","value":46000},
                    {"date":"9/1/2018","value":46000},
                    {"date":"10/1/2018","value":47000}
                ]
            };
            vm.meterStatus = {
                online:[{"date":"5/1/2017","value":340},{"date":"6/1/2017","value":230},{"date":"7/1/2017","value":380},{"date":"8/1/2017","value":440},{"date":"11/1/2017","value":679},{"date":"1/1/2018","value":680},{"date":"2/1/2018","value":760},{"date":"3/1/2018","value":590},{"date":"5/1/2018","value":600}],
                predictedOnline: [
                    {"date":"6/1/2018","value":700},
                    {"date":"7/1/2018","value":560},
                    {"date":"8/1/2018","value":580},
                    {"date":"9/1/2018","value":870},
                    {"date":"10/1/2018","value":600}
                ],
                offline:[{"date":"5/1/2017","value":170},{"date":"6/1/2017","value":69},{"date":"7/1/2017","value":342},{"date":"8/1/2017","value":264},{"date":"11/1/2017","value":203},{"date":"1/1/2018","value":476},{"date":"2/1/2018","value":608},{"date":"3/1/2018","value":413},{"date":"5/1/2018","value":440}],
                predictedOffline: [
                    {"date":"6/1/2018","value":420},
                    {"date":"7/1/2018","value":168},
                    {"date":"8/1/2018","value":386},
                    {"date":"9/1/2018","value":400},
                    {"date":"10/1/2018","value":280}
                ]
            };

            $mdDialog.show({
                contentElement: '#' + target,
                clickOutsideToClose: true
            });
        };

        vm.closeMdDialog = function() {
            vm.isMdDialogOpen
            $mdDialog.cancel();
        };

        vm.searchEnergyMonitor = function() {
            if (!vm.searchMonitor) {
                vm.center = [-25.77628933,28.26657067];
            }
        };
    }

})();