/* global $ MaterialTextfield */
$(function () {
    $('#lnr-next-button-tab-duration').prop('disabled', true);
});

/*------------ User info form validation ------------*/

var userFormOverview = {
    'form_first_name': false,
    'form_last_name': false,
    'form_email': false,
    'form_email_repeat': false,
    'valid': false
};

$(function () {
    $('#lnr-next-button-tab-basic-info').prop('disabled', true);
    $('#user-info').on('keyup', function () {
        userInputErrorAny('info')
    });
    $('#form_first_name').on('blur', function () {
        userButtonValidator(this.id, true);
        validateField(this.id, '#user');
        userInputErrorAny('info');
    });
    $('#form_last_name').on('blur', function () {
        userButtonValidator(this.id, true);
        validateField(this.id, '#user');
        userInputErrorAny('info');
    });
    $('#form_email').on('blur', function () {
        validateField(this.id, '#user');
        checkEmailRegexp(this.id);
        compareFullEmail();
    });
    $('#form_email').on('keyup change', function () {
        compareEmailOnFly();
    });
    $('#form_email_repeat').on('blur', function () {
        validateField(this.id, '#user');
        checkEmailRegexp(this.id);
        compareFullEmail();
    });
    $('#form_email_repeat').on('keyup change', function () {
        compareEmailOnFly();
    });
});

function compareFullEmail() {
    var $email = $('#form_email');
    var $repeat = $('#form_email_repeat');
    if ($repeat.val().length > 0 && $email.val().length > 0) {
        if ($email.val() == $repeat.val() && emailRegexp($repeat) && emailRegexp($email)) {
            removeFieldError($email);
            removeFieldError($repeat);
            userButtonValidator($email.attr('id'), true);
            userButtonValidator($repeat.attr('id'), true);
            $('.user-info-email-validation').hide();
        } else {
            addFieldError($email);
            addFieldError($repeat);
            $('.user-info-email-validation').show();
        }
    }
    userInputErrorAny('info');
}

function compareEmailOnFly() {
    var $email = $('#form_email');
    var $repeat = $('#form_email_repeat');
    var max_length = Math.max($repeat.val().length, $email.val().length);
    var min_length = Math.min($repeat.val().length, $email.val().length);
    if (max_length != min_length && $email.val().substring(0,min_length) == $repeat.val().substring(0,min_length)) {
        removeFieldError($email);
        removeFieldError($repeat);
        userButtonValidator($email.attr('id'), false);
        userButtonValidator($repeat.attr('id'), false);
        $('.user-info-email-validation').hide();
    } else if(max_length == min_length) {
        compareFullEmail();
    } else {
        addFieldError($email);
        addFieldError($repeat);
        $('.user-info-email-validation').show();
    }
}

/*------------ User login form validation ------------*/

var loginFormOverview = {
    'form_login_email': false,
    'form_login_password': false,
    'valid': false
};

$(function () {
    $('#user-login').on('keyup', function () {
        userInputErrorAny('login')
    });

    $('#form_login_email').on('blur', function() {
        validateField(this.id, '#login');
        checkEmailRegexp(this.id);
        userInputErrorAny('login');
    });

    $('#form_login_email').on('keyup change', function() {
        userButtonValidator(this.id, true);
        validateField(this.id, '#login');
    });

    $('#form_login_password').on('blur keyup', function() {
        userButtonValidator(this.id, true);
        validateField(this.id, '#login');
        userInputErrorAny('login');
    });
});

/*------------ User shared logic ------------*/

function checkEmailRegexp(id){
    var email = $('#' + id);
    if (emailRegexp(email)) {
        removeFieldError(email);
    } else {
        addFieldError(email)
    }
}

function emailRegexp(email){
    return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email.val());
}

function userButtonValidator(field, value) {
    if (loginFlow) {
        loginFormOverview[field] = value;
        toggleUserButton(loginFormOverview);
    } else {
        userFormOverview[field] = value;
        toggleUserButton(userFormOverview);
    }
}

function toggleUserButton(from) {
    if (allTrue(from)) {
        $('#lnr-next-button-tab-basic-info').prop('disabled', false);
    } else {
        $('#lnr-next-button-tab-basic-info').prop('disabled', true);
    }
}

function userInputErrorAny(form_name){
    if ($('#user-' + form_name + ' md-input-container.is-invalid').length == 0) {
        userButtonValidator('valid', true);
        $('.user-' + form_name + '-validation').hide();
    } else {
        userButtonValidator('valid', false);
        $('.user-' + form_name + '-validation').show();
    }
}

/*------------ Payment info form validation ------------*/

var paymentFormOverview = {
    'sp-payment-cardholder': false,
    'sp-payment-cardnumber': false,
    'sp-payment-cvv': false,
    'valid': false
};

$(function() {
    $('#sp-button-paypal').on('click', function (){
        removeFieldError($('#sp-payment-cardholder'));
        removeFieldError($('#sp-payment-cardnumber'));
        removeFieldError($('#sp-payment-cvv'));
        paymentInputErrorAny();
    })
});

$(function () {
    $('#lnr-next-button-tab-payment-details').prop('disabled', true);
    $('#sp-payment-form').on('keyup', function () {
        paymentInputErrorAny();
    });
    $('#sp-payment-cardholder').on('keyup blur', function () {
        paymentButtonValidator(this.id, true);
        validateField(this.id, '#payment');
        paymentInputErrorAny();
    });
    $('#sp-payment-cardnumber').on('keyup blur', function () {
        paymentButtonValidator(this.id, true);
        validateField(this.id, '#payment');
        paymentInputErrorAny();
    });
    $('#sp-payment-cvv').on('keyup blur', function () {
        paymentButtonValidator(this.id, true);
        validateField(this.id, '#payment');
        paymentInputErrorAny();
        if (this.value.length > 4) {
            this.value = this.value.slice(0, 4);
        }
    });
});

function paymentInputErrorAny(){
    if ($('#sp-payment-form md-input-container.is-invalid').length == 0) {
        paymentButtonValidator('valid', true);
        $('.payment-info-validation').hide();
    } else {
        paymentButtonValidator('valid', false);
        $('.payment-info-validation').show();
    }
}

function paymentButtonValidator(field, value) {
    paymentFormOverview[field] = value;

    if (allTrue(paymentFormOverview)) {
        $('#lnr-next-button-tab-payment-details').prop('disabled', false);
    } else {
        $('#lnr-next-button-tab-payment-details').prop('disabled', true);
    }
}

/*------------ Shared stuff ------------*/

function validateField(input_id, text_id) {
    input_id = '#' + input_id;
    if ($(input_id).parent().hasClass('is-invalid') || $(input_id).val().length == 0) {
        $(input_id).parent().addClass('is-invalid');
        $(input_id).closest("div").find("label").addClass('text-invalid');
        $(text_id + '-info-validation').removeClass('hidden');
    } else {
        $(input_id).closest("div").find("label").removeClass('text-invalid');
        $(text_id + '-info-validation').addClass('hidden');
    }
}

function addFieldError(field) {
    field.parent().addClass('is-invalid');
    field.closest("div").find("label").addClass('text-invalid');
}

function removeFieldError(field) {
    field.parent().removeClass('is-invalid');
    field.closest("div").find("label").removeClass('text-invalid');
}

function allTrue(obj) {
    for(var o in obj)
        if(!obj[o]) return false;
    return true;
}

//Dirty hack for require working properly
MaterialTextfield.prototype.checkValidity = function () {
    if (this.input_.validity.valid) {
        this.element_.classList.remove(this.CssClasses_.IS_INVALID);
    } else {
        if (this.element_.getElementsByTagName('input')[0].value.length > 0) {
            this.element_.classList.add(this.CssClasses_.IS_INVALID);
        }
    }
};