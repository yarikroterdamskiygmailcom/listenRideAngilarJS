'use strict';

angular.module('listings').component('listings', {
  templateUrl: 'app/modules/listings/listings.template.html',
  controllerAs: 'listings',
  controller: ['$localStorage', 'api',
    function ListingsController($localStorage, api) {
      var listings = this;

      api.get('/users/' + $localStorage.userId + "/rides").then(
        function(response) {
          console.log(response.data);
          listings.bikes = response.data;
        },
        function(error) {
          console.log("Error retrieving User", error);
        }
      );

      listings.removeBike = function(bikeId) {
        listings.bikes = listings.bikes.filter(function(bike) {
          return bike.id != bikeId;
        })
      };  
    }
  ]
});