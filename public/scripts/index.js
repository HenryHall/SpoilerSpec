
var myApp = angular.module('myApp', []);


myApp.controller('mainController', ['$scope', '$http', function($scope, $http){


  //Get spoiled card list on load
  //FIX when server is ready
  $scope.allSpoiledCards = [];

  //Get card data on load
  //FIX when server is ready
  var allCardsMaster;
  $http({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/HenryHall/SpoilerSpec/master/public/assets/AllCards.json'
  }).then((data) => {
    allCardsMaster = data.data;
    console.log(allCardsMaster);
    //Enable interaction
  });




  $scope.addNewCard = function(){
    console.log("Here");
    var nCardName = $scope.cardNameIn;
    var nCardNumber = $scope.collectorNumberIn;

    if (!nCardName || ! nCardNumber) {return false;}

    for (var i = 0; i<$scope.allSpoiledCards.length; i++) {
      console.log("Here2");
      //Reject
      var card = $scope.allSpoiledCards[i];
      console.log(card, nCardName, nCardNumber);
      if (card.name == nCardName){
        $scope.createAlert("Danger", "New spoiler was NOT added. " + nCardName + " is already in the database.");
        return false;
      } else if (card.number == nCardNumber){
        $scope.createAlert("Danger", "New spoiler was NOT added. " + nCardNumber + " is already assigned to " + card.name + ".");
        return false;
      }
    };

    //Success
    //Make call to server to update the list
    //$http({});
    $scope.cardNameIn = '';
    $scope.collectorNumberIn = '';
    $scope.allSpoiledCards.push({name: nCardName, number: nCardNumber});
    //Maybe sort now?  Sort before insert?
    $scope.createAlert("Success", "New spoiler, " + nCardName + ", has been added.");

  };


  $scope.createAlert = function(type, message){
    var typeClass = "alert ";
    if (!message) {throw new Error("Alert not created.  No message was passed.");}

    switch (type.toLowerCase()) {
      case "success":
        typeClass += "alert-success"
        break;
      case "info":
        typeClass += "alert-info"
        break;
      case "warning":
        typeClass += "alert-warning"
        break;
      case "danger":
        typeClass += "alert-danger"
        break;
      default:
        throw new Error("Alert not created.  Invalid or no type specified.");
    }

    var addCardAlertEl = document.getElementById('addCardAlert');
    addCardAlertEl.style.display = "block";
    addCardAlertEl.classList = typeClass;
    $scope.alertMessage = message;

    return true;
  };


  $scope.hideAlert = function(){
    document.getElementById('addCardAlert').style.display = "none";
  };

}]);


function sortSpoilerCollection(spoilerArr){




}
