(function() {
    'use strict'

    angular.module('app.dashboard')
    .config(
        ['$stateProvider', '$urlRouterProvider',
            function($stateProvider, $urlRouterProvider) {

                $urlRouterProvider.otherwise('/');

                $stateProvider.state('OVERVIEW', {
                    url: '/',
                    templateUrl: 'app/dashboard/templates/overview.html',
                    controller: 'DashboardController',
                    controllerAs: 'vm'
                });
            }
        ]
    )
})();