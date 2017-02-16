// DOM MAIPULATION CODE
var $;
// now we need to fetch the details of the bikes and bind it to calendar object
var calendar = {};
$(document).ready(function () {
    // LOGIC CODE - NEEDS TO BE IN SEPERATE FILE
    // RUNS BEFORE DOM MANIPULAITON
    // fetch user info
    var userId = getUrlParameter('userId') || 1005;
    $.get("https://api.listnride.com/v2/users/" + userId, function (response) {
        calendar.bikeOwner = response;
        // fetch bike info
        var bikeId = getUrlParameter('bikeId') || 165;
        $.get("https://listnride-staging.herokuapp.com/v2/rides/" + bikeId, function (bike) {
            calendar.bikeId = bikeId;
            calendar.priceHalfDay = bike.price_half_daily;
            calendar.priceDay = bike.price_daily;
            calendar.priceWeek = bike.price_weekly;
            calendar.bikeFamily = bike.family;
            calendar.requests = bike.requests;
            calendar.userId = bike.user.id;
            calendar.isDateInvalid = function () {
                return calendar.startDate !== undefined &&
                    calendar.startDate.getTime() >= calendar.endDate.getTime();
            };
            calendar.isFormInvalid = function () {
                return calendar.bikeId === undefined || calendar.startDate ===
                    undefined ||
                    (calendar.startDate !== undefined && calendar.startDate.getTime() >= calendar.endDate.getTime());
            };
            calendar.onTimeChange = function (slot) {
                var slotDate = slot + "Date";
                var slotTime = slot + "Time";
                var date = new Date(calendar[slotDate]);
                date.setHours(calendar[slotTime], 0, 0, 0);
                calendar[slotDate] = date;
                dateChange(calendar.startDate, calendar.endDate);
            };
            calendar.isFormInvalid = function () {
                return calendar.bikeId === undefined || calendar.startDate ===
                    undefined ||
                    (calendar.startDate !== undefined && calendar.startDate.getTime() >=
                        calendar.endDate.getTime());
            };

            initOverview();
            initCalendarPicker();

            console.log('calender: ', calendar);
            console.log('options: ', calenderConfigObject);
        });
    });
});

// get the parameters of the url
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

// date class
function DateService() {
    return {
        duration: function (startDate, endDate) {
            if (startDate === undefined || endDate === undefined) {
                return "0 " + "days" + " , 0 " + "hours"
            } else {
                var startDate = new Date(startDate);
                var endDate = new Date(endDate);
                var diff = Math.abs(startDate - endDate);

                var seconds = (diff / 1000) | 0;
                diff -= seconds * 1000;
                var minutes = (seconds / 60) | 0;
                seconds -= minutes * 60;
                var hours = (minutes / 60) | 0;
                minutes -= hours * 60;
                var days = (hours / 24) | 0;
                hours -= days * 24;
                var weeks = (days / 7) | 0;
                days -= weeks * 7;

                var weeksLabel = (weeks == 1) ? "week" : "weeks";
                var daysLabel = (days == 1) ? "day" : "days";
                var hoursLabel = (hours == 1) ? "hour" : "hours";
                var displayDuration = "";

                if (weeks > 0)
                    displayDuration += weeks + " " + weeksLabel;

                if (days > 0)
                    displayDuration += (weeks > 0) ?
                    (", " + days + " " + daysLabel) :
                    (days + " " + daysLabel);

                if (hours > 0)
                    displayDuration += (days > 0 || weeks > 0) ?
                    (", " + hours + " " + hoursLabel) :
                    (hours + " " + hoursLabel);

                console.log('duration from service: ', displayDuration);
                return displayDuration;
            }
        },

        subtotal: function (startDate, endDate, priceHalfDay, priceDay, priceWeek, minHoursDay) {
            minHoursDay = minHoursDay || 6;

            if (startDate === undefined || endDate === undefined) {
                return 0;
            } else {
                var diff = Math.abs(startDate - endDate);

                var seconds = (diff / 1000) | 0;
                diff -= seconds * 1000;
                var minutes = (seconds / 60) | 0;
                seconds -= minutes * 60;
                var hours = (minutes / 60) | 0;
                minutes -= hours * 60;
                var days = (hours / 24) | 0;
                hours -= days * 24;
                var weeks = (days / 7) | 0;
                days -= weeks * 7;

                var value = priceWeek * weeks;
                value += priceDay * days;

                if (weeks == 0 && days == 0) {
                    value += (hours <= minHoursDay) ? priceHalfDay * 1 : priceDay * 1;
                } else {
                    if (0 < hours && hours < minHoursDay) {
                        value += (priceHalfDay * 1);
                    } else if (hours >= minHoursDay) {
                        value += (priceDay * 1);
                    }
                }

                if (weeks == 0 && value > priceWeek) {
                    value = priceWeek * 1;
                }

                return value;
            }
        }
    }
}

var date = new DateService();

function initCalendarPicker() {
    if (calendar.requests !== undefined) {
        if (calendar.bikeFamily == 2 || calendar.bikeFamily == 9) {
            calendar.event.reserved();
        }
        $('#bike-calendar').dateRangePicker(calenderConfigObject)
            .bind('datepicker-first-date-selected', function (event, obj) {
                // to verify date range picker is configured correctly
                console.log(obj);
            })
            .bind('datepicker-change', function (event, obj) {
                var start = obj.date1;
                start.setHours(calendar.startTime, 0, 0, 0);
                var end = obj.date2;
                end.setHours(calendar.endTime, 0, 0, 0);

                calendar.startDate = start;
                calendar.endDate = end;
                dateChange(calendar.startDate, calendar.endDate);
                if (openingHoursAvailable()) {
                    setInitHours();
                }
            });
    }
}
var calenderConfigObject = {
    alwaysOpen: true,
    container: '#bike-calendar',
    beforeShowDay: classifyDate,
    inline: true,
    selectForward: true,
    showShortcuts: false,
    showTopbar: false,
    singleMonth: true,
    startOfWeek: 'monday'
};

function myFunction(element) {
    document.getElementById(element.id).click(); // Click on the checkbox
}

function getWeekDay(date) {
    var dayOfWeek = date.getDay() - 1;
    if (dayOfWeek == -1) {
        dayOfWeek = 6;
    }
    return dayOfWeek
}

function openHours(weekDay) {
    var workingHours = [];
    $.each(weekDay, function (key, value) {
        var from = value.start_at / 3600;
        var until = (value.duration / 3600) + from + 1;
        $.merge(workingHours, _.range(from, until))
    });
    return workingHours
}

function setInitHours() {
    var firstDay = calendar.bikeOwner.opening_hours.hours[getWeekDay(calendar.startDate)];
    var lastDay = calendar.bikeOwner.opening_hours.hours[getWeekDay(calendar.endDate)];
    firstDay = openHours(firstDay);
    lastDay = openHours(lastDay);
    calendar.startTime = firstDay[0];
    calendar.endTime = lastDay[lastDay.length - 1]
}

function classifyDate(date) {
    date.setHours(0, 0, 0, 0);
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date.getTime() < now.getTime()) {
        return [false, "date-past", ""];
    } else if (isReserved(date)) {
        return [false, "date-reserved", ""];
    } else if (dateClosed(date)) {
        return [false, "date-closed", ""];
    } else {
        return [true, "date-available", ""];
    }
}

function dateClosed(date) {
    if (openingHoursAvailable()) {
        console.log('in dateclosed: ', openingHoursAvailable());
        console.log('date: ', date);
        return calendar.bikeOwner.opening_hours.hours[getWeekDay(date)] == null;
    }
    return false
}

function openingHoursAvailable() {
    var returnBool = calendar.bikeOwner &&
        calendar.bikeOwner.opening_hours &&
        calendar.bikeOwner.opening_hours.enabled &&
        _.some(calendar.bikeOwner.opening_hours.hours, Array);
    return returnBool;
}

function isReserved(date) {
    console.log('requests lenght: ', calendar.requests.length);
    for (var i = 0; i < calendar.requests.length; ++i) {
        var start = new Date(calendar.requests[i].start_date);
        start.setHours(0, 0, 0, 0);
        var end = new Date(calendar.requests[i].end_date);
        end.setHours(0, 0, 0, 0);

        if (start.getTime() <= date.getTime() &&
            date.getTime() <= end.getTime()) {
            return true;
        }
    }
    return false;
}

function initOverview() {
    calendar.startTime = 10;
    calendar.endTime = 18;

    calendar.duration = date.duration(undefined, undefined);
    calendar.subtotal = 0;
    calendar.lnrFee = 0;
    calendar.total = 0;

    calendar.formValid = false;
    calendar.datesValid = false;
}

function dateChange(startDate, endDate) {
    if (calendar.isDateInvalid()) {
        console.log('data is invalid');
        calendar.duration = date.duration(undefined, undefined);
        calendar.subtotal = 0;
        calendar.lnrFee = 0;
        calendar.total = 0;
    } else {
        console.log('start: ', startDate);
        console.log('end: ', endDate);
        calendar.duration = date.duration(startDate, endDate);
        console.log('calendar duration: ', calendar.duration);
        // Price calculation differs slightly between event rentals (bikeFamily 2 or 9) and standard rentals
        if (calendar.bikeFamily == 2 || calendar.bikeFamily == 9) {
            var subtotal = date.subtotal(startDate, endDate, calendar.priceHalfDay, calendar.priceDay, calendar
                .priceWeek, 4);
        } else {
            var subtotal = date.subtotal(startDate, endDate, calendar.priceHalfDay, calendar.priceDay, calendar
                .priceWeek);
        }
        var fee = subtotal * 0.125;
        var tax = fee * 0.19;
        calendar.subtotal = subtotal;
        calendar.lnrFee = fee + tax;
        calendar.total = subtotal + fee + tax;
    }

    // calendar duration
    $('*[id*=lnr-calendar-duration]').each(function (index, element) {
        $(element).html(calendar.duration);
    });

    // calendar subtotal
    $('*[id*=lnr-calendar-subtotal]').each(function (index, element) {
        $(element).html(calendar.subtotal + ' &euro;');
    });

    // calendar lnr fee
    $('*[id*=lnr-calendar-fee]').each(function (index, element) {
        $(element).html(calendar.lnrFee + ' &euro;');
    });

    // calendar total
    $('*[id*=lnr-calendar-total]').each(function (index, element) {
        $(element).html(calendar.total + ' &euro;');
    });
}