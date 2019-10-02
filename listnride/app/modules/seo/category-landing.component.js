import MarkerClusterer from "@google/markerclustererplus";
import Swiper from 'swiper';

angular.module('categoryLanding', []).component('categoryLanding', {
  templateUrl: 'app/modules/seo/category-landing.template.html',
  controllerAs: 'categoryLanding',
  controller: function CategoryLandingController(
    $translate,
    $translatePartialLoader,
    $stateParams,
    $scope,
    $state,
    $filter,
    api,
    ENV,
    bikeOptions,
    ngMeta,
    NgMap,
    applicationHelper,
    mapConfigs,
    $mdMedia,
    $timeout
  ) {
      const categoryLanding = this;
      const MOBILE_BIKE_TILES = 3;
      const DESKTOP_BIKE_TILES = 8;

      categoryLanding.$onInit = function () {
        $translatePartialLoader.addPart(ENV.staticTranslation);
        // capitalize city name in URL
        categoryLanding.city = _.capitalize($stateParams.city);
        // take category number from category (only english) name in URL
        let categoryId = $filter('categorySeo')($stateParams.category);
        if (!categoryId) $state.go('404');
        categoryLanding.category = $filter('category')(categoryId);
        categoryLanding.bikes = {};
        categoryLanding.group = {};
        categoryLanding.loading = true;
        categoryLanding.mapLoading = true;
        categoryLanding.subcategoriesNumbers = '';
        categoryLanding.categories = [];
        categoryLanding.allBikes = [];
        categoryLanding.headerTranslation = 'seo.header';
        categoryLanding.defaultProfilePicture = applicationHelper.defaultProfilePicture;
        categoryLanding.breadcrumbs = [
          {
            title:'Home',
            route: 'home'
          },
          {
            title:`${categoryLanding.city}`,
            route: `cityLanding({ city: '${$stateParams.city}'})`
          },
          {
            title: 'Road bike'
          }];
        categoryLanding.colorScheme = mapConfigs.colorScheme();
        categoryLanding.mapOptions = mapConfigs.mapOptions;
        categoryLanding.mobileScreen = $mdMedia('xs');
        const BIKES_AMOUNT = categoryLanding.mobileScreen ? MOBILE_BIKE_TILES : DESKTOP_BIKE_TILES;

        // methods
        categoryLanding.onSearchClick = onSearchClick;
        categoryLanding.tileRowspan = tileRowspan;
        categoryLanding.tileColspan = tileColspan;
        categoryLanding.getAllSubcategories = getAllSubcategories;

        // invocations
        fetchData(categoryId);
      };

      function fetchData(categoryId) {
        let lang = $translate.preferredLanguage();

        api.get('/seo_page?city=' + categoryLanding.city + '&cat=' + categoryId + '&lang=' + $translate.preferredLanguage()).then(
          function (success) {
            categoryLanding.data = success.data;
            categoryLanding.location = categoryLanding.city;
            categoryLanding.loading = false;
            categoryLanding.translatedCity = categoryLanding.data.city_names[lang] ? categoryLanding.data.city_names[lang] : categoryLanding.city;
            categoryLanding.categoryString = $translate.instant(categoryLanding.category).toLowerCase();
            categoryLanding.title = $translate.instant('seo.rent-the-best') + ' ' + categoryLanding.categoryString + ' ' + $translate.instant('seo.bikes') + ' ' + 'in' + ' ' + categoryLanding.city;

            ngMeta.setTitle($translate.instant(categoryLanding.data.explore.meta_title));
            ngMeta.setTag("description", $translate.instant(categoryLanding.data.explore.meta_description));

            bikeOptions.allCategoriesOptionsSeo().then(function (resolve) {
              categoryLanding.categories = resolve;

              _.forEach(categoryLanding.data.blocks, function(block) {
                // save all bikes in one array for map
                categoryLanding.allBikes = categoryLanding.allBikes.concat(block.bikes);

                categoryLanding.group[block.key] = block;
                categoryLanding.group[block.key].bikes = block.bikes.slice(0, categoryLanding.bikesToShow);

                pushSubcategoriesToBikesBlocks(block, categoryLanding.categories);
              });

              _.forEach(categoryLanding.categories, function (item) {
                item.dataName = item.url.replace(/-/i, '_')
              });

            });

            if(!categoryLanding.mobileScreen) initializeGoogleMap();

            $timeout(function () {
              swiperConfig();
            });
            },
          function (error) {
            $state.go('404');
          }
        );
      }

       function pushSubcategoriesToBikesBlocks(targetBikesObj, currentCategories) {
        categoryLanding.categoryName = targetBikesObj.key.replace(/_/i, '-');
        //pushed subcategories to to each bikes block of response
        _.filter(currentCategories, function(category) {
          if(category.url === categoryLanding.categoryName ) {
            targetBikesObj.subcategories = category.subcategories;
          }
        });
      }

      function getAllSubcategories(subcategoriesId) {
        subcategoriesId = subcategoriesId.toString();
        let allSeoCategory = categoryLanding.categories;

        if (!allSeoCategory) return;
        let categoryCurrentObj = _.find(allSeoCategory, (categoryObject) => {
          return categoryObject.subcategories.split(',').indexOf(subcategoriesId) !== -1;
        });
        return categoryCurrentObj.subcategories;
      }

    // ============================
      // >>>> START MAP FUNCTIONALITY
      // ============================

      function initializeGoogleMap() {
        // without timeout map will take an old array with bikes
        $timeout(function(){
          NgMap.getMap({ id: "searchMap" }).then(function (map) {
            map.fitBounds(correctBounds());
            map.setZoom(map.getZoom());
            initMarkerClusterer(map);
            categoryLanding.map = map;
            categoryLanding.mapLoading = false;
          });
        }, 0);
      }

      function initMarkerClusterer(map) {
        let markers = categoryLanding.allBikes.map(function (bike) {
          return createMarkerForBike(bike, map);
        });

        categoryLanding.mapMarkers = markers;

        let mcOptions = {
          styles: mapConfigs.clustersStyle()
        };
        categoryLanding.clusterer = new MarkerClusterer(map, markers, mcOptions);
        return categoryLanding.clusterer;
      }

      function createMarkerForBike(bike, map) {
        // Origins, anchor positions and coordinates of the marker increase in the X
        // direction to the right and in the Y direction down.
        var image = {
          url: 'app/assets/ui_icons/map/markers/Pin Map 56x56.png',
          // This marker is 56 pixels wide by 56 pixels high.
          size: new google.maps.Size(56,56),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (56/2, 56).
          anchor: new google.maps.Point(28, 56),
          // The label position inside marker
          labelOrigin: new google.maps.Point(28, 22)
          // scaledSize: new google.maps.Size(50, 50)
        };

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(bike.location.lat_rnd, bike.location.lng_rnd),
          id: bike.id,
          icon: image,
          title: Math.ceil(bike.price_from) + '€',
          label: { text: Math.ceil(bike.price_from) + '€', color: "white", fontSize: '13px', fontWeight: 'bold' }
        });

        google.maps.event.addListener(marker, 'click', function () {
          categoryLanding.selectedBike = bike;
          map.showInfoWindow('searchMapWindow', this);
        });

        return marker;
      }

      function correctBounds() {
        var bounds = new google.maps.LatLngBounds();
        if (!_.isEmpty(categoryLanding.locationBounds)) {
          bounds = extendBounds(bounds, categoryLanding.locationBounds.northeast.lat, categoryLanding.locationBounds.northeast.lng);
          bounds = extendBounds(bounds, categoryLanding.locationBounds.southwest.lat, categoryLanding.locationBounds.southwest.lng);
          bounds = extendBounds(bounds, categoryLanding.latLng.lat, categoryLanding.latLng.lng);
        }

        let i = 0;
        _.forEach(categoryLanding.allBikes, function(bike) {
          if (bike.priority === true) return;
          bounds = extendBounds(bounds, bike.location.lat_rnd, bike.location.lng_rnd);
          i++;
          if (i > 3) return false;
        });

        return bounds;
      }

      function extendBounds(bounds, lat, lng) {
        let loc = new google.maps.LatLng(lat, lng);
        bounds.extend(loc);
        return bounds;
      }

      // ============================
      // END MAP FUNCTIONALITY <<<<<<
      // ============================

      categoryLanding.placeChanged = function(place) {
        var location = place.formatted_address || place.name;
        $state.go('search', {location: location});
      };

      categoryLanding.onSearchClick = function() {
        $state.go('search', {location: categoryLanding.location});
      };

      function tileColspan(index) {
        if (index === 0 || index === 4) {
          return 3;
        } else if (index === 3 || index > 4){
          return 2;
        } else {
          return 1;
        }
      }

      function tileRowspan(index) {
        return (index === 1 || index === 2) ? 2 : 1;
      }

      function swiperConfig () {

        categoryLanding.bikesList = new Swiper ('#bikes-list', {
          keyboardControl: true,
          loop: true,
          slidesPerView: 1,
          spaceBetween: 20
        });

        categoryLanding.brandsSwiper = new Swiper ('#bikes-brands', {
          keyboardControl: true,
          slidesPerView: 4,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          breakpoints: {
            768: {
              slidesPerView: 3
            },
            640: {
              slidesPerView: 2
            }
          }
        });

        if (categoryLanding.mobileScreen) categoryLanding.brandsSwiper.appendSlide('<div class="swiper-slide"></div>');

        categoryLanding.testimonialsSwiper = new Swiper ('#testimonials-slider', {
          slidesPerView: 3,
          spaceBetween: -50,
          keyboardControl: true,
          centeredSlides: true,
          loop: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          breakpoints: {
            639: {
              slidesPerView: 1,
              spaceBetween: 10
            }
          }
        });

        categoryLanding.tipsSwiper = new Swiper ('#slider-fading', {
          keyboardControl: true,
          centeredSlides: true,
          spaceBetween: 30,
          effect: 'fade',
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          autoplay: {
            delay: 5000
          },
        });

        categoryLanding.tipsSwiper.on('slideChange', function () {
          categoryLanding.slideIndex = categoryLanding.tipsSwiper.activeIndex;
          // update scope one more time
          _.defer(function () {
            $scope.$apply();
          });
        });
      }
      function onSearchClick() {
        $state.go('search', { location: categoryLanding.location });
      }
    }
});
