var battlemind = angular.module('battlemind', ['angular-google-gapi']);

battlemind.controller('AppController', ['$scope', 'GApi', function($scope, GApi) {

	$scope.page = null;
	$scope.highscores = null;
	
	$scope.selectPage = function(page){
		$scope.page = page;

		if (page == 'jouer') {
			$scope.restart();
		}
		else if (page == 'correction'){
			
		}
		else if (page == 'highscores'){
			
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