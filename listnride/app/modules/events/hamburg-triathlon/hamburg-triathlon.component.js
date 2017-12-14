'use strict';

angular.module('hamburgTriathlon',[]).component('hamburgTriathlon', {
    templateUrl: 'app/modules/events/hamburg-triathlon/hamburg-triathlon.template.html',
    controllerAs: 'hamburgTriathlon',
    controller: ['NgMap', 'api', '$translate','$translatePartialLoader',
    function HamburgTriathlonController(NgMap, api, $translate, $tpl) {
        var hamburgTriathlon = this;
        $tpl.addPart('static');

        hamburgTriathlon.sizeOptions = [
            {value: "", label: "-"},
            {value: 155, label: "155 - 165 cm"},
            {value: 165, label: "165 - 175 cm"},
            {value: 175, label: "175 - 185 cm"},
            {value: 185, label: "185 - 195 cm"},
            {value: 195, label: "195 - 205 cm"}
          ];

        hamburgTriathlon.isAvailable = function (bike) {

        };

        $translate('search.all-sizes').then(function (translation) {
            hamburgTriathlon.sizeOptions[0].label = translation;
        });

        api.get('/rides?category=20&location=Hamburg&booked_at=2017-08-20').then(
            function(response) {
                hamburgTriathlon.bikes = response.data;
            },
            function(error) {
            }
        );

    }
    ]
});
