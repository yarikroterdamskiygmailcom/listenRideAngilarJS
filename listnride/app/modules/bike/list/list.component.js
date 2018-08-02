'use strict';

angular.module('list', ['ngLocale'])
  // list form
  .component('list', {
    templateUrl: 'app/modules/bike/list/list.template.html',
    bindings: {
      heading: "<",
      isListMode: "<",
      discountFieldEditable: "<"
    },
    controllerAs: 'list',
    controller: [
      '$mdDialog',
      '$mdToast',
      '$translate',
      '$localStorage',
      '$stateParams',
      '$state',
      '$scope',
      '$analytics',
      'Upload',
      'bikeOptions',
      'api',
      'authentication',
      '$timeout',
      'verification',
      'accessControl',
      'loadingDialog',
      'price',
      'countryCodeTranslator',
      function ListController($mdDialog, $mdToast, $translate, $localStorage, $stateParams, $state,
                              $scope, $analytics, Upload, bikeOptions, api, authentication,
                              $timeout, verification, accessControl, loadingDialog, price, countryCodeTranslator) {

        if (accessControl.requireLogin()) {
          return;
        }

        var list = this;

        // add default params
        list.form = {
          name: '',
          brand: '',
          description: '',
          size: '',
          category: '',
          street: '',
          city: '',
          zip: '',
          country: '',
          custom_price: '',
          discounts: '',
          frame_size: '',
          bicycle_number: '',
          frame_number: '',
          details: '',
          accessories: {},
          images: [],
          coverage_total: 0
        };

        list.selectedIndex = 0;
        list.removedImages = [];
        list.startImage = 1;
        list.sizeOptions = bikeOptions.sizeOptions();
        list.kidsSizeOptions = bikeOptions.kidsSizeOptions();
        list.accessoryOptions = bikeOptions.accessoryOptions();
        list.validateObj = {height: {min: 1000}, width: {min: 1500}, duration: {max: '5m'}};
        list.invalidFiles = {};
        list.businessUser = false;
        list.selectedCategory = {};
        bikeOptions.allCategoriesOptions().then(function (resolve) {
          list.categoryOptions = resolve;
        });
        list.coverageOptions = [1000, 2000, 3000, 4000, 5000];

        var equipmentCategories = [51, 52, 53, 54];
        var insuranceCountries = ['DE', 'AT'];

        var setBusinessForm = function() {
          if (authentication.isBusiness) {
            list.businessUser = true;
            list.form.custom_price = true;
            list.show_custom_price = true;
          } else {
            list.businessUser = false;
          }
        };

        function subcategoryParent(subId) {
          return _.find(list.categoryOptions, function(category) {
            return _.find(category.subcategories, function(subcategory) {
              return subcategory.id === subId
            })
          });
        }

        list.tabCompleted = function(tabId) {
          return (list.selectedIndex > tabId && list.isListMode) ? "✔" : "    ";
        };

        list.subcategoriesList = function (categoryId) {
          if (!categoryId) return;
          return _.find(list.categoryOptions, function(category) {
            return category.catId === parseInt(categoryId);
          }).subcategories.sort()
        };

        list.populateNewBikeData = function () {
          api.get('/users/' + $localStorage.userId).then(
            function (success) {
              var data = success.data;
              if (!data.has_address || !data.confirmed_phone || data.status === 0) {
                verification.openDialog(true);
              }
              list.form.street = data.street;
              list.form.zip = data.zip;
              list.form.city = data.city;
              list.form.country = data.country;

              list.form.prices = [];
              for (var day = 0; day < 9; day += 1) {
                list.form.prices[day] = {
                  price: undefined
                }
              }
              list.form.discounts = {
                "daily": 10,
                "weekly": 20
              };

              // Slightly modify form for business listers
              setBusinessForm();
            },
            function (error) {
            }
          );
        };

        list.populateExistingBikeData = function () {
          api.get('/rides/' + $stateParams.bikeId).then(
            function (response) {
              var data = response.data;
              if (parseInt(data.user.id) === $localStorage.userId) {
                var images = [];
                for (var i = 1; i <= 5; ++i) {
                  if (data["image_file_" + i] !== undefined &&
                    data["image_file_" + i]["image_file_" + i].small.url !== null) {
                    images.push({
                      src: data["image_file_" + i],
                      url: data["image_file_" + i]["image_file_" + i].small.url,
                      local: "false"
                    });
                  }
                }

                data.images = images;
                var prices = price.transformPrices(data.prices, data.discounts);
                data.size = parseInt(data.size);
                data.mainCategory = subcategoryParent(data.category).catId;
                data.subCategory = data.category;

                list.selectedCategory = subcategoryParent(data.category);

                // form data for edit bikes
                list.form = data;
                list.form.prices = prices;

                _.forEach(data.accessories, function(value, key) {
                  data.accessories[key] = value === "true";
                });

                // list.form.push(data.accessories);
                list.form = _.merge(list.form, data.accessories);

                // if custom price is enabled
                if (list.form.custom_price && !list.businessUser) {
                  list.disableDiscounts();
                  list.show_custom_price = true;
                }

                // if custom price is disabled
                else if (list.form.custom_price === false && !list.businessUser) {
                  list.show_custom_price = false;
                }

                setBusinessForm();

                if (!_.isEmpty(list.form.frame_size) || !_.isEmpty(list.form.frame_number) || !_.isEmpty(list.form.details)) {
                  list.show_custom_fields = true;
                }
              }
            },
            function (error) {
            }
          );
        };

        // form submission for new ride
        list.submitNewRide = function () {
          var prices = price.inverseTransformPrices(list.form.prices, list.isListMode);
          var ride = {
            "ride" : {
              "name": list.form.name,
              "brand": list.form.brand,
              "description": list.form.description,
              "size": list.form.size,
              "category": list.form.subCategory,
              "accessories": {
                "lock": !!list.form.lock,
                "helmet": !!list.form.helmet,
                "lights": !!list.form.lights,
                "basket": !!list.form.basket,
                "trailer": !!list.form.trailer,
                "childseat": !!list.form.childseat
              },
              "user_id": $localStorage.userId,
              "street": list.form.street,
              "city": list.form.city,
              "zip": list.form.zip,
              "country": list.form.country,
              "prices": prices,
              "custom_price": list.form.custom_price,
              "discounts": list.form.discounts,
              "frame_size": list.form.frame_size,
              "bicycle_number": list.form.bicycle_number,
              "frame_number": list.form.frame_number,
              "details": list.form.details,
              "image_file_1": (list.form.images[0]) ? list.form.images[0].src : undefined,
              "image_file_2": (list.form.images[1]) ? list.form.images[1].src : undefined,
              "image_file_3": (list.form.images[2]) ? list.form.images[2].src : undefined,
              "image_file_4": (list.form.images[3]) ? list.form.images[3].src : undefined,
              "image_file_5": (list.form.images[4]) ? list.form.images[4].src : undefined,
              "is_equipment": _.includes(equipmentCategories, list.form.subCategory),
              "coverage_total": list.form.coverage_total
            }
          };

          api.get('/users/' + $localStorage.userId).then(
            function (success) {
              var user = success.data;
              if (!user.has_address || !user.confirmed_phone || user.status == 0) {
                verification.openDialog(false);
                list.submitDisabled = false;
              } else {
                Upload.upload({
                  method: 'POST',
                  url: api.getApiUrl() + '/rides',
                  data: ride,
                  headers: {
                    'Authorization': $localStorage.auth
                  }
                }).then(
                  function (response) {
                    loadingDialog.close();
                    $state.go("listings");
                    $analytics.eventTrack('List a Bike', {category: 'List Bike', label: 'Bike Added'});
                  },
                  function (error) {
                    list.submitDisabled = false;
                    loadingDialog.close();
                  }
                );
              }
            },
            function (error) {
            }
          );
        };

        // form submission for existing ride
        list.submitEditedRide = function () {
          var prices = price.inverseTransformPrices(list.form.prices);
          var ride = {
            "ride" : {
              "name": list.form.name,
              "brand": list.form.brand,
              "description": list.form.description,
              "size": list.form.size,
              "category": list.form.subCategory,
              "accessories": {
                "lock": !!list.form.lock,
                "helmet": !!list.form.helmet,
                "lights": !!list.form.lights,
                "basket": !!list.form.basket,
                "trailer": !!list.form.trailer,
                "childseat": !!list.form.childseat
              },
              "user_id": $localStorage.userId,
              "street": list.form.street,
              "city": list.form.city,
              "zip": list.form.zip,
              "country": list.form.country,
              "prices": prices,
              "custom_price": list.form.custom_price,
              "discounts": list.form.discounts,
              "frame_size": list.form.frame_size,
              "bicycle_number": list.form.bicycle_number,
              "frame_number": list.form.frame_number,
              "details": list.form.details,
              "is_equipment": _.includes([51, 52, 53, 54], list.form.subCategory),
              "coverage_total": list.form.coverage_total
            }
          };

          // TODO: Refactor images logic backend & frontend
          _.forEach(list.removedImages, function(image_name) {
            ride['ride']['remove_' + image_name] = true
          });

          // FIXME: HOTFIX, optimise long term
          _.forEach(list.form.images, function(image) {
            if(_.isEmpty(image.url)){ AddNewImage(image) }
          });

          function AddNewImage(image) {
            _.forEach(_.range(list.startImage,6), function(id) {
              if(_.values(list.form['image_file_' + id])[0].url == null || ride['ride']['remove_image_file_' + id]){
                ride['ride']['remove_image_file_' + id] = false;
                ride['ride']['image_file_' + id] = image.src;
                list.startImage = id + 1;
                return false;
              }
            });
          }
          console.log(ride);
          Upload.upload({
            method: 'PUT',
            url: api.getApiUrl() + '/rides/' + $stateParams.bikeId,
            data: ride,
            headers: {
              'Authorization': $localStorage.auth
            }
          }).then(
            function (response) {
              loadingDialog.close();
              $mdToast.show(
                $mdToast.simple()
                .textContent($translate.instant('toasts.bike-edit-successful'))
                .hideDelay(4000)
                .position('top center')
              );
              $state.go("listings");
            },
            function (error) {
              list.submitDisabled = false;
              loadingDialog.close();
            }
          );
        };

        // submit the form
        list.onFormSubmit = function () {
          list.submitDisabled = true;
          loadingDialog.open();
          if (list.isListMode) {
            list.submitNewRide();
          } else {
            list.submitEditedRide();
          }
        };

        // set the custom prices for a bike
        list.setCustomPrices = function (dailyPriceChanged) {
          // business users get their prices proposed according to a fixed scheme
          if(list.businessUser) {
            list.form.prices = price.proposeCustomPrices(list.form);
          } else {
            // discount fields are enabled and no custom price are set manually
            if (list.discountFieldEditable) {
            // set the prices based on the daily price
              list.form.prices = price.setCustomPrices(list.form);
            }
          }
        };

        list.insuranceAllowed = function () {
          if (list.form.country && insuranceCountries.indexOf(countryCodeTranslator.countryCodeFor(list.form.country)) > -1) {
            return true;
          } else {
            return false;
          }
        }

        list.resetCustomPrices = function () {
          // hide reset button
          // enable discount field
          list.discountFieldEditable = true;
          // set the prices based on the daily price
          price.setCustomPrices(list.form);
        };

        // disable custom discounts fields
        list.disableDiscounts = function () {
          list.form.custom_price = true;
          list.discountFieldEditable = false;
        };

        // enable custom discounts fields
        list.enableDiscounts = function () {
          list.form.custom_price = false;
          list.discountFieldEditable = true;
        };

        list.toggleDiscount = function () {
          if (list.form.custom_price === true) {
            list.resetCustomPrices();
            list.show_custom_price = true;
            // list.discountFieldEditable = false;
          } else if (list.form.custom_price === false) {
            list.show_custom_price = false;
            list.discountFieldEditable = true;
          }
        };

        // go to next tab
        list.nextTab = function () {
          list.selectedIndex = list.selectedIndex + 1;
        };

        // go to previous tab
        list.previousTab = function () {
          list.selectedIndex = list.selectedIndex - 1;
        };

        list.showAccessories = function () {
          return list.form.subCategory && !_.includes(equipmentCategories, list.form.subCategory)
        }

        // add image of the bike
        list.addImage = function (files) {
          if (files && files.length)
            for (var i = 0; i < files.length && list.form.images.length < 5; ++i)
              if (files[i] !== null) {
                if (list.isListMode) {
                  list.form.images.push({src: files[i], local: "true"});
                }
                else {
                  list.form.images.push({src: files[i], local: "true"});
                }
              }
        };

        // remove image of the bike
        list.removeImage = function (index, img) {
          list.removedImages = _.union(list.removedImages, Object.keys(img.src));
          list.form.images.splice(index, 1);
        };

        // check the categories
        list.isCategoryValid = function () {
          return list.form.subCategory !== undefined;
        };

        // check bikes details
        list.isDetailsValid = function () {
          return list.form.name !== undefined &&
            list.form.brand !== undefined &&
            list.form.size !== undefined &&
            list.form.description !== undefined;
        };

        // check picture is correct
        list.isPictureValid = function () {
          return list.form.images.length > 0;
        };

        list.isLocationValid = function () {
          return list.form.street !== undefined &&
            list.form.zip !== undefined &&
            list.form.city !== undefined &&
            list.form.country !== undefined;
        };

        list.isPricingValid = function () {
          // if prices is undefined
          if (!list.form.prices) return false;
          // if one of the price is not provided
          for (var loop = 0; loop < list.form.prices.length; loop += 1) {
            if (list.form.prices[loop].price === undefined) return false;
          }
          return true;
        };

        list.isPricingValid2 = function () {
          // prices for some day should be higher than the previous day
          // from day 2 to day 7
          for (var day = 1; day < 7; day += 1) {
              // if ()
          }
        };

        list.categoryChange = function (oldCategory) {
          if (parseInt(list.form.mainCategory) === 40 || parseInt(oldCategory) === 40) {
            list.form.size = undefined;
          }
        };

        list.fillAddress = function (place) {
          var components = place.address_components;
          if (components) {
            var desiredComponents = {
              "street_number": "",
              "route": "",
              "locality": "",
              "country": "",
              "postal_code": ""
            };

            for (var i = 0; i < components.length; i++) {
              var type = components[i].types[0];
              if (type in desiredComponents) {
                desiredComponents[type] = components[i].long_name;
              }
            }

            list.form.street = desiredComponents.route + " " + desiredComponents.street_number;
            list.form.zip = desiredComponents.postal_code;
            list.form.city = desiredComponents.locality;
            list.form.country = desiredComponents.country;
          }
        };

        list.onAccessoryClick = function (accessory) {
          list.form[accessory] = !list.form[accessory];
        };

        list.isFormValid = function () {
          return list.isCategoryValid() &&
            list.isDetailsValid() &&
            list.isPictureValid() &&
            list.isLocationValid() &&
            list.isPricingValid();
        };

        list.changeCategory = function() {
          list.form.subCategory = undefined;
        }
        // populate data for list or edit bike
        if (list.isListMode) list.populateNewBikeData();
        else list.populateExistingBikeData();
      }
    ]
  })
  // category tab
  .component('categoriesListTab', {
    templateUrl: 'app/modules/bike/list/categories-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'categoriesTab'
  })
  // details tab
  .component('detailsListTab', {
    templateUrl: 'app/modules/bike/list/details-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'detailsTab'
  })
  // pictures tab
  .component('picturesListTab', {
    templateUrl: 'app/modules/bike/list/pictures-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'picturesTab'
  })
  // location tab
  .component('locationListTab', {
    templateUrl: 'app/modules/bike/list/location-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'locationTab'
  })
  .component('insuranceListTab', {
    templateUrl: 'app/modules/bike/list/insurance-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'insuranceTab'
  })
  // pricing tab
  .component('pricingListTab', {
    templateUrl: 'app/modules/bike/list/pricing-list-tab.template.html',
    require: {
      parent: '^list'
    },
    controllerAs: 'pricingTab'
  });
