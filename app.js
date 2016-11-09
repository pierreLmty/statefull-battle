var battlemind = angular.module('battlemind', []);

battlemind.controller('AppController', ['$scope', '$window', function($scope, $window) {

	$scope.page = null;
	$scope.highscores = null;
	
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
			name: null
		}

		$scope.nextQuestion();
	}
	
	$scope.nextQuestion = function(){
		//Code de sélection de la question et de ses réponses
	}
	
	$scope.selectPage('jouer');
}]);
