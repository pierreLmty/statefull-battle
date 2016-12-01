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
		
		$scope.nbrQuestion = -1;
		$scope.indiceQuestion = 0;
		
		GApi.execute('questionentityendpoint', 'listQuestionEntity').then(function(resp)
			{
				console.log("Chargement des questions");
				$scope.questions = resp.items;
// 				console.log($scope.questions.length);
				$scope.nextQuestion();
				
			},function() 
			{
				console.log('Erreur de connexion');
			});
		
		$scope.nextQuestion = function(){
			$scope.nbrQuestion++;
			$scope.indiceQuestion++;
			
			$scope.currentQuestion = $scope.questions[$scope.nbrQuestion].question;
			$scope.reponse0 = $scope.questions[$scope.nbrQuestion].propositions[0];
			$scope.reponse1 = $scope.questions[$scope.nbrQuestion].propositions[1];
			$scope.reponse2 = $scope.questions[$scope.nbrQuestion].propositions[2];
			$scope.reponse3 = $scope.questions[$scope.nbrQuestion].propositions[3];
			$scope.goodAnswer = $scope.questions[$scope.nbrQuestion].reponse;
			//Code de sélection de la question et de ses réponses
			//Avec nbrQuestion, on cherche dans le tableau questions
			//Dans le HTML il y a des {{}} pour le numéro de la Q, la Q et des boutons avec des {{}} pour les réponses
			//Si possible dans les boutons, mettre l'indice de la question dans le bouton qui lance le checkrep(indiceQuestion)
		}
		
		$scope.checkAnswer = function(indiceQuestion, reponse){
			if(indiceQuestion == reponse)
			{
				$rootScope.infos.well_answered++;
				$rootScope.infos.answered++;
				$rootScope.infos.highscores++;
				if($scope.nbrQuestion < $scope.questions.length)
				{
					$scope.nextQuestion();
				}
				else
				{
// 					$scope.setScore($rootScope.infos.highscores);
					$location.path('/gameover');
				}
			}
			else
			{
				$rootScope.infos.life--;
				$rootScope.infos.nolife++;
				$rootScope.infos.answered++;
				if($rootScope.infos.life == 0 || ($scope.nbrQuestion == $scope.questions.length))
				{
// 					$scope.setScore($rootScope.infos.highscores);
					$location.path('/gameover');
				}
				else
				{
					$scope.nextQuestion();
				}
			}
		}
		
		$scope.setScore = function(score){
			GApi.execute('questionentityendpoint', 'getScoreEntity').then(function(resp)
				{
					console.log("Chargement des scores");
					$score.score = resp.items;
				},function() 
				{
					console.log('Erreur de connexion');
				});

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

battleMind.controller('HighscoresCtrl', ['$scope', 'GApi',
	function($scope, GApi)
	{
		GApi.execute('questionentityendpoint', 'listScoreEntity').then(function(resp)
			{
				console.log("Chargement des highScores");
				$scope.tabHighScore = resp.items;
				
			},function() 
			{
				console.log('Erreur de connexion');
			});
		console.log($scope.tabHighScore);
	}
]);