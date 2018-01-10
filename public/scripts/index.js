
var allCardsMaster;
var setSize = 249;


var myApp = angular.module('myApp', []);
myApp.controller('mainController', ['$scope', '$http', function($scope, $http){

  $scope.setSize = setSize;

  //Initialize
  $scope.allSpoiledCards = [];
  $scope.spoiledCount = 0;

  $scope.$watch('allSpoiledCards', function(newVal, oldVal){
    var spCount = 0;
    newVal.forEach((card) => {
      if (card.status == 'spoiled'){spCount++;}
    });
    $scope.spoiledCount = spCount;
  });

  //Run on load
  init();


  function init(){
    //Should this be hosted and used server side??
    $http({
      method: 'GET',
      url: 'https://raw.githubusercontent.com/HenryHall/SpoilerSpec/master/public/assets/AllCards.json'
    }).then((data) => {
      allCardsMaster = data.data;
      console.log(allCardsMaster);
      //Enable interaction
    });

    //Get spoiled card list
    getMasterList();
  }


  function getMasterList(){

    $http({
      method: 'GET',
      url: '/getMasterList'
    }).then((data) => {
      console.log(data.data);
      $scope.allSpoiledCards = data.data;
    });

  }


  $scope.addNewCard = function(){
    var nCardName = $scope.cardNameIn;
    var nCardNumber = $scope.collectorNumberIn;

    if (!nCardName || !nCardNumber) {return false;}

    //This validation should really be done server side...
    //Find card
    var nCardObject = createCardObject(nCardName);
    if (!nCardObject) {
      return $scope.createAlert("Danger", "New spoiler was NOT added. " + nCardName + " does not exist.");
    }

    //Check for dupe collector number
    // for (var i = 0; i<$scope.allSpoiledCards.length; i++) {
    //   var card = $scope.allSpoiledCards[i];
    //   if (card.cardObject.name.toLowerCase() == nCardName.toLowerCase()){
    //     return $scope.createAlert("Danger", "New spoiler was NOT added. " + nCardName + " is already assigned to " + card.number + ".");
    //   } else if (card.number == nCardNumber){
    //     return $scope.createAlert("Danger", "New spoiler was NOT added. Collector number " + nCardNumber + " is already assigned to " + card.cardObject.name + ".");
    //   }
    // };


    console.log("Adding " + nCardName);
    $scope.cardNameIn = '';
    $scope.collectorNumberIn = '';


    $http({
      method: 'PUT',
      data: {number: nCardNumber, name: nCardName},
      url: '/updateMasterList'
    }).then((data) => {
      console.log(data.data);
      $scope.allSpoiledCards = data.data;
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



  $scope.findPossibleCards = function(slotNumber){

    console.log("Looking for cards near collector number: ", slotNumber);
    //Stats for the known cards before and after this slot
    var limits = {
      upper: undefined,
      lower: undefined
    };

    var min = 0;
    var max = setSize + 1;
    //For each card, if it has a name and met bound conditions...
    $scope.allSpoiledCards.forEach((card, i, arr) => {
      if (card.cardname && card.collectornum > min && card.collectornum < slotNumber){
        min = card.collectornum;
        limits.lower = arr[i];
      } else if (card.cardname && card.collectornum < max && card.collectornum > slotNumber){
        max = card.collectornum;
        limits.upper = arr[i];
      }
    });


    //No cards entered.  Every single magic card is still possible.
    if (limits.lower == undefined && limits.upper == undefined) {return false;}


    //Determine limiting colors
    for (bound in limits){
      //If no spoiled card was bounding, set order and continue
      if(limits[bound] == undefined){
        bound == upper ? limits[bound].order = "Basic Land" : limits[bound].order = "White";
        continue;
      }

      limits[bound].cardObject = createCardObject(limits[bound].cardname);
      limits[bound].order = determineOrder(limits[bound].cardObject);

    }

    console.log(limits);

    //Find all Cards
    var outputList = [];
    var cardOrderKey = ["White", "Blue", "Black", "Red", "Green", "Gold", "Colorless", "Nonbasic Land", "Basic Land"];
    allCardsMaster.forEach((card) => {
      iCardOrder = determineOrder(card);
      //Check order key
      if(cardOrderKey.indexOf(iCardOrder) >= cardOrderKey.indexOf(limits.lower.order)  && cardOrderKey.indexOf(iCardOrder) <= cardOrderKey.indexOf(limits.upper.order)){
        //Check alphabetical
        if(card.name > limits.lower.cardname && card.name < limits.upper.cardname){
          outputList.push({cardname: card.name});
        }
      }
    });

    return $scope.possibleCards = outputList;

  }

}]);
// .filter('cardFilter', function(){
//   return function(input, model){
//
//     input = input || '';
//     var output = [];
//     var maxCount = 0;
//
//     //Only filter after at least 2 characters have been entered
//     if (model && model.length > 1){
//
//       //Search for matches starting at index 0 first
//       for (var i=0; i<input.length; i++){
//         if (input[i].toLowerCase().indexOf(model.toLowerCase()) == 0 && output.indexOf(input[i]) == -1){
//           output.push(input[i]);
//           maxCount++;
//           if (maxCount == 10){return output;}
//         }
//       }
//
//       //Then search at any index
//       for (var i=0; i<input.length; i++){
//         if (input[i].toLowerCase().indexOf(model.toLowerCase()) !== -1 && output.indexOf(input[i]) == -1){
//           output.push(input[i]);
//           maxCount++;
//           if (maxCount == 10){return output;}
//         }
//       }
//
//     }
//
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

function determineOrder(cardObject){
  if(cardObject.hasOwnProperty('colors')){
    //No Colors
    if(cardObject.type.includes('Basic')){
      return "Basic Land";
    } else if (lcardObject.type.includes('Land')){
      return "Nonbasic Land";
    } else {
      return "Colorless";
    }
  } else if (cardObject.colors.length > 1){
    //Multi-color
    return "Gold";
  } else {
    //Mono-color, pick first and only
    return cardObject.colors[0];
  }
}


function createCardObject(nCardName){
  return allCardsMaster[nCardName] ? allCardsMaster[nCardName] : false;
}
