'use strict';


/*
Structure of bike search component:

Search
      |__Filter
      |__Cardgrid
                 |__Sorter
*/

angular.module('search',[]).component('search', {
  templateUrl: 'app/modules/search/search.template.html',
  controllerAs: 'search',
  bindings: {
    location: '<'
  },
  controller: ['$translate', '$stateParams','$state', '$timeout', 'NgMap', 'ngMeta', 'api',
    function SearchController($translate, $stateParams, $state, $timeout, NgMap, ngMeta, api) {
      var search = this;
      search.$onInit = function() {
        // methods
        search.location = $stateParams.location;
        search.showBikeWindow = showBikeWindow;
        search.placeChanged = placeChanged;
        search.onCategoryChange = onCategoryChange;
        search.onMapClick = onMapClick;
        search.onBikeHover = onBikeHover;
        search.populateBikes = populateBikes;
        search.addMoreItemsLimit = addMoreItemsLimit;
        search.onDateChange = onDateChange;
        search.filteredBikes = [];
        search.filteredDateBikes = [];
        search.mapMarkers = [];
        search.noResult = true;
        search.initialValues = {
          amount: '',
          sizes: [],
          categories: [],
          brand: '',
          date: {
            "start_date": '',
            "duration": ''
          }
        };
        search.mapStyles = [
          {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#6195a0"
              }
            ]
          },
          {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#f5f5f2"
              },
              {
                "saturation": "0"
              },
              {
                "lightness": "0"
              },
              {
                "gamma": "1"
              }
            ]
          },
          {
            "featureType": "landscape.man_made",
            "stylers": [
              {
                "lightness": "-3"
              },
              {
                "gamma": "1.00"
              }
            ]
          },
          {
            "featureType": "landscape.natural.terrain",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#bae5ce"
              },
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "road",
            "stylers": [
              {
                "saturation": -100
              },
              {
                "lightness": 45
              },
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#787878"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#fac9a9"
              },
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text",
            "stylers": [
              {
                "color": "#4e4e4e"
              }
            ]
          },
          {
            "featureType": "transit",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "transit.station.airport",
            "elementType": "labels.icon",
            "stylers": [
              {
                "hue": "#0a00ff"
              },
              {
                "saturation": "-77"
              },
              {
                "lightness": "0"
              },
              {
                "gamma": "0.57"
              }
            ]
          },
          {
            "featureType": "transit.station.rail",
            "elementType": "labels.icon",
            "stylers": [
              {
                "hue": "#ff6c00"
              },
              {
                "saturation": "-68"
              },
              {
                "lightness": "4"
              },
              {
                "gamma": "0.75"
              }
            ]
          },
          {
            "featureType": "transit.station.rail",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#43321e"
              }
            ]
          },
          {
            "featureType": "water",
            "stylers": [
              {
                "color": "#eaf6f8"
              },
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#c7eced"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "saturation": "-53"
              },
              {
                "lightness": "-49"
              },
              {
                "gamma": "0.79"
              }
            ]
          }
        ];

        // get initial filter values from url
        search.initialValues.sizes = $stateParams.sizes.split(',');
        search.initialValues.brand = $stateParams.brand;
        search.initialValues.categories = $stateParams.categories.split(',');
        search.initialValues.date = {
          "start_date": $stateParams.start_date,
          "duration": $stateParams.duration
        };

        search.limit = 15;
        search.mapOptions = {
          lat: 40,
          lng: -74,
          zoom: 5
        };

        // invocations
        populateBikes(search.location);
        setMetaTags(search.location);
      };

      search.updateState = function(params, cb) {
        $state.go(
          $state.current,
          params,
          { notify: false }
        ).then(function(){
          $timeout(function () {
            refreshMarkerCluster(search.map);
          },0);
          if (typeof cb === "function") cb();
        });
      };

      function onMapClick () {
        if (search.map) {
          search.map.hideInfoWindow('searchMapWindow');
          search.selectedBike = undefined;
        }
      }

      function showBikeWindow(evt, bikeId) {
        if (search.map) {
          search.selectedBike = search.bikes.find(function(bike) {
            return bike.id === bikeId;
          });

          search.map.showInfoWindow('searchMapWindow', this);
        }
      }

      function placeChanged(place) {
        var location = place.formatted_address || place.name;
        $state.go(
          // current state
          $state.current,
          // state params
          { location: location },
          // route options
          // do not remove inherit prop, else map tiles stop working
          { notify: false }
        );
        search.location = location;
        setMetaTags(location);
        populateBikes(location);
      }

      function onCategoryChange(category) {
        var categoryMap = {};
        categoryMap[category] = search.categoryFilter[category];
        $state.go(
          // current state
          $state.current,
          // state params
          categoryMap,
          // route options
          // do not remove inherit prop, else map tiles stop working
          { notify: false }
        );
      }

      function populateBikes(location) {
        search.bikes = undefined;
        search.noResult = false;
        location = location ? location : $stateParams.location;

        var urlRequest = "/rides?location=" + location;

        api.get(urlRequest).then(function(response) {
          setParamsFromResponse(response);
          return getUnavailableBikes();
        }).then(function(results) {
          if (!!results) {
            search.unavailableIds = results.data.ids;
            setUnavailableBikes();
          }
          search.noResult = search.bikes !== undefined && search.bikes.length === 0
        },
        function (error) {
          search.noResult = true;
        });
      }

      function getUnavailableBikes() {
        var urlRequest = "start_date=" + $stateParams.start_date;
        urlRequest += "&duration=" + $stateParams.duration;

        if (!$stateParams.start_date && !$stateParams.duration) {
          return false;
        } else {
          return api.get('/rides/unavailable?' + urlRequest);
        }
      }

      function setParamsFromResponse(response) {
        search.bikes = response.data.bikes;
        search.filteredDateBikes = search.bikes.slice();
        search.categorizedFilteredBikes = [{
          title: "All Bikes",
          bikes: search.bikes
        }];
        search.titles = [];
        // Google
        search.latLng = response.data.location.geometry.location;
        search.locationBounds = response.data.location.geometry.viewport;

        initializeGoogleMap();
      }

      // ============================
      // >>>> START MAP FUNCTIONALITY
      // ============================

      // show bike card in maps on card hover
      function onBikeHover (bike, toShow) {
        //TODO: fix on hover
        // if (search.map) {
        //   search.selectedBike = bike;
        //   if (toShow) {
        //     var marker = _.find(search.clusterer.getMarkers(), ['id', bike.id]);
        //     google.maps.event.trigger( marker, 'click' );
        //   } else {
        //     search.map.hideInfoWindow('searchMapWindow');
        //   }
        // }
      }

      function initializeGoogleMap() {
        // without timeout map will take an old array with bikes
        $timeout(function(){
          NgMap.getMap({ id: "searchMap" }).then(function (map) {
            map.fitBounds(correctBounds());
            map.setZoom(map.getZoom() + 1);
            initMarkerClusterer(map);
            search.map = map;
            // map.panToBounds(bounds);
          });
        }, 0);
      }

      function correctBounds() {
        var bounds = new google.maps.LatLngBounds();
        if (!_.isEmpty(search.locationBounds)) {
          bounds = extendBounds(bounds, search.locationBounds.northeast.lat, search.locationBounds.northeast.lng);
          bounds = extendBounds(bounds, search.locationBounds.southwest.lat, search.locationBounds.southwest.lng);
          bounds = extendBounds(bounds, search.latLng.lat, search.latLng.lng);
        }

        var i = 0;
        _.forEach(search.bikes, function(bike) {
          if (bike.priority == true) return;
          bounds = extendBounds(bounds, bike.lat_rnd, bike.lng_rnd);
          i++;
          if (i > 3) return false;
        });

        return bounds
      }

      function extendBounds(bounds, lat, lng) {
        var loc = new google.maps.LatLng(lat, lng);
        bounds.extend(loc);
        return bounds
      }

      // Clear Markers, Add new and redraw map on each state update
      function refreshMarkerCluster(map) {
        var markers = search.filteredBikes.map(function (bike) {
          return createMarkerForBike(bike, map);
        });
        search.clusterer.clearMarkers();
        /**
         * Add new markers and redraw a map
         * @param {Array} markers google.maps.Marker
         * @param {Boolean} opt_nodraw
         */
        search.clusterer.addMarkers(markers, false);
      }

      function initMarkerClusterer(map) {
        var markers = search.filteredBikes.map(function (bike) {
          return createMarkerForBike(bike, map);
        });

        search.mapMarkers = markers;

        var mcOptions = { imagePath: 'https://cdn.rawgit.com/googlemaps/js-marker-clusterer/gh-pages/images/m' };
        search.clusterer = new MarkerClusterer(map, markers, mcOptions);
        return search.clusterer
      }

      function createMarkerForBike(bike, map) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(bike.lat_rnd, bike.lng_rnd),
          id: bike.id
        });

        google.maps.event.addListener(marker, 'click', function () {
          search.selectedBike = bike;
          map.showInfoWindow('searchMapWindow', this);
        });

        return marker;
      }

      // ============================
      // END MAP FUNCTIONALITY <<<<<<
      // ============================

      function onDateChange() {
        getUnavailableBikes().then(function(results){
          search.unavailableIds = results.data.ids;
          setUnavailableBikes();
        });
      }

      function setUnavailableBikes() {
        search.filteredDateBikes = search.bikes.slice();

        search.unavailableIds = search.unavailableIds.map(Number);
        search.unavailableBikes = _.remove(search.filteredDateBikes, function (bike) {
          return _.includes(search.unavailableIds, bike.id);
        });
        search.categorizedFilteredBikes = [{
          title: "All Bikes",
          bikes: search.filteredDateBikes
        }];
      }

      function setMetaTags(location) {
        var data = {
          location: location
        };
        $translate("search.meta-title", data).then(
          function (translation) {
            ngMeta.setTitle(translation);
          }
        );
        ngMeta.setTitle($translate.instant("search.meta-title", data));
        ngMeta.setTag("description", $translate.instant("search.meta-description", data));
      }

      function addMoreItemsLimit() {
        if (!search.bikes) return;
        if (search.limit < search.bikes.length) search.limit += 15;
      }

    }
  ]
});
