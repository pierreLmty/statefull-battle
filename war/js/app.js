var battleMind = angular.module('battlemind', ['angular-google-gapi', 'ngCookies', 'ngRoute', 'ngSanitize']);

//Avec authentification Google
//code source : https://github.com/maximepvrt/angular-google-gapi
battleMind.run(['GAuth', 'GApi', 'GData', '$cookies', '$rootScope', '$location',
	function(GAuth, GApi, GData, $cookies, $rootScope, $location) 
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
		
		if ($cookies.get("userId")) {
			GData.setUserId($cookies.get('userId'));
			
//	 		Check de la connexion au compte
			GAuth.checkAuth().then(
				function (user)
				{
					$rootScope.currentUser = user;
					console.log(user.name + ' is already logged in');
				},
				function() {
					console.log('Erreur de check connexion');
				}
			)
		}
		
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
						$location.path('/game');						
					}, 
					function() 
					{
						console.log('Erreur de connexion');
					});
			};
			
		 $rootScope.logout = function() 
			{
				GAuth.logout();
				$rootScope.currentUser = null;
				$cookies.remove('userId');
				$location.path('/homepage');
			};
	}
]);

//Routing : http://www.w3schools.com/angular/angular_routing.asp
battleMind.config(function($routeProvider) 
	{
		$routeProvider
		.when("/", {
			templateUrl: "partials/homepage.html"
		})                    
		.when("/game", {      
			templateUrl: "partials/game.html"
		})                    
		.when("/gameover", {  
			templateUrl: "partials/gameover.html"
		})                    
		.when("/highscores", {
			templateUrl: "partials/highscores.html"
		})
		.otherwise({redirectTo: "/"})
	}
);

battleMind.controller('AppController', ['$rootScope', '$scope', '$location', 'GApi',
	function($rootScope, $scope, $location, GApi) 
	{
		$scope.infos = {
				answered: 0,
				well_answered: 0,
				life: 3,
				nolife: 0,
				highscores: 0
			}
		
		GApi.execute('questionentityendpoint', 'questionentityendpoint.listQuestionEntity').then(function(resp)
			{
				console.log("Chargement"); //TODO
			},function() 
			{
				console.log('Erreur de connexion');
			});
		
	// 	$scope.restart = function(){
	// 
	// 		$scope.questions = {
	// 			answered: 0,
	// 			well_answered: 0,
	// 			life: 3,
	// 			nolife: 0,
	// 			name: null
	// 		}
	// 
	// 		$scope.nextQuestion();
	// 	}
		
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
	}
]);