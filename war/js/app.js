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
				console.log('api: ' + resp.api + ', version: ' + resp.version + ' loaded');
			}, 
			function(resp)
			{
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
					console.log('Erreur de connexion');
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
				console.log('Déconnexion');
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
			templateUrl: "partials/homepage.html",
			controller: "HomepageCtrl"
		})
		.when("/admin", {
			templateUrl: "partials/admin.html",
			controller: "AdminCtrl"
		})
		.when("/game", {      
			templateUrl: "partials/game.html",
			controller: "GameCtrl"
		})                    
		.when("/gameover", {  
			templateUrl: "partials/gameover.html",
			controller: "GameoverCtrl"
		})                    
		.when("/highscores", {
			templateUrl: "partials/highscores.html",
			controller: "HighscoresCtrl"
		})
		.otherwise({redirectTo: "/"})
	}
);

battleMind.controller('HomepageCtrl', ['$rootScope', 
	function($rootScope) 
	{
		$rootScope.infos = {
				answered: 0,
				well_answered: 0,
				life: 3,
				nolife: 0,
				highscores: 0
			}
	}
]);

battleMind.controller('AdminCtrl', ['$rootScope', '$scope', '$location', 'GApi',
	function($rootScope, $scope, $location,  GApi)
	{
		if (!$scope.currentUser) 
		{
			$location.path('/');
		}
		
		$scope.checkLoad = 0;
		GApi.execute('questionentityendpoint', 'addQuestions').then(function(resp)
			{
				$scope.checkLoad = 1;
				console.log("Chargement des questions fait");
				
			},function() 
			{
				$scope.checkLoad = -1;
				console.log('Erreur de chargement des questions');
			});
		console.log("Fin de chargement");
		
		$scope.restart = function(){
	
			$rootScope.infos = {
				answered: 0,
				well_answered: 0,
				life: 3,
				nolife: 0,
				highscores: 0
			}
			
			$location.path('/game');
		}
	}
]);

battleMind.controller('GameCtrl', ['$rootScope', '$scope' , '$location', 'GApi',
	function($rootScope, $scope, $location, GApi)
	{
		if (!$scope.currentUser) 
		{
			$location.path('/');
		}
		
		GApi.execute('questionentityendpoint', 'listQuestionEntity').then(function(resp)
			{
				console.log("Chargement des questions");
				$scope.questions = resp.items;
				console.log($scope.questions[0].question);
				
			},function() 
			{
				console.log('Erreur de connexion');
			});
		
		$scope.nextQuestion = function(){
			//Code de sélection de la question et de ses réponses
				
		}
		
		$scope.setScore = function(){
// 		GApi.execute('questionentityendpoint', 'insertScoreEntity', {}).then(function(resp)
// 			{
// 				console.log("Chargement");
// 			},function() 
// 			{
// 				console.log('Erreur de connexion');
// 			});
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

battleMind.controller('GameoverCtrl', ['$rootScope', '$scope', '$location',
	function($rootScope, $scope, $location)
	{
		if (!$scope.currentUser) 
		{
			$location.path('/');
		}
		
		$scope.restart = function(){
	
			$rootScope.infos = {
				answered: 0,
				well_answered: 0,
				life: 3,
				nolife: 0,
				highscores: 0
			}
	
			$location.path('/game');
		}
	}
]);

battleMind.controller('HighscoresCtrl', ['GApi',
	function(GApi)
	{
// 		GApi.execute('questionentityendpoint', 'questionentityendpoint.listScoreEntity').then(function(resp)
// 			{
// 				console.log("Chargement");
// 			},function() 
// 			{
// 				console.log('Erreur de connexion');
// 			});
	}
]);