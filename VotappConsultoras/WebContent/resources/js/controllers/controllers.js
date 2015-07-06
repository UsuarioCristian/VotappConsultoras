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

.controller('ThirdController', ['$scope', '$modal', 'EncuestaFactory', function($scope, $modal, EncuestaFactory) {
	$scope.seleccion = {eleccion : null};
		
	$scope.openModal = function () {

	    var modalInstance = $modal.open({
	      //animation: $scope.animationsEnabled,
	      templateUrl: 'views/modalAltaEncuesta.html',
	      controller: 'ModalInstanceCtrl',
	      //size: size,
	      resolve: {	        
	        eleccion: function () {
	          return $scope.seleccion.eleccion;
	        }
	      }
	    });
	    
	    modalInstance.result.then(
	    	function (dataEncuesta) {//selectedItem
	    		//$scope.selected = selectedItem;
	    		
	    		EncuestaFactory.crearEncuesta(dataEncuesta).then(
	    				function(response){
	    					
	    				},
	    				
	    				function(response){
	    					//error messagge
	    					console.log("Error en la creacion del Encuestador"+ response.data);
	    				}
	    		)
	    		
	    		
	      },
	      	function () {
	        //$log.info('Modal dismissed at: ' + new Date());//Si apreto cancelar en el modal
	      });
	};
			
	
}])

.controller('ModalInstanceCtrl', ['$scope', '$modalInstance','eleccion', function($scope, $modalInstance, eleccion) {//items
	
	$scope.eleccion = eleccion;
	
	$scope.ok = function () {
		/*2 formas de hacerlo, puedo llamar el servicio desde aqui o desde el result del modalInstance*/
		var esPorCandidato;
		if($scope.preguntaPrincipal.pregunta == 'Candidato')
			esPorCandidato : true;
		else
			esPorCandidato : false;
		
		var dataEncuesta = {
				idEleccion : eleccion.id,
				porCandidato : esPorCandidato,
				nombre : $scope.checkboxModel.value0,
				preguntarLista : $scope.checkboxModel.value1,
				preguntarEdad : $scope.checkboxModel.value2,
				preguntarSexo : $scope.checkboxModel.value3,
				preguntarNivelEstudio : $scope.checkboxModel.value4,
				cantidadRespuestas : $scope.checkboxModel.value5,
				
		}
		
		$modalInstance.close(dataEncuesta);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
	
	$scope.preguntaPrincipal = {
		pregunta : 'Candidato'
	};
	$scope.checkboxModel = {
		value0 : "", // Nombre de la encuesta
		value1 : false,// Activar pregunta de que lista voto
		value2 : false,// Activar pregunta de edad
		value3 : false,// Activar pregunta de sexo
		value4 : false, // Activar pregunta de nivel de estudio
		value5 : 0// num de respuestas 
	};
	
	
}])