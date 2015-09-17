'use strict';


// Declare app level module which depends on filters, and services
angular.module('app', [
  'ui.router',
  'angular-storage',
  'angular-jwt',
  //'app.filters',
  'app.services',
  //'app.directives',
  'app.controllers','duScroll',
  'ui.bootstrap',
  'ngAnimate',
  'uiGmapgoogle-maps'
]) 
  
.config(['$urlRouterProvider', '$stateProvider','jwtInterceptorProvider', '$httpProvider', function($urlRouterProvider, $stateProvider,jwtInterceptorProvider, $httpProvider) {
		
	$urlRouterProvider.otherwise('/');
		
	$stateProvider.state('login', {url: '/login', templateUrl: 'views/login.html', controller: 'LoginController'})
	.state('home', {url:'/', templateUrl: 'views/home.html',  controller: 'HomeController', data:{requiresLogin:true},
		resolve:{	        
	        load: function(EncuestaFactory){
	        	return EncuestaFactory.getEncuestasFinalizadas();
	        },
	        loadEmergencias:function(EmergenciaFactory){	          
		          return EmergenciaFactory.getEmergencias();
		        }
	    }	
	})
	
	.state('encuesta', {
		url: '/encuesta/{encuestaId}',
		templateUrl: 'views/encuesta.html',
		controller: 'EncuestaController',
		data:{requiresLogin:true}
	})
	
	.state('emergencias', {
		url:'/emergencia',
		templateUrl: 'views/emergencias.html',
		controller: 'EmergenciaController',
		data:{requiresLogin:true}
	})
 
  jwtInterceptorProvider.tokenGetter = function(store){
	  return store.get('tokenConsultora');
  };
  
  $httpProvider.interceptors.push('jwtInterceptor');
  
}])

.run(['$rootScope','jwtHelper', 'store', '$state', function($rootScope, jwtHelper, store, $state){
	
	$rootScope.$on("$stateChangeStart", function (event, next, current) {
	    if (next.data && next.data.requiresLogin) {
	    	if(!store.get('tokenConsultora')){
	    		event.preventDefault();
	    		$state.go('login');
	    	}else{
	    		if(jwtHelper.isTokenExpired(store.get('tokenConsultora'))){
	    			event.preventDefault();
		    		$state.go('login');
	    		}
	    	}	    	 
	    }
	});
	
}])

.value('duScrollDuration', 800);