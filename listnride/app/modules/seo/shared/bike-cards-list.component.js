angular.module('bikeCardsList', []).component('bikeCardsList', {
  templateUrl: 'app/modules/seo/shared/bike-cards-list.template.html',
  controllerAs: 'bikeCardsList',
  bindings: {
    title: '<',
    subtitle: '<',
    bikes: '<',
    city: '<',
    subcategories: '<'
  },
  controller: function BikeCardsListController() {}
});