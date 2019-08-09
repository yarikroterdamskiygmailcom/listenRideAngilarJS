'use strict';

angular.module('listnride')
    .factory('bikeCluster', ['api', 'date', 'bikeOptions', function (api, date, bikeOptions) {
      return {
        getSizeTranslations: function (sizes) {
          bikeOptions.sizeOptions([bikeOptions.allSizesValue]).then(function (resolve) {
            _.map(sizes, function (option) {
              option.name = _.find(resolve, function (o) {
                return o.value === option.size;
              }).label;
            });
          });
        },

        getVariationKey({size, frame_size}){
          return size + (frame_size ? '|' + frame_size : '');
        },

        groupBikeVariations(variations) {
          let variationOptions = {};

          _.forEach(variations, (clusterVariant) => {
            let variationGroupingKey = this.getVariationKey({
              size: clusterVariant.size,
              frame_size: clusterVariant.frame_size
            });

            variationOptions[variationGroupingKey] = {
              bike_ids: [
                ...(variationOptions[variationGroupingKey] ? variationOptions[variationGroupingKey].bike_ids : []),
                clusterVariant.id
              ],
              size: clusterVariant.size,
              frame_size: clusterVariant.frame_size,
              label: `
                ${bikeOptions.getHumanReadableSize(clusterVariant.size)}
                ${clusterVariant.frame_size ? ' | ' + clusterVariant.frame_size : '' }
              `
            }
          });

          return variationOptions;
        },

        transformBikeVariationKey(variationKey) {
          variationKey = _.toString(variationKey).split('|');
          return {
            size: variationKey[0],
            frame_size: variationKey[1]
          };
        },

        getAvailableClusterBikes(clusterId, startDate, endDate) {
          let duration = moment
            .duration(date.diff(startDate, endDate))
            .as('seconds');

          return api
            .get('/clusters/' + clusterId + '?start_date=' + moment(startDate).format('YYYY-MM-DD HH:mm') + '&duration=' + duration)
            .then((response) => response.data.ride_ids);
        },

        markAvailableSizes(bikeVariations, availableBikes) {
          _.forEach(bikeVariations, function (option) {
            option.notAvailable = !_.intersection(option.bike_ids, availableBikes).length;
          });
        },

        findFirstAvailableVariantId(bikeVariations, pickedBikeVariant, availableBikeIds) {
          return _.intersection(bikeVariations[pickedBikeVariant].bike_ids, availableBikeIds)[0];
        },

        pickAvailableBikeId({
          isCluster,
          bikeId,
          bikeVariations,
          pickedBikeVariant,
          availableBikeIds
        }) {
          return isCluster ? this.findFirstAvailableVariantId(bikeVariations, pickedBikeVariant, availableBikeIds) : bikeId;
        }
      };
    }]);