'use strict';

angular.module('header').component('sidebar', {
  templateUrl: 'app/modules/sidebar/sidebar.template.html',
  controllerAs: 'sidebar',
  controller: ['$mdSidenav', '$localStorage', 'authentication',
    function SidebarController($mdSidenav, $localStorage, authentication) {
      var sidebar = this;
      sidebar.authentication = authentication;
      sidebar.profilePicture = $localStorage.profilePicture;
      sidebar.toggle = function() {
        $mdSidenav('right').toggle();
      };
    }
  ]
});