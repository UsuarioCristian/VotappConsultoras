'use strict';

angular.module("app.controllers",[
'angular-storage'
])
.controller("LoginController", ['$scope', 'LoginFactory', '$location', 'store',function($scope, LoginFactory, $location, store){
	$scope.user = {};
	$scope.signin = function(){
		LoginFactory.login($scope.user).then(
				function(response){			
					$scope.user.password = ""; // Borrar la contraseña, ya que solo se necesita el token
					store.set('token', response.data);
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


.controller('HomeController', ['$scope', 'ConsultoraFactory', function($scope, ConsultoraFactory){
	var booleano = false;
	
	$scope.mostrarFormulario = function(){
		return booleano;
		
	}
	
	$scope.crearConsultora = function(){		
		booleano = true;
	}
	
	$scope.crearUsuario = function(consultora){
				
		ConsultoraFactory.crearConsultora(consultora).then(
				function(response){
					
				},
				
				function(response){
					//error messagge
						
				}
		)
		
	};
	
	
}])

.controller('UsuarioController', ['$scope', 'UsuarioFactory', function($scope, UsuarioFactory) {
	

			
	
}])