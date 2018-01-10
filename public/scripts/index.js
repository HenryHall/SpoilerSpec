
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

    console.log("Adding: ", nCardNumber, nCardName);

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



  $scope.findPossibleCards = function($event, slotNumber){

    setActive($event.currentTarget);

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
    for (card in allCardsMaster){
      iCardOrder = determineOrder(allCardsMaster[card]);
      console.log(card, iCardOrder);
      //Check order key
      if(cardOrderKey.indexOf(iCardOrder) >= cardOrderKey.indexOf(limits.lower.order)  && cardOrderKey.indexOf(iCardOrder) <= cardOrderKey.indexOf(limits.upper.order)){
        //Check alphabetical
        if(allCardsMaster[card].name > limits.lower.cardname && allCardsMaster[card].name < limits.upper.cardname){
          outputList.push({cardname: allCardsMaster[card].name});
        }
      }
    };

    console.log(outputList);
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


function setActive(elem){
  var currentActive = document.getElementsByClassName('info')[0];
  currentActive ? currentActive.classList.remove('info') : console.log('No class is currently "info".');
  return elem.parentNode.classList.add('info');
}


function determineOrder(cardObject){
  if(!cardObject.hasOwnProperty('colors')){
    //No Colors
    if(cardObject.type.includes('Basic')){
      return "Basic Land";
    } else if (cardObject.type.includes('Land')){
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
