'use strict';

angular.module('cyclassicsHamburg',[]).component('cyclassicsHamburg', {
    templateUrl: 'app/modules/events/cyclassics-hamburg/cyclassics-hamburg.template.html',
    controllerAs: 'cyclassicsHamburg',
    controller: ['NgMap', 'api', '$translate','$translatePartialLoader', 'ENV',
    function CyclassicsHamburg(NgMap, api, $translate, $tpl, ENV) {
        var cyclassicsHamburg = this;
        $tpl.addPart(ENV.staticTranslation);

        cyclassicsHamburg.sizeOptions = [
            {value: "", label: "-"},
            {value: 155, label: "155 - 165 cm"},
            {value: 165, label: "165 - 175 cm"},
            {value: 175, label: "175 - 185 cm"},
            {value: 185, label: "185 - 195 cm"},
            {value: 195, label: "195 - 205 cm"}
          ];

        cyclassicsHamburg.isAvailable = function (bike) {

        };

        $translate('search.all-sizes').then(function (translation) {
            cyclassicsHamburg.sizeOptions[0].label = translation;
        });

        // TODO: readd &booked_at=2018-08-20 when API is fixed
        api.get('/rides?category=30&location=Hamburg').then(
            function(response) {
                cyclassicsHamburg.bikes = response.data.bikes;
            },
            function(error) {
            }
        );

    }
    ]
});
