var battlemind = angular.module('battlemind', []);

battlemind.controller('AppController', ['$scope', '$window', function($scope, $window) {

	$scope.page = null;
	$scope.highscores = null;
	$scope.UserName = "Visiteur";
	
	var rootApi = 'https://1-dot-statefull-battle.appspot.com/_ah/api/';
	
	//initialisation de la liaison entre l'api et l'interface
	$window.init = function() {
		console.log("windowinit called");
		
		console.log("Chargement de l'API");
		
		var functionLoadQuestion = function() {
						console.log("Chargement des questions et des réponses");
						var req = gapi.client.questionentityendpoint.listQuestionEntity();
						req.execute(
							function(resp) {
								$scope.listQuestions = resp.items;
								$scope.$apply();
								console.log(resp);
							}
						);
					}
					
		gapi.client.load('questionentityendpoint', 'v1', functionLoadQuestion, rootApi);
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
	
	//Gestion de la connexion au compte Google
	$scope.signUp = function(googleUser){
		console.log("Auth Google");
		var profile = googleUser.getBasicProfile();
		console.log('ID: ' + profile.getId());
		console.log('Name: ' + profile.getName());
		console.log('Email: ' + profile.getEmail());
	}
	
	//Gestion de la déconnexion du compte Google
	$scope.signOut = function(){
		
	}
	
	$scope.majConnexion = function (name){	 
		console.log("Methode : majConnexion");
		$scope.connecte = !$scope.connecte;
		if($scope.connecte){
			$scope.accueil = false;
		}
		else {
			$scope.accueil = true;
			$scope.affichageVote = true;
			$scope.affichageFin = true;
			$scope.partieVote = true;			
			$scope.affichageResultat = true;
		}
		$scope.UserName = name;
	}
	
	$scope.selectPage('jouer');
}]);
