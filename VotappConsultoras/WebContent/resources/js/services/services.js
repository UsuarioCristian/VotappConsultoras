'use strict';

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('app.services', []).
value('version', '0.1')
.factory('ConsultoraFactory',['$http','ApiEndpointFactory', function($http, ApiEndpointFactory) {
	return{
		getConsultora:function(idConsultora){
			return $http.get(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/consultoras/'+idConsultora)
		},
			
		crearEncuestador:function(encuestador){
			encuestador.password = CryptoJS.SHA256(encuestador.password).toString(CryptoJS.enc.Hex);
			
			return $http.post(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/consultoras/protected/crearEncuestador', encuestador);
		},
		actualizarCelular:function(dataUsuario){
			return $http.post(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/consultoras/protected/actualizarCelular', dataUsuario);

		},
		existeUsuario : function(username){
			return $http.post(ApiEndpointFactory.ApiEndpoint + '/Votapp/services/consultoras/protected/existeUsuario', username)
		}
	}
	
	
	
	
}])

.factory('LoginFactory', ['$http','ApiEndpointFactory', function($http, ApiEndpointFactory) {
	return{
		login:function(user){
			
			//Asi funciona la encriptacion:
			/*var objHashResult=CryptoJS.SHA256(user.password)
			var strHashResult=objHashResult.toString(CryptoJS.enc.Hex);
			console.log(strHashResult);*/
						
			var usuario = {
					password : CryptoJS.SHA256(user.password).toString(CryptoJS.enc.Hex),
					username : user.username
			}
			// Cree el objeto "usuario" para que el usuario no vea como se le cambia la contraseña a hex
			// ya que user.password esta bindeado con el <input> del password
			// y si hago user.password = CryptoJS.SHA256(user.password).toString(CryptoJS.enc.Hex)
			// el usuario lo ve x un momento
			

			return $http.post(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/usuario/loginConsultora', usuario)
		}
	}
}])

.factory('EleccionFactory', ['$http','ApiEndpointFactory', function($http, ApiEndpointFactory) {
	return{
		getEleccionesActuales:function(){
			return $http.get(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/eleccion/protected/getEleccionesActuales')
		}
	}
	
}])

.factory('EncuestaFactory', ['$http','ApiEndpointFactory', 'store','jwtHelper', function($http, ApiEndpointFactory, store, jwtHelper){
			
	return{
		crearEncuesta:function(dataEncuesta){
			return $http.post(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/encuesta/protected/crear', dataEncuesta)
		},
		
		getEncuestasFinalizadas:function(){
			var tokenConsultora = store.get('tokenConsultora');
			var decodedToken = jwtHelper.decodeToken(tokenConsultora);
			var id = decodedToken.consultoraID;
			$http.get(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/encuesta/protected/getEncuestasFinalizadasByIdConsultora/'+ id)
			.success(function(data){
				store.set('encuestasFinalizadas', data);
			})
		},
		
	}
	
}])

.factory('ApiEndpointFactory', ['$http','$location', function($http, $location) {
	
	var ApiEndpoint = $location.protocol() + "://" + $location.host() + ":" + $location.port();
	
	return{
		ApiEndpoint : ApiEndpoint
	}	
	
}])

.factory('EmergenciaFactory', ['$http', 'ApiEndpointFactory','store','jwtHelper',function($http, ApiEndpointFactory, store, jwtHelper) {
	
	var thereAEmergency = false;	
	return{
		getEmergencias : function(){
			
			var tokenConsultora = store.get('tokenConsultora');
			var decodedToken = jwtHelper.decodeToken(tokenConsultora);
			var id = decodedToken.consultoraID;
			
			$http.get(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/consultoras/protected/getAllEmergencias/'+ id)
			.success(function(data){
				store.set('emergencias', data);
			})
			.error(function(){
				console.log("ERROR");
			})
		},
	
		notificarEmergencia : function(dataEmergencia){
			return $http.post(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/consultoras/protected/notificarEmergencia', dataEmergencia)
		},
		
		thereANewEmergency : function(){
			var tokenConsultora = store.get('tokenConsultora');
			var decodedToken = jwtHelper.decodeToken(tokenConsultora);
			var id = decodedToken.consultoraID;
			
			$http.get(ApiEndpointFactory.ApiEndpoint +'/Votapp/services/consultoras/protected/thereANewEmergency/'+ id).
				then(function(response) {
					
					thereAEmergency = response.data;
					
				  }, function(response) {
					  console.log('error'+ response.data || "Request failed");
					  thereAEmergency = false;
				  });
			
		},
		
		getThereANewEmergency : function(){
			return thereAEmergency;
		},
	}	
	
}])



