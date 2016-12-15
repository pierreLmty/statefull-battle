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

battleMind.controller('GameCtrl', ['$rootScope', '$scope', '$location', '$timeout', 'GApi',
	function($rootScope, $scope, $location, $timeout, GApi)
	{
		if (!$scope.currentUser) 
		{
			$location.path('/');
		}
		
		if($rootScope.infos.answered != 0)
		{
			$rootScope.infos = {
				answered: 0,
				well_answered: 0,
				life: 3,
				nolife: 0,
				highscores: 0
			}
		}
		
		$scope.nbrQuestion = -1;
		$scope.indiceQuestion = 0;
		$scope.indiceQPreT = -1;
		$scope.indiceQPreF = -1;
		$scope.afficherMaps = false;
		
		GApi.execute('questionentityendpoint', 'listQuestionEntity').then(function(resp)
			{
				console.log("Chargement des questions");
				$rootScope.questions = resp.items;
				$scope.nextQuestion();
				
			},function() 
			{
				console.log('Erreur de connexion');
			});
		
		$scope.nextQuestion = function(){
			if($scope.indiceQPreT != -1)
			{
				document.getElementById($scope.indiceQPreT).className = "btn btn-lg btn-default ng-binding";		
			}
			if($scope.indiceQPreF != -1)
			{
				document.getElementById($scope.indiceQPreF).className = "btn btn-lg btn-default ng-binding";
			}
			document.getElementById("ButtonValidMap").className = "btn btn-lg btn-default ng-binding  pull-right";
			
			$scope.nbrQuestion++;
			$scope.indiceQuestion++;
			
			$scope.currentQuestion = $rootScope.questions[$scope.nbrQuestion].question;
			
			if($rootScope.questions[$scope.nbrQuestion].type == 2) //Google Maps
			{
				$scope.afficherMaps = true;
				$scope.goodAnswer = $rootScope.questions[$scope.nbrQuestion].reponse;
				$scope.myMap();
			}
			else
			{
				$scope.afficherMaps = false;
				$scope.reponse0 = $rootScope.questions[$scope.nbrQuestion].propositions[0];
				$scope.reponse1 = $rootScope.questions[$scope.nbrQuestion].propositions[1];
				$scope.reponse2 = $rootScope.questions[$scope.nbrQuestion].propositions[2];
				$scope.reponse3 = $rootScope.questions[$scope.nbrQuestion].propositions[3];
				$scope.goodAnswer = $rootScope.questions[$scope.nbrQuestion].reponse;
			}
		};
		
		$scope.checkAnswer = function(indiceQuestion, reponse){
			
			if($rootScope.questions[$scope.nbrQuestion].type == 2)
			{
				var string = $rootScope.questions[$scope.nbrQuestion].propositions[reponse];
				var substring = indiceQuestion;
				var stringFound = (string.indexOf(substring) !== -1);
				console.log(stringFound);
			}
			
			if((indiceQuestion == reponse) || (stringFound == true))
			{
				$rootScope.infos.well_answered++;
				$rootScope.infos.answered++;
				$rootScope.infos.highscores++;
				
				if($rootScope.questions[$scope.nbrQuestion].type == 2)
				{
					document.getElementById("ButtonValidMap").className = "btn btn-lg btn-success pull-right";
					document.getElementById("map").innerHTML = "";
				}
				else
				{
					$scope.indiceQPreT = indiceQuestion;
					document.getElementById(indiceQuestion).className = "btn btn-lg btn-success";
				}
				
				if($scope.nbrQuestion < $rootScope.questions.length)
				{
					$timeout(function () {
						$scope.nextQuestion();
					}, 1200);
				}
				else
				{
					$timeout(function () {
						$location.path('/gameover');
					}, 1200);
				}
			}
			else
			{
				$rootScope.infos.life--;
				$rootScope.infos.nolife++;
				$rootScope.infos.answered++;
				
				if($rootScope.questions[$scope.nbrQuestion].type == 2)
				{
					document.getElementById("ButtonValidMap").className = "btn btn-lg btn-danger pull-right";
					document.getElementById("map").innerHTML = "";
				}
				else
				{
					$scope.indiceQPreT = reponse;
					document.getElementById(reponse).className = "btn btn-lg btn-success";
					$scope.indiceQPreF = indiceQuestion;
					document.getElementById(indiceQuestion).className = "btn btn-lg btn-danger";	
				}
				
				if($rootScope.infos.life == 0 || ($scope.nbrQuestion == $rootScope.questions.length))
				{
					$timeout(function () {
						$location.path('/gameover');
					}, 1200);
				}
				else
				{
					$timeout(function () {
						$scope.nextQuestion();
					}, 1200);
				}
			}
		};
		
		$scope.setMapPick = function(marker){
			$scope.mapMarker = marker;
			$scope.$apply();
		};
		
		$scope.myMap = function(){
			var mapCanvas = document.getElementById("map");
			var mapOptions = {
				center: new google.maps.LatLng(47.2, -1.5),
				streetViewControl: false,
				disableDefaultUI: true,
				zoom: 5
			}
			var map = new google.maps.Map(mapCanvas, mapOptions);
			
			var infowindow = new google.maps.InfoWindow();
			
			function setMarker(map,infowindow, location, fn) {
				var marker = new google.maps.Marker({
					position: location,
					map: map,
					draggable: true
					});
					
				var latLng = new google.maps.LatLng(marker.position.lat(),marker.position.lng());
				infowindow.open(map,marker);
				
				geocoderLatLng(map,infowindow,latLng);

				google.maps.event.addListener(marker,'dragend', function(event){
					latLng = new google.maps.LatLng(marker.position.lat(),marker.position.lng());
					geocoderLatLng(map,infowindow,latLng);
					});
			};
			
			function geocoderLatLng(map, infowindow,latLng) {
				var geocoder = new google.maps.Geocoder;
				geocoder.geocode({'location':latLng}, function(results, status){
					if(status === google.maps.GeocoderStatus.OK) {
						if (results[1]){
						var i = 0;
						while(results[1].address_components[i].types[0] != "country"){
							i++;
						}
						var country = results[1].address_components[i].long_name;
						infowindow.setContent(country);
						$scope.countryAnswer = country;
						$scope.setMapPick(country);
						}
						else
						{
						console.error('Pas de résultat trouvé');
						infowindow.setContent("");
						$scope.setMapPick(null);
						}
					}
					else
					{
						console.error('Geocoder failed due to: ' + status);
						infowindow.setContent("");
						$scope.setMapPick(null);
					}
				});
			};
			
			
			
			
			google.maps.event.addListenerOnce(map, 'click', function(event){
				setMarker(map, infowindow, event.latLng);
				});
			};
		
		//Gestion de la vie
		$scope.getLife = function(count){
			var ratings = []; 

			for (var i = 0; i < count; i++) { 
				ratings.push(i) 
			} 
			return ratings;
		};
	}
]);

battleMind.controller('GameoverCtrl', ['$rootScope', '$scope', '$location', 'GApi',
	function($rootScope, $scope, $location, GApi)
	{
		if (!$scope.currentUser || ($rootScope.infos.life != 0)) 
		{
			$location.path('/');
		}
		
		$scope.niceScore = 0;
		$scope.tabRep = [];
		
		GApi.execute('questionentityendpoint', 'listScoreEntity').then(function(resp)
			{
				console.log("Chargement des scores");
				$scope.copyQuestions();
				$scope.score = resp.items;
				
				//Tri du tableau en ordre décroissant
				$scope.score.sort(function(a, b){
					return parseFloat(b.score) - parseFloat(a.score);
				});
				
				$scope.setScore($rootScope.infos.highscores);
			},function() 
			{
				console.log('Erreur de connexion');
			});
			//Si le score du joueur est plus grand que le tab[10] alors afficher un message de félicitation
			
			//on insert le score qu'importe le score du  joueur
		$scope.setScore = function(score){
			
			if(score == 0)
			{
				$scope.niceScore = -2;
			}
			else if($scope.score.length < 10 || (score > $scope.score[10].score))
			{
				$scope.niceScore = 1;
				$scope.insertScore(score);
			}
			else
			{
				$scope.niceScore = -1;
				$scope.insertScore(score);
			}
		}
		
		$scope.insertScore = function(score){
			//id : 
			GApi.execute('questionentityendpoint', 'insertScoreEntity', {name : $rootScope.currentUser.name, score : score}).then(function(resp)
				{
					console.log("Insertion réalisée");
				},function() 
				{
					console.log('Erreur d\'insertion du score');
				});
		}
		
		$scope.copyQuestions = function(){
			for (i = 0; i < $rootScope.infos.answered; i++) {
				$scope.tabRep.push({question: $rootScope.questions[i].question, reponse: $rootScope.questions[i].propositions[$rootScope.questions[i].reponse]});
			}
			console.log($scope.tabRep);
		};
		
		$scope.restart = function(){
	
			$rootScope.infos = {
				answered: 0,
				well_answered: 0,
				life: 3,
				nolife: 0,
				highscores: 0
			}
	
			$location.path('/game');
		};
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