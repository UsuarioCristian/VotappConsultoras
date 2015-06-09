'use strict';

angular.module("app.controllers",[
'angular-storage',
'angular-jwt'
])
.controller("LoginController", ['$scope', 'LoginFactory', '$location', 'store',function($scope, LoginFactory, $location, store){
	$scope.user = {};
	$scope.signin = function(){
		LoginFactory.login($scope.user).then(
				function(response){			
					$scope.user.password = ""; // Borrar la contraseña, ya que solo se necesita el token
					store.set('tokenConsultora', response.data);
					$location.url("/home");
				},
				
				function(response){
					//error messagge
					console.log(response.data);
				}
			)	
	
	}
	
}])
.controller('ConsultoraController', ['$scope', 'ConsultoraFactory', function($scope, ConsultoraFactory) {
	
	$scope.updateResultado = function(consultoraId){
		
		ConsultoraFactory.getConsultora(consultoraId).then(
				function(response){
					console.log(response.data);
				},
				
				function(response){
					//error messagge
					console.log(response.data);
				}
		)
		
	};
	

	
	
	//$scope.updateResultado(1); //valor inicial de la consulta
	
}])


.controller('HomeController', ['$scope', 'ConsultoraFactory', 'jwtHelper','store', function($scope, ConsultoraFactory, jwtHelper, store){
			
	$scope.altaEncuestador = function(){
		
		//Busco el tokenConsultora para obtener los datos necesarios, en este caso su ID
		// recordar inyectar al modulo (app.controllers) angular-storage y angular-jwt para usar las dependencias de jwtHelper y store
		var tokenConsultora = store.get('tokenConsultora');
		var tokenDecodificado = jwtHelper.decodeToken(tokenConsultora);
		var consultoraID = tokenDecodificado.consultoraID;		
		$scope.encuestador.consultoraID = consultoraID;
		
		ConsultoraFactory.crearEncuestador($scope.encuestador).then(
				function(response){
					$scope.encuestador = {};
				},
				
				function(response){
					//error messagge
					console.log("Error en la creacion del Encuestador"+ response.data);
				}
		)
		
	};
	
	
}])

.controller('UsuarioController', ['$scope', 'UsuarioFactory', function($scope, UsuarioFactory) {
	

			
	
}])