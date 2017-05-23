'use strict';

angular.module('velothonBikerental',[]).component('velothonBikerental', {
    templateUrl: 'app/modules/events/velothon-bikerental/velothon-bikerental.template.html',
    controllerAs: 'velothonBikerental',
    controller: ['NgMap', 'api', '$translate', 'ngMeta',
        function VelothonBikerental(NgMap, api, $translate, ngMeta) {
            var velothonBikerental = this;

            ngMeta.setTitle($translate.instant("events.velothon-bikerental.meta-title"));
            ngMeta.setTag("description", $translate.instant("events.velothon-bikerental.meta-description"));

            velothonBikerental.sizeOptions = [
                {value: "", label: "-"},
                {value: 155, label: "155 - 165 cm"},
                {value: 165, label: "165 - 175 cm"},
                {value: 175, label: "175 - 185 cm"},
                {value: 185, label: "185 - 195 cm"},
                {value: 195, label: "195 - 205 cm"}
            ];

            $translate('search.all-sizes').then(function (translation) {
                velothonBikerental.sizeOptions[0].label = translation;
            });

            api.get('/rides?category=20&location=Berlin&priority=velothon').then(
                function(response) {
                    console.log(response.data);
                    velothonBikerental.bikes = response.data;
                },
                function(error) {
                    console.log("Error retrieving User", error);
                }
            );

        }
    ]
});
