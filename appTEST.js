// Code goes here

var app=angular.module('highscore',[]).controller('HsController', ['$scope','$window',
  function($scope, $window) {
    
    $scope.hello="yo men";
    $scope.scores;
    
    $scope.insertion =  function()
    { // voir une recuperation de ses parametre avec https://docs.angularjs.org/guide/forms
      gapi.client.questionentityendpoint.insertScoreEntity({
                                                            'id':'idrandom156'
                                                            ,'name':'tatatata'
                                                            ,'score':'50'
                                                          }).execute();
    }
    ;
    
    
    // little hack to be sure that apis.google.com/js/client.js is loaded
    // before calling
    // onload -> init() -> window.init() -> then here
    $window.init = function() {
      console.log("windowinit called");
      var rootApi = 'HTTPS://1-dot-statefull-battle.appspot.com/_ah/api/';
      console.log("Loading API");
      gapi.client.load('questionentityendpoint', 'v1', function()
      {
        console.log("score api loaded");
        gapi.client.questionentityendpoint.listScoreEntity().execute(
          function(resp) {
            $scope.scores=resp.items;
            $scope.$apply();
            console.log(resp);
          }
        );
      }
      , rootApi);
    }
  }
]);

