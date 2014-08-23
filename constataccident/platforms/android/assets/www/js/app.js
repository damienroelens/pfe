'use strict';;
(function($) {
    $(function() {
        $(document).on('deviceready', function() {
            navigator.splashscreen.hide();
        });
    });
}).call(this, jQuery);

// Declare app level module which depends on filters, and services
angular.module('constatApp', [
    'ngRoute',
    'ngTouch',
    'ngAnimate',
    'constatApp.filters',
    'constatApp.services',
    'constatApp.directives',
    'constatApp.controllers'
]).
config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/menu', {
            templateUrl: 'partials/menu.html',
            controller: 'menuCtrl'
        });
        $routeProvider.when('/declaration', {
            templateUrl: 'partials/declaration.html',
            controller: 'choiceCtrl'
        });
        $routeProvider.when('/declaration/map', {
            templateUrl: 'partials/map.html',
            controller: 'mapCtrl'
        });
        $routeProvider.when('/declaration/1', {
            templateUrl: 'partials/decla1.html',
            controller: 'positionCtrl'
        });
        $routeProvider.when('/declaration/2', {
            templateUrl: 'partials/decla2.html',
            controller: 'voletaCtrl'
        });
        $routeProvider.when('/declaration/3', {
            templateUrl: 'partials/decla3.html',
            controller: 'voletbCtrl'
        });
        $routeProvider.when('/declaration/recap1', {
            templateUrl: 'partials/recap1.html',
            controller: 'recapCtrl'
        });
        $routeProvider.when('/declaration/recap2', {
            templateUrl: 'partials/recap2.html',
            controller: 'recapCtrl'
        });
        $routeProvider.when('/declaration/recap3', {
            templateUrl: 'partials/recap3.html',
            controller: 'recapCtrl'
        });
        $routeProvider.when('/declaration/confirm', {
            templateUrl: 'partials/confirm.html',
            controller: 'confirmCtrl'
        });
        $routeProvider.when('/declaration/photo', {
            templateUrl: 'partials/declaphoto.html',
            controller: 'photoCtrl'
        });
        $routeProvider.when('/declaration/circons', {
            templateUrl: 'partials/declacircons.html',
            controller: 'circonsCtrl'
        });
        $routeProvider.when('/declaration/dessin', {
            templateUrl: 'partials/decladessin.html',
            controller: 'dessinCtrl'
        });
        $routeProvider.when('/profil', {
            templateUrl: 'partials/profil.html',
            controller: 'profilCtrl'
        });
        $routeProvider.when('/assistance', {
            templateUrl: 'partials/assistance.html',
            controller: 'assistCtrl'
        });
        $routeProvider.otherwise({
            redirectTo: '/menu'
        });
    }
]);