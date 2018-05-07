(function() {
    'use strict';
    angular.module('app',[
        'ui.router',
        'app.dashboard',
        'ngMap',
        'ngMaterial'
    ]).config(
        ['$locationProvider',
            function($locationProvider) {
                $locationProvider.html5Mode(true);
            }
        ]
    )
})();