function cleanPhoneAUS(num) {
    // remove country code
    num = num.replace("+61", "");
    // remove spaces, parens
    num = num.replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
    // remove plus, dash
    num = num.replace("+", "").replace(/\-/g, '');

    if (!parseInt(num) || (num.length != 10)) {
        return false;
    }

    return num;
}

function checkPhoneInputAUS(param) {
    // let this function be used for events and direct inputs
    input = param.target ? $(param.target): param;

    var inputIcon = input.siblings('.input-icon');
    inputIcon
        .removeClass('icon-mobile')
        .removeClass('icon-phone')
        .removeClass('icon-help-circled')
        .removeClass('error')
        .removeClass('valid');
    var helpText = input.siblings('.help-text').text('');

    var val = cleanPhoneAUS(input.val());
    var isMobile = /^04[0-9, ]{1,10}$/.test(val);
    var isLandline = /^0[^4][0-9, ]{1,9}$/.test(val);

    if (isMobile) {
        inputIcon.addClass('icon-mobile').addClass('valid');
        return true;
    } else if (isLandline) {
        inputIcon.addClass('icon-phone').addClass('valid');
        return true;
    } else {
        inputIcon.addClass('icon-help-circled').addClass('error');
        helpText.text('Please ensure this is a valid Australian phone number, with area code.');
        return false;
    }
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function checkEmail(param) {
    input = param.target ? $(param.target): param;

    var inputIcon = input.siblings('.input-icon');
    inputIcon
        .removeClass('icon-help-circled')
        .removeClass('icon-ok-circled')
        .removeClass('error')
        .removeClass('valid');
    var helpText = input.siblings('.help-text').text('');

    if (validateEmail(input.val())) {
            inputIcon.addClass('icon-ok-circled').addClass('valid');
            return true;
    } else {
            inputIcon.addClass('icon-help-circled').addClass('error');
            helpText.text('Please enter your email');
            return false;
    }
}

function showOverlay() {
    $('.overlay').css('display', 'table');
        setTimeout(function() {
            $('.overlay').addClass('visible');
            setTimeout(function() {
                $('.overlay .inner').addClass('visible');
            }, 10);
        }, 100);

    $('.overlay .close').click(function() {
        $('.overlay').css('display','none');
    });
}

var trackEvent = function(ev) {
    window['optimizely'] = window['optimizely'] || [];
    window.optimizely.push(["trackEvent", ev]);

    ga('send', 'event', ev);
};

$(document).ready(function() {
    // form prefill
    var akid = $.QueryString.akid;
    if (akid !== undefined && akid !== '') {
        $.getJSON('/prefill', {akid: akid}, function(data) {
            for (var field in data) {
                if (data[field]) {
                    $('input[name='+field+']').val(data[field]).trigger('blur');
                }
            }
        });
    }

    // setup faq toggle
    $('a#faq-toggle').click(function() {
        $('div.faq').slideToggle();
    });

    // live AUS phone formatter
    $('input#id_phone').formatter({
      'patterns': [
            { '^04[0-9, ]{1,9}$': '{{9999}} {{999}} {{999}}' },
            { '^0[^4][0-9, ]{1,9}$': '({{99}}) {{9999}} {{9999}}' },
            { '*': '{{**********}}' },
        ]
    });
    $('input#id_phone').blur(checkPhoneInputAUS);
    $('input#id_email').blur(checkEmail);

    // call form submit
    $('#callForm').submit(function(e) {
        e.preventDefault();

        $('input#id_phone').trigger('blur');
        var phone = cleanPhoneAUS($('input#id_phone').val());
        var allowIntl = $.QueryString['allowIntl'];
        var validPhone = phone && (checkPhoneInputAUS($('input#id_phone')) || allowIntl);

        $('input#id_email').trigger('blur');
        var validEmail = checkEmail($('input#id_email'));

        if (!validPhone || !validEmail) {
            return false;
        }
        
        var callData = {
            'campaignId': 1,
            'userPhone': phone,
            'userLocation': 'AU'
        };
        $.getJSON('http://sumofus.callpower.org/call/create', callData,
            function(response) {
                console.log(response);
                trackEvent('call-placed');
                showOverlay();
                $('button[type="submit"]').html('Thanks <i class="icon-ok-circled">')
                    .addClass('complete')
                    .attr('disabled', 'disabled');

                $.post('/submit', $('#callForm').serialize(),
                    function(response) {
                        console.log(response);
                        trackEvent('ak-submit');
                    }
                );
            }
        );
        $('button[type="submit"]').html('Calling <i class="icon-spin animate-spin">');

        
    });
});