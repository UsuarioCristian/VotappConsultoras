'use strict';

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('app.services', []).
value('version', '0.1')
.factory('ConsultoraFactory',['$http', function($http) {
	return{
		getConsultora:function(idConsultora){
			return $http.get('http://localhost:8080/Votapp/services/consultoras/'+idConsultora)
		},
			
		crearEncuestador:function(encuestador){
			encuestador.password = CryptoJS.SHA256(encuestador.password).toString(CryptoJS.enc.Hex);
			
			return $http.post('http://localhost:8080/Votapp/services/consultoras/protected/crearEncuestador', encuestador);
		}
	}
	
	
	
	
}])

.factory('LoginFactory', ['$http',function($http) {
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
			

			return $http.post('http://localhost:8080/Votapp/services/usuario/loginConsultora', usuario)
		}
	}
}])

.factory('EleccionFactory', ['$http',function($http) {
	return{
		getEleccionesActuales:function(){
			return $http.get('http://localhost:8080/Votapp/services/eleccion/protected/getEleccionesActuales')
		}
	}
	
}])

.factory('EncuestaFactory', ['$http',function($http) {
	return{
		crearEncuesta:function(dataEncuesta){
			return $http.post('http://localhost:8080/Votapp/services/encuesta/protected/crear', dataEncuesta)
		}
	}
	
}])

