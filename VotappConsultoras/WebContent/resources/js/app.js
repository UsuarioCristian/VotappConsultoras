'use strict';


// Declare app level module which depends on filters, and services
angular.module('app', [
  'ngRoute',
  'angular-storage',
  'angular-jwt',
  //'app.filters',
  'app.services',
  //'app.directives',
  'app.controllers','duScroll'
]).
config(['$routeProvider', 'jwtInterceptorProvider', '$httpProvider', function($routeProvider, jwtInterceptorProvider, $httpProvider) {
  $routeProvider.when('/login', {templateUrl: 'views/login.html', controller: 'LoginController'});
  $routeProvider.when('/consultora', {templateUrl: 'index2.html', controller: 'ConsultoraController'});
  $routeProvider.when('/', {templateUrl: 'views/login.html', controller: 'LoginController'});
  $routeProvider.when('/home', {templateUrl: 'views/home.html',  controller: 'HomeController', data:{requiresLogin:true} });
  $routeProvider.when('/crearConsultora', {templateUrl: 'views/altaConsultora.html',  controller: 'ConsultoraController'});
  $routeProvider.otherwise({redirectTo: '/', templateUrl: 'views/login.html'});
  
  jwtInterceptorProvider.tokenGetter = function(store){
	  return store.get('token');
  };
  
  $httpProvider.interceptors.push('jwtInterceptor');
  
}])

.run(['$rootScope','jwtHelper', 'store', '$location', function($rootScope, jwtHelper, store, $location){
	
	$rootScope.$on("$routeChangeStart", function (event, next, current) {
	    if (next.data && next.data.requiresLogin) {
	    	if(!store.get('token')){
	    		event.preventDefault();
	    		$location.path('/login');
	    	}else{
	    		if(jwtHelper.isTokenExpired(store.get('token'))){
	    			event.preventDefault();
		    		$location.path('/login');
	    		}
	    	}	    	 
	    }
	});
	
}])

.value('duScrollDuration', 800);