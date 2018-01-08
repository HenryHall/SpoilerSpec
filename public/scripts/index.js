
var allCardsMaster;
var setSize = 249;


var myApp = angular.module('myApp', []);
myApp.controller('mainController', ['$scope', '$http', function($scope, $http){

  $scope.setSize = setSize;


  //Get spoiled card list on load
  $scope.updateMasterList();
  //FIX when server is ready
  $scope.allSpoiledCards = [];

  //Watch allSpoiledCards for changes and fill in blank entries
  $scope.$watchCollection('allSpoiledCards', (newVal, oldVal) => {
    console.log("Creating displaySpoilers...");
    $scope.displaySpoilers = [];
    for(var i=1; i<$scope.setSize+1; i++){
      var foundFlag = false;
      for(var j=0; j<newVal.length; j++){
        if (i == newVal[j].number){
          $scope.displaySpoilers.push(newVal[j]);
          foundFlag = true;
          break;
        }
      }

      if (!foundFlag){
        $scope.displaySpoilers.push({number: i});
      }
    }
    console.log($scope.displaySpoilers);
  });

  //Get card data on load
  //FIX when server is ready
  $http({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/HenryHall/SpoilerSpec/master/public/assets/AllCards.json'
  }).then((data) => {
    allCardsMaster = data.data;
    console.log(allCardsMaster);
    //Enable interaction
  });


  function updateMasterList(){

    $http({
      method: 'GET',
      url: '/getMasterList'
    }).then((data) => {
      console.log(data.data);
    });

  }


  $scope.addNewCard = function(){
    var nCardName = $scope.cardNameIn;
    var nCardNumber = $scope.collectorNumberIn;

    if (!nCardName || ! nCardNumber) {return false;}

    var nCardObject = createCardObject(nCardName);
    //Find card
    if (!nCardObject) {
      return $scope.createAlert("Danger", "New spoiler was NOT added. " + nCardName + " does not exist.");
    }

    //Check for dupe collector number
    for (var i = 0; i<$scope.allSpoiledCards.length; i++) {
      var card = $scope.allSpoiledCards[i];
      if (card.cardObject.name.toLowerCase() == nCardName.toLowerCase()){
        return $scope.createAlert("Danger", "New spoiler was NOT added. " + nCardName + " is already assigned to " + card.number + ".");
      } else if (card.number == nCardNumber){
        return $scope.createAlert("Danger", "New spoiler was NOT added. Collector number " + nCardNumber + " is already assigned to " + card.cardObject.name + ".");
      }
    };

    //Success
    //Make call to server to update the list
    //$http({});
    console.log("Adding " + nCardName);
    $scope.cardNameIn = '';
    $scope.collectorNumberIn = '';

    $scope.allSpoiledCards.push({cardObject: nCardObject, number: nCardNumber});
    console.log($scope.allSpoiledCards);
    //Sort
    $scope.allSpoiledCards.sort( (a, b) => {
      return a.number - b.number;
    });

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



  function findPossibleCards(slotNumber){

    //Stats for the known cards before and after this slot
    var limits = {
      upper: undefined,
      lower: undefined
    };

    for (var i=0; i<$scope.allSpoiledCards.length; i++){
      if($scope.allSpoiledCards[i].number < slotNumber){
        limits.lower.index = i;
      } else if (slotNumber < $scope.allSpoiledCards[i].number){
        limits.upper.index = i;
        break;
      }
    }

    //No cards entered.  Every single magic card is still possible.
    if (limits.lower.index == undefined && limits.upper.index == undefined) {return false;}

    //Determine limiting colors
    for (bound in limits){
      if(bound.index && $scope.allSpoiledCards[bound.index].cardObject.hasOwnProperty('colors')){
        //No Colors
        if($scope.allSpoiledCards[bound.index].cardObject.type.includes('Basic')){
          bound.color = "Basic Land";
        } else if ($scope.allSpoiledCards[bound.index].cardObject.type.includes('Land')){
          bound.color = "Nonbasic Land";
        } else {
          bound.color = "Colorless";
        }
      } else if ($scope.allSpoiledCards[bound.index].cardObject.colors.length > 1){
        //Multi-color
        bound.color = "Gold";
      } else {
        bound.color = $scope.allSpoiledCards[bound.index].cardObject.colors[0];
      }
    }

    return console.log(limits);

  }

}]);
// .filter('cardFilter', function(){
//   return function(input, model){
//     console.log(input[0]);
//     var output = [];
//     for (var i = 0; i<setSize; i++){
//       if(input[0].number == i){
//         output.push(input.shift());
//       } else {
//         output.push({cardObject: {name: "---------------"}, number: i});
//       }
//     }
//     return output;
//   }
// });


// function sortSpoilerCollection(spoilerArr){
//
//   var cardOrder = ["White", "Blue", "Black", "Red", "Green", "Gold", "Colorless", "Nonbasic Land", "Basic Land"];
//
//   spoilerArr.sort( (a, b) => {
//     var colorA, colorB, nameA, nameB;
//
//     nameA = a.cardObject.name;
//     nameB = b.cardObject.name;
//
//     if(!a.cardObject.hasOwnProperty('colors')){
//       //No Colors
//       if(a.cardObject.type.includes('Basic')){
//         colorA = "Basic Land";
//       } else if (a.cardObject.type.includes('Land')){
//         colorA = "Nonbasic Land";
//       } else {
//         colorA = "Colorless";
//       }
//     } else if (a.cardObject.colors.length > 1){
//       //Multi-color
//       colorA = "Gold";
//     } else {
//       colorA = a.cardObject.colors[0];
//     }
//
//     if(!b.cardObject.hasOwnProperty('colors')){
//       //No Colors
//       if(b.cardObject.type.includes('Basic')){
//         colorB = "Basic Land";
//       } else if (b.cardObject.type.includes('Land')){
//         colorB = "Nonbasic Land";
//       } else {
//         colorB = "Colorless";
//       }
//     } else if (b.cardObject.colors.length > 1){
//       //Multi-color
//       colorB = "Gold";
//     } else {
//       colorB = b.cardObject.colors[0];
//     }
//
//     //a is before b = 1
//     //b is before a = -1
//     if(cardOrder.indexOf(colorsA) > cardOrder.indexOf(colorsB)){
//       return 1;
//     } else if (cardOrder.indexOf(colorsA) < cardOrder.indexOf(colorsB)){
//       return -1;
//     } else {
//       //Same colorOrder
//       if(nameA > nameB){
//         return 1;
//       } else {
//         return -1;
//       }
//     }
//   });
//
//   return spoilerArr;
//
// }


function createCardObject(nCardName){
  return allCardsMaster[nCardName] ? allCardsMaster[nCardName] : false;
}
