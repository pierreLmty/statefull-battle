var battleMind = angular.module('battlemind', ['angular-google-gapi', 'ngCookies', 'ngRoute']);

//Avec authentification Google
//code source : https://github.com/maximepvrt/angular-google-gapi
battleMind.run(['GAuth', 'GApi', 'GData', '$cookies', '$rootScope',
	function(GAuth, GApi, GData, $cookies, $rootScope) 
	{
		var CLIENT = '318394981972-1lf9m33h1fc6hasa945ljetqnun0tfu2.apps.googleusercontent.com';
		var BASE = 'https://1-dot-statefull-battle.appspot.com/_ah/api';

		GApi.load('questionentityendpoint','v1',BASE).then(function(resp)
			{
				//Log de console, bonne liaison avec l'api
				console.log('api: ' + resp.api + ', version: ' + resp.version + ' loaded');
			}, 
			function(resp)
			{
				//Log de console, mauvaise liaison avec l'api
				console.log('an error occured during loading api: ' + resp.api + ', resp.version: ' + version);
			});
		
		GAuth.setClient(CLIENT)

		GAuth.setScope('https://www.googleapis.com/auth/userinfo.profile');
		GAuth.load();
		
		GData.setUserId($cookies.get('userId'));
		
// 		User object :
// 		user.email
// 		user.picture (url)
// 		user.id (Google id)
// 		user.name (Google account name or email if don't exist)
// 		user.link (link to Google+ page)
		
// 		Connexion au compte Google
		$rootScope.signUp = function()
			{
				GAuth.login().then(function(user) 
					{
						console.log(user.name + ' is logged in');
						$rootScope.currentUser = user;
						$cookies.put('userId', user.id);
					}, 
					function() 
					{
						console.log('Erreur de connexion');
					});
			};
			
		 $rootScope.logout = function() 
			{
				GAuth.logout().then(function () 
					{
						$rootScope.currentUser = null;
						$cookies.remove('userId');
					});
			};
				
		//Check de la connexion au compte
		GAuth.checkAuth().then(
			function (user)
			{
				console.log(user.name + ' is already logged in');
			},
			function() {
				console.log('Erreur de check connexion');
			}
		);
	}
	
//Routing : http://www.w3schools.com/angular/angular_routing.asp
]);


battleMind.controller('AppController', ['$scope', '$window', function($scope, $window) {

	$scope.page = null;
	$scope.highscores = null;
	$scope.UserName = "Visiteur";
	
	$scope.onSignIn = function(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail());
}

	
	//Sélection de la page
	$scope.selectPage = function(page){
		$scope.page = page;

		if (page == 'jouer') {
			$scope.restart();
		}
		else if (page == 'correction'){
			
		}
		else if (page == 'highscores'){
			var functionScore = function() {
						console.log("score api loaded");
						var req = gapi.client.questionentityendpoint.listScoreEntity();
						req.execute(
							function(resp) {
								$scope.scores=resp.items;
								$scope.$apply();
								console.log(resp);
							}
						);
					}
		
			gapi.client.load('questionentityendpoint', 'v1', functionScore, rootApi);
		}
	}
	
	$scope.restart = function(){

		$scope.questions = {
			answered: 0,
			well_answered: 0,
			life: 3,
			nolife: 0,
			name: null
		}

		$scope.nextQuestion();
	}
	
	$scope.nextQuestion = function(){
		//Code de sélection de la question et de ses réponses
	}
	
	//Gestion de la vie
	$scope.getLife = function(count){

		  var ratings = []; 

		  for (var i = 0; i < count; i++) { 
			ratings.push(i) 
		  } 

		  return ratings;
	}
	
	$scope.selectPage('jouer');
}]);
