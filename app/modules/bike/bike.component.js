'use strict';

angular.module('bike').component('bike', {
  templateUrl: 'modules/bike/bike.template.html',
  controllerAs: 'bike',
  controller: ['api',
    function BikeController(api) {
      var bike = this;

      api.get('/rides/1').then(function success() {
        console.log("Successfully retrieved User");
      }, function error() {
        console.log("Error retrieving User");
      })
    }
  ]
});