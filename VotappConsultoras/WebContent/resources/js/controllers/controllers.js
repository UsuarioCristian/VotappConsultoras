'use strict';

angular.module("app.controllers",[
'angular-storage',
'angular-jwt'
])
.controller("LoginController", ['$scope', 'LoginFactory', '$state', 'store',function($scope, LoginFactory, $state, store){
	$scope.user = {};
	$scope.signin = function(){
		LoginFactory.login($scope.user).then(
				function(response){			
					$scope.user.password = ""; // Borrar la contraseña, ya que solo se necesita el token
					store.set('tokenConsultora', response.data);
					$state.go("home");
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


.controller('HomeController', ['$scope', 'ConsultoraFactory', 'EleccionFactory','jwtHelper','store', function($scope, ConsultoraFactory, EleccionFactory, jwtHelper, store){
			
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
	
	$scope.elecciones = [];
	$scope.getEleccionesActuales = function() {
		EleccionFactory.getEleccionesActuales().then(
				function(response) {
					$scope.elecciones = response.data;
				},
				function(response){
					//error messagge
					console.log("Error en la obtencion de elecciones"+ response.data);
				}
		)
	}	
	
	
}])

.controller('ThirdController', ['$scope', '$modal', function($scope, $modal) {
	$scope.seleccion = {eleccion : null};
	$scope.items = ['item1', 'item2', 'item3'];
	
	$scope.openModal = function () {

	    var modalInstance = $modal.open({
	      //animation: $scope.animationsEnabled,
	      templateUrl: 'views/modalAltaEncuesta.html',
	      controller: 'ModalInstanceCtrl',
	      //size: size,
	      resolve: {
	        items: function () {
	          return $scope.items;
	        },
	        eleccion: function () {
	          return $scope.seleccion.eleccion;
	        }
	      }
	    });
	    
	    modalInstance.result.then(function (selectedItem) {
	        $scope.selected = selectedItem;
	      }, function () {
	        //$log.info('Modal dismissed at: ' + new Date());
	      });
	};
			
	
}])

.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'items','eleccion', function($scope, $modalInstance, items, eleccion) {
	$scope.items = items;
	$scope.eleccion = eleccion;
	$scope.selected = {
			item: $scope.items[0]
	};
	
	$scope.ok = function () {
		$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
	
	$scope.preguntaPrincipal = {
		pregunta : 'Candidato'
	};
	$scope.checkboxModel = {
		value1 : false,//edad
		value2 : false,//sexo
		value3 : false,//nivel estudio
		value4 : false// listas
	};
	
	
}])