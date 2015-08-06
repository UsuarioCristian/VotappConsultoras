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


.controller('HomeController', ['$scope', 'ConsultoraFactory', 'EleccionFactory','jwtHelper','store', '$state', function($scope, ConsultoraFactory, EleccionFactory, jwtHelper, store, $state){
			
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
	
	$scope.logout = function() {
		store.remove('tokenConsultora');
		$state.go('login');
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

.controller('ModalInstanceCtrl', ['$scope', '$modalInstance','eleccion', 'jwtHelper', 'store', '$modal', function($scope, $modalInstance, eleccion, jwtHelper, store, $modal) {//items
	
	$scope.eleccion = eleccion;
	
	if(eleccion.tipoEleccion == 'Departamental'){
		
		var deptos = ['Artigas', 'Cerro Largo', 'Durazno', 'Florida', 'Maldonado', 'Paysandú', 'Rivera', 'Salto',
		                 'Soriano', 'Treinta y Tres', 'Canelones', 'Colonia', 'Flores', 'Lavalleja', 'Montevideo', 'Río Negro',
		                 'Rocha', 'San José', 'Tacuarembó']
		
		$scope.departamentos = deptos.sort();
		
		$scope.seleccionarDeptos = function(){
			
			var modalInstance = $modal.open({
			      //animation: $scope.animationsEnabled,
			      templateUrl: 'views/modalDeptosEncuesta.html',
			      controller: 'ModalDeptosEncuestaCtrl',
			      //size: size,
			      resolve: {	        
			    	  deptos: function () {
			          return $scope.departamentos;
			        }
			      }
			    });
			
			modalInstance.result.then(
			    	function (listaEncuestaDeptos) {			    				    				    		
			    		$scope.listaEncuestaDeptos = listaEncuestaDeptos;
			      },
			      	function () {
			       
			      });
			
		}
	}
	
	
	$scope.ok = function () {
		/*2 formas de hacerlo, puedo llamar el servicio desde aqui o desde el result del modalInstance*/
		var esPorCandidato;
		if($scope.preguntaPrincipal.pregunta == 'Candidato')
			esPorCandidato = true;
		else
			esPorCandidato = false;
		
		var tokenConsultora = store.get('tokenConsultora');
		var decodedToken = jwtHelper.decodeToken(tokenConsultora);
		
		var dataEncuesta = {
				idEleccion : eleccion.id,
				porCandidato : esPorCandidato,
				nombre : $scope.checkboxModel.value0,
				preguntarLista : $scope.checkboxModel.value1,
				preguntarEdad : $scope.checkboxModel.value2,
				preguntarSexo : $scope.checkboxModel.value3,
				preguntarNivelEstudio : $scope.checkboxModel.value4,
				cantidadRespuestas : $scope.checkboxModel.value5,
				idConsultora : decodedToken.consultoraID,
				listaEncuestaDeptos : $scope.listaEncuestaDeptos
				
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

.controller('ModalDeptosEncuestaCtrl', ['$scope','$modalInstance', 'deptos', function($scope, $modalInstance, deptos){
	
	$scope.departamentos = [];
	$scope.listaEncuestaDeptos = []
	
	for ( var i = 0; i <  deptos.length; i++) {
		var encuestaDepto = {
				nombre : deptos[i],
				cantidadRespuestas : 0
		}
		$scope.departamentos.push(encuestaDepto);
	}
	
	$scope.toggleSelection = function toggleSelection(depto) {		
		var idx = $scope.listaEncuestaDeptos.indexOf(depto);
	    if (idx > -1) {
	    	$scope.listaEncuestaDeptos.splice(idx, 1);
	    }
	    else {
	    	$scope.listaEncuestaDeptos.push(depto);
	    }
	};
	
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
	
	$scope.ok = function () {
		$modalInstance.close($scope.listaEncuestaDeptos);
	}	
	
}])

.controller('FourthController', ['$scope', 'store', function($scope, store){
	$scope.encuestasFinalizadas = store.get('encuestasFinalizadas');
}])

.controller('EncuestaController', ['$scope', '$stateParams', 'store', function($scope, $stateParams, store){
	$scope.encuestasFinalizadas = store.get('encuestasFinalizadas');
	var encontre = false;
	var i = 0;
	while(!encontre && i < $scope.encuestasFinalizadas.length){
		if($scope.encuestasFinalizadas[i].id == $stateParams.encuestaId){
			encontre = true;
			$scope.encuesta = $scope.encuestasFinalizadas[i];
		}else{
			i++;
		}			
	}
	
	/*******************************/
	/*******Seccion Graficas********/
	/*******************************/
	var data = [];
	var resultado = $scope.encuesta.resultado;
	if($scope.encuesta.porCandidato){
		var mapCandidatos = resultado.mapCandidatos;
		var candidatos = $scope.encuesta.dataCandidatos;
		
		for(var i=0; i < candidatos.length; i++){
			var candidato = candidatos[i];
			var cantidad = mapCandidatos[candidato.id];
			var dato = {
	                name: candidato.nombre,
	                y: cantidad
	            }
			data.push(dato);
		}
	}
	
		
	var chartPie = new Highcharts.Chart({
	    chart: {
	            plotBackgroundColor: null,
	            plotBorderWidth: null,
	            plotShadow: false,
	            type: 'pie',
	            renderTo: 'container',
	        },
	        title: {
	            text: 'Resultado encuesta (prueba)'
	        },
	        subtitle: {
	        	text: 'Total encuestados: '+ $scope.encuesta.cantidadRespuestas,
	        },
	        tooltip: {
	            pointFormat: '{series.name}: <b>{point.y}</b>'
	        },
	        plotOptions: {
	            pie: {
	                allowPointSelect: true,
	                cursor: 'pointer',
	                dataLabels: {
	                    enabled: true,
	                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
	                    style: {
	                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
	                    }
	                }
	            }
	        },
	        series: [{
	            name: "Total",
	            colorByPoint: true,
	            data : data
//	            data: [{
//	                name: "Microsoft Internet Explorer",
//	                y: 56.33
//	            }, {
//	                name: "Chrome",
//	                y: 24.03,
//	                sliced: true,
//	                selected: true
//	            }, {
//	                name: "Firefox",
//	                y: 10.38
//	            }, {
//	                name: "Safari",
//	                y: 4.77
//	            }, {
//	                name: "Opera",
//	                y: 0.91
//	            }, {
//	                name: "Proprietary or Undetectable",
//	                y: 0.2
//	            }]
	        }]
	})
	
}])








