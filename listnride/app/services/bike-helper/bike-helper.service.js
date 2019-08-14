'use strict';

angular.module('listnride')
  .factory('bikeHelper', function (api) {

    let getBikeEditUrl = bike => bike.is_cluster ? '/clusters/' + bike.cluster_id + '/update_rides/' : '/rides/' + bike.id;

    let changeBikeAvailableTo = (bike, changeTo) => {
      let data = {
        "ride": {
          "id": bike.id,
          "available": changeTo
        }
      }
      return api.put(getBikeEditUrl(bike), data);
    }

    let createBikeAvailability = ({id, isCluster, data}) => {
      let availabilityUrl = (isCluster ? '/clusters/' : '/rides/') + id + '/availabilities';

      return api.post(availabilityUrl, data);
    }

    return {
      changeBikeAvailableTo,
      getBikeEditUrl,
      createBikeAvailability
    };
  });
