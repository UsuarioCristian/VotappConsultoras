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


.controller('HomeController', ['$scope', 'ConsultoraFactory', 'EleccionFactory','jwtHelper','store', '$state', '$interval','EmergenciaFactory', function($scope, ConsultoraFactory, EleccionFactory, jwtHelper, store, $state,$interval,EmergenciaFactory){
	$scope.isCollapsed = true;		
		
	$scope.actualizarCelular = function(){
		
		swal({   title: "Ingrese su celular!",   
			text: "Recurde: A este numero se le enviará alertas de encuestadores en peligro:",  
			type: "input",   showCancelButton: true, 
			closeOnConfirm: false,  
			animation: "slide-from-top", 
			inputPlaceholder: "Celular nro." }, 
			function(inputValue){  
				if (inputValue === false) 
					return false;  
				if (inputValue === "") {     
					swal.showInputError("El campo es obligatorio!");   
					return false   
				
				} 
				
				var tokenConsultora = store.get('tokenConsultora');
				var tokenDecodificado = jwtHelper.decodeToken(tokenConsultora);
				var dataUsuario = {
						username : tokenDecodificado.username,
						celular : inputValue				
				}
				ConsultoraFactory.actualizarCelular(dataUsuario).then(
							function (response){
								swal("Ok!", "Celular nro.: " + inputValue, "success"); 
							},
							function(response){
								sweetAlert("Oops...", "Ocurrió un error al ingresar celular!", "error");
							}
				)
			}
		);
		
		
	}
	
	$scope.existeUsuario = function(){
		ConsultoraFactory.existeUsuario($scope.encuestador.username).then(
				function(response){
					if(response.data === true)
						$scope.isCollapsed = false;
					else
						$scope.isCollapsed = true;
				},
				function(response){
					console.log("Error en validacion de usuario: "+ response.data)
				}
			)
	}
	
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
					swal("Encuestador creado!","","success");
				},
				
				function(response){
					//error messagge
					console.log("Error en la creacion del Encuestador"+ response.data);
					sweetAlert("Oops...", "Error al crear el usuario encuestador!", "error");

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
		store.remove('encuestasFinalizadas');
		store.remove('emergencias');
		$state.go('login');
		$scope.killtimer();
	}
	
	/*****************************************************/
	/*$interval para saber si existe una Emergencia nueva*/
	/*****************************************************/
	$scope.alertActivo = false;
	var timer = $interval(function(){
		EmergenciaFactory.thereANewEmergency(); // Ejecuto esta funcion para que se actualice EmergenciaFactory.thereAEmergency
		if(EmergenciaFactory.getThereANewEmergency() && (!$scope.alertActivo)){
			$scope.alertActivo = true;
			swal({
				  title: "Hay una nueva emergencia",
				  text: "Se recomienda ir a la seccion de Emergencias",
				  type: "warning",
				  showCancelButton: true,
				  confirmButtonColor: "#DD6B55",
				  confirmButtonText: "Ir a Emergencias!",
				  closeOnConfirm: true,
				  html: false
				}, function(){
					$scope.alertActivo = false;
					$state.go('emergencias');
			});			
			
		}
	},5000);

	$scope.killtimer = function(){
		if(angular.isDefined(timer)){
			$interval.cancel(timer);
            timer = undefined;
        }
	};
	
	$scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
		$scope.killtimer();
      });
	
	
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
				preguntarSiTrabaja : $scope.checkboxModel.value6,
				preguntarIngresos :  $scope.checkboxModel.value7,
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

.controller('FourthController', ['$scope', 'store', 'EncuestaFactory', '$timeout',function($scope, store, EncuestaFactory, $timeout){
	$scope.encuestasFinalizadas = store.get('encuestasFinalizadas');

	if($scope.encuestasFinalizadas == null){
		$timeout(function(){},500).then(
				function(){
					$scope.encuestasFinalizadas = store.get('encuestasFinalizadas');
				},
				function(){}		
		);	
	}
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
	
	$scope.tiposGraficas = [];
	var graficaPie = {
			nombre : 'Gráfica de Pie',
			id : 1
	}
	$scope.tiposGraficas.push(graficaPie);
	
	if($scope.encuesta.preguntarEdad){
		var graficaEdad = {
				nombre : 'Gráfica columna segun edad',
				id : 2
		}
		$scope.tiposGraficas.push(graficaEdad);
	}
	
	if($scope.encuesta.preguntarNivelEstudio){
		var graficaEducacion = {
				nombre : 'Gráfica columna segun nivel educativo',
				id : 3
		}
		$scope.tiposGraficas.push(graficaEducacion);
	}
	
	if($scope.encuesta.preguntarLista){
		var graficaLista = {
				nombre : 'Gráfica listas',
				id : 4
		}
		$scope.tiposGraficas.push(graficaLista);
	}
	
	$scope.graficaSeleccionada = $scope.tiposGraficas[0];
		
	/*********************************************************************/
	/********************CARGA DE DATOS DEL PIE CHART*********************/
	/*********************************************************************/
	/*********************************************************************/
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
	}else{
		var mapPartidos = resultado.mapPartidos;
		var partidos = $scope.encuesta.dataPartidos;
		
		for(var i = 0; i < partidos.length; i++){
			var partido = partidos[i];
			var cantidad = mapPartidos[partido.id];
			var dato = {
					name: partido.nombre,
					y: cantidad
				}
			data.push(dato);
		}
	}	
	/*****Como chartPie es la grafica que aparece por defecto, 
	 * entonces se debe iniciar aqui (las demas lo hacen con el ng-change $scope.changeChart)**********/
	
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
	        }]
	})
	
	/****************************************************************************/
	/********************CARGA DE DATOS DEL GRAFICA POR EDAD*********************/
	/****************************************************************************/
	/****************************************************************************/
	if($scope.encuesta.preguntarEdad){
		var serieEdad = [];
		var de18a23 = resultado.mapEdad18a23;
		var de24a30 = resultado.mapEdad24a30;
		var de31a50 = resultado.mapEdad31a50;
		var de51omas = resultado.mapEdad51omas;
		
		var valorVotoBlanco = -1;
		var valorVotoNoSabe = -1;
		
		if($scope.encuesta.porCandidato){
			var mapCandidatos = resultado.mapCandidatos;
			var candidatos = $scope.encuesta.dataCandidatos;		
						
			for(var i=0; i < candidatos.length; i++){
				var candidato = candidatos[i];
				var cantidad18a23 = de18a23[candidato.id];
				var cantidad24a30 = de24a30[candidato.id];
				var cantidad31a50 = de31a50[candidato.id];
				var cantidadde51omas = de51omas[candidato.id];
				
				var valor = {
		                name: candidato.nombre,
		                data: [cantidad18a23, cantidad24a30, cantidad31a50, cantidadde51omas]
		            }
				if(candidato.id === 0)
					valorVotoBlanco = valor;
				else if(candidato.id === -1)
					valorVotoNoSabe = valor;
				else
					serieEdad.push(valor);
			}
		}else{
			var mapPartidos = resultado.mapPartidos;
			var partidos = $scope.encuesta.dataPartidos;
			
			for( var i = 0; i < partidos.length; i++){
				var partido = partidos[i];
				var cantidad18a23 = de18a23[partido.id];
				var cantidad24a30 = de24a30[partido.id];
				var cantidad31a50 = de31a50[partido.id];
				var cantidadde51omas = de51omas[partido.id];
				
				var valor = {
		                name: partido.nombre,
		                data: [cantidad18a23, cantidad24a30, cantidad31a50, cantidadde51omas]
		            }
				
				if(partido.id === 0)
					valorVotoBlanco = valor;
				else if(partido.id === -1)
					valorVotoNoSabe = valor;
				else
					serieEdad.push(valor);
			}
		}	
		if(valorVotoBlanco !== -1) /*Cuidado, hay que ver q existan votos en blanco*/
			serieEdad.push(valorVotoBlanco);
		if(valorVotoNoSabe !== -1) /*Cuidado, hay que ver q existan respuestas "no sabe"*/
			serieEdad.push(valorVotoNoSabe);
	}
	
	/****************************************************************************/
	/****************CARGA DE DATOS DE GRAFICA POR NIVEL ESTUDIO*****************/
	/****************************************************************************/
	/****************************************************************************/
	if($scope.encuesta.preguntarNivelEstudio){
		var serieEstudio = [];
		var primaria = resultado.mapNivelEstudioPrimaria;
		var secundaria = resultado.mapNivelEstudioSecundaria;
		var terciario = resultado.mapNivelEstudioTerciario;
		var noSabe = resultado.mapNivelEstudioNoSabe;
		
		var valorVotoBlanco = -1;
		var valorVotoNoSabe = -1;
		
		if($scope.encuesta.porCandidato){
			var mapCandidatos = resultado.mapCandidatos;
			var candidatos = $scope.encuesta.dataCandidatos;		
			
			for(var i=0; i < candidatos.length; i++){
				var candidato = candidatos[i];
				var cantidadPrimaria = primaria[candidato.id];
				var cantidadSecundaria = secundaria[candidato.id];
				var cantidadTerciario = terciario[candidato.id];
				var cantidadNoSabe = noSabe[candidato.id];
				
				var valor = {
		                name: candidato.nombre,
		                data: [cantidadPrimaria, cantidadSecundaria, cantidadTerciario, cantidadNoSabe]
		            }
				if(candidato.id === 0)
					valorVotoBlanco = valor;
				else if(candidato.id === -1)
					valorVotoNoSabe = valor;
				else
					serieEstudio.push(valor);
			}
		}else{
			var mapPartidos = resultado.mapPartidos;
			var partidos = $scope.encuesta.dataPartidos;
			
			for( var i = 0; i < partidos.length; i++){
				var partido = partidos[i];
				var cantidadPrimaria = primaria[partido.id];
				var cantidadSecundaria = secundaria[partido.id];
				var cantidadTerciario = terciario[partido.id];
				var cantidadNoSabe = noSabe[partido.id];
				
				var valor = {
		                name: partido.nombre,
		                data: [cantidadPrimaria, cantidadSecundaria, cantidadTerciario, cantidadNoSabe]
		            }
				if(partido.id === 0)
					valorVotoBlanco = valor;
				else if(partido.id === -1)
					valorVotoNoSabe = valor;
				else
					serieEstudio.push(valor);
			}
		}
		
		if(valorVotoBlanco !== -1) /*Cuidado, hay que ver q existan votos en blanco*/
			serieEdad.push(valorVotoBlanco);
		if(valorVotoNoSabe !== -1) /*Cuidado, hay que ver q existan respuestas "no sabe"*/
			serieEdad.push(valorVotoNoSabe);		
	}
	/****************************************************************************/
	/****************************************************************************/
	/****************CARGA DE DATOS DE GRAFICA POR LISTA*****************/
	/****************************************************************************/
	/****************************************************************************/
	if($scope.encuesta.preguntarLista){
		var serieLista = [{
			name: "Votos",
		    colorByPoint: true,
		    data: []
		}];
		
		var drilldownLista = {
				series:[]
		}
		
		var mapListas = resultado.mapListas;
		if($scope.encuesta.porCandidato){
			var mapCandidatos = resultado.mapCandidatos;
			var candidatos = $scope.encuesta.dataCandidatos;		
			
			for(var i=0; i < candidatos.length; i++){				
				var candidato = candidatos[i];
				var serie = {
						name: candidato.nombre,
						id: candidato.id,
						data:[]						
				}
				
				for(var j = 0; j < candidato.dataListas.length; j++){
					var dato = ['Lista '+candidato.dataListas[j].numero, mapListas[candidato.dataListas[j].id]];
					serie.data.push(dato);
				}		
					
				drilldownLista.series.push(serie);				
				
				var valor = {
		                name: candidato.nombre,
		                y : mapCandidatos[candidato.id],
		                drilldown: candidato.id,
		            }
				serieLista[0].data.push(valor);
			}
		}else{
			var mapPartidos = resultado.mapPartidos;
			var partidos = $scope.encuesta.dataPartidos;
			
			for(var i=0; i < partidos.length; i++){				
				var partido = partidos[i];
				var serie = {
						name: partido.nombre,
						id: partido.id,
						data:[]						
				}
				
				for(var j = 0; j < partido.listas.length; j++){
					var dato = ['Lista '+partido.listas[j].numero, mapListas[partido.listas[j].id]]
					serie.data.push(dato);
				}		
					
				drilldownLista.series.push(serie);				
				
				var valor = {
		                name: partido.nombre,
		                y : mapPartidos[partido.id],
		                drilldown: partido.id,
		            }
				serieLista[0].data.push(valor);
			}
		}		
		
	}
	
	
	/******************************************************************************************************************/
	/******************************************************************************************************************/
	/************AQUI ES EN DONDE SE CARGAN LOS DATOS ANTERIORES DEPENDIENDO DE QUE GRAFICA SE SELECCIONA**************/
	/******************************************************************************************************************/
	/******************************************************************************************************************/
	
	$scope.changeChart = function(){
		
		switch ($scope.graficaSeleccionada.id) {
		case 1:
			/*Igualo a null a todas las demas graficas*/
			chartColumEdad = null;
			chartColumEducacion = null;
			
			chartPie = new Highcharts.Chart({
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
			        }]
			})
			break;
		case 2:
			chartPie = null;
			chartColumEducacion = null;
			
			var chartColumEdad = new Highcharts.Chart({
			    chart: {
			    	type: 'column',
			    	renderTo: 'container2',
			    },
			    title: {
		            text: 'Votos por edad'
		        },
		        subtitle: {
		        	text: 'Total encuestados: '+ $scope.encuesta.cantidadRespuestas,
		        },
		        xAxis: {
		            categories: [
		                '18 a 23',
		                '24 a 30',
		                '31 a 50',
		                'Mas de 50',
		               
		            ],
		            crosshair: true
		        },
		        yAxis: {
		            min: 0,
		            title: {
		                text: 'Cantidad de votos'
		            }
		        },
		        tooltip: {
		            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
		            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
		                '<td style="padding:0"><b> {point.y}</b></td></tr>',
		            footerFormat: '</table>',
		            shared: true,
		            useHTML: true
		        },
		        plotOptions: {
		            column: {
		                pointPadding: 0.2,
		                borderWidth: 0
		            }
		        },
		        series: serieEdad
		        
			})
			
			break;
		case 3:
			chartPie = null;
			chartColumEdad = null;
			var chartColumEducacion = new Highcharts.Chart({
			    chart: {
			    	type: 'column',
			    	renderTo: 'container3',
			    },
			    title: {
		            text: 'Votos por nivel estudio'
		        },
		        subtitle: {
		        	text: 'Total encuestados: '+ $scope.encuesta.cantidadRespuestas,
		        },
		        xAxis: {
		            categories: [
		                'Primaria',
		                'Secundaria',
		                'Terciario',
		                'No sabe',
		               
		            ],
		            crosshair: true
		        },
		        yAxis: {
		            min: 0,
		            title: {
		                text: 'Cantidad de votos'
		            }
		        },
		        tooltip: {
		            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
		            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
		                '<td style="padding:0"><b> {point.y}</b></td></tr>',
		            footerFormat: '</table>',
		            shared: true,
		            useHTML: true
		        },
		        plotOptions: {
		            column: {
		                pointPadding: 0.2,
		                borderWidth: 0
		            }
		        },
		        series: serieEstudio
		        
			})
			
			break;
		case 4:
			chartPie = null;
			chartColumEdad = null;
			chartColumEducacion = null;
			
			var chartColumLista = new Highcharts.Chart({
				chart: {
		            renderTo: 'container4',
		            type: 'column'            
		        },
		        title: {
		            text: 'Votos con detalles de listas'
		        },
		        subtitle: {
		            text: 'Click en las columnas para ver las listas'
		        },
		        xAxis: {
		            type: 'category'
		        },
		        yAxis: {
		            title: {
		                text: 'Total de votos'
		            }
		        },
		        legend: {
		            enabled: false
		        },
		        plotOptions: {
		            series: {
		                borderWidth: 0,
		                dataLabels: {
		                    enabled: true
		                }
		            }
		        },
		        tooltip: {
		            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
		            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> votos<br/>'
		        },
		        series : serieLista,
		        drilldown : drilldownLista,
			});
			
			break;
		default:
			break;
		}
		
		
	}
	
	
}])

.controller('EmergenciaController', ['$scope', 'store','EmergenciaFactory', function($scope, store, EmergenciaFactory){
	$scope.map = { center: { latitude: -34.8962, longitude: -56.1708 }, zoom: 16};
	
	$scope.emergencias = store.get('emergencias');
	$scope.marcadores = [];
	if($scope.emergencias != null){
	    for (var i = 0; i < $scope.emergencias.length; i++) {
	    	var marker = {
	    		id: $scope.emergencias[i].id,
	      		coords: {
	        		latitude: $scope.emergencias[i].latitud,
	        		longitude: $scope.emergencias[i].longitud
	      		},
	      		options:{
	      			animation: 1,
	      			visible:true
	      		},
	      		click: function(id){
	      			//Buscar la emergencia con idEmergencia = id
	      			var encontre = false;
	      			var j = 0;
	      			while(!encontre){
	      				if($scope.marcadores[j].id == id)
	      					encontre = true;
	      				else
	      					j++;
	      			}
	      			$scope.marcadores[j].options.animation = 0;
	      			$scope.marcadores[j].windowOptions.visible = !$scope.marcadores[j].windowOptions.visible;
	      			$scope.actualizarEmergencia($scope.marcadores[j].id);	      			
	      			$scope.$apply();
	      		},
	      		windowOptions:{
	      			visible:false
	      		},
	      		
	      		nombreEncuestador:$scope.emergencias[i].nombreEncuestador,
	    	}
	    	
	    	if($scope.emergencias[i].notificada)
	    		marker.options.animation = 0;
	    	
	    	$scope.marcadores.push(marker);
	    };

	    $scope.closeClick= function(idMarker){
	    	var encontre = false;
  			var j = 0;
  			while(!encontre){
  				if($scope.marcadores[j].id == idMarker)
  					encontre = true;
  				else
  					j++;
  			}
	    	$scope.marcadores[j].windowOptions.visible = false;
	    }
	    
	    $scope.actualizarEmergencia = function(idEmergencia){
	    	
	    	/*Buscar la emergencia con id idEmergencia*/
	    	var emergencias = store.get('emergencias');
	    	var encontre = false;
	    	var i = 0;
	    	while (!encontre) {
	    		if(emergencias[i].id === idEmergencia){
	    			encontre = true;
	    			EmergenciaFactory.notificarEmergencia(emergencias[i]);/*Esto es un POST a la base*/
	    			emergencias[i].notificada = true;
	    		}else{
	    			i++;
	    		}
			}
	    	
	    	store.set('emergencias', emergencias);
	    	    	
	    }
	    
	    
	}//End $scope.emergencias != null
	
      
   
    
}])







