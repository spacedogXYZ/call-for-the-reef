function cleanPhoneUS(num) {
    // remove country code
    num = num.replace("+1", "");
    // remove spaces, parens
    num = num.replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
    // remove plus, dash
    num = num.replace("+", "").replace(/\-/g, '');

    if (!parseInt(num) || (num.length != 10)) {
        return false;
    }

    return num;
}

function checkPhoneInputUS(param) {
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

    var val = cleanPhoneUS(input.val());
    var isValid = /^[0-9,/(/) ]{1,10}$/.test(val);

    if (isValid) {
        inputIcon.addClass('icon-phone').addClass('valid');
        $('input[name=phone_type]').val('home');
        return true;
    } else {
        inputIcon.addClass('icon-help-circled').addClass('error');
        helpText.text('Please ensure this is a valid US phone number with area code.');
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

                $('.overlay .inner.scroll').jScrollPane({
                    showArrows: true
                });

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

    // live US phone formatter
    $('input#id_phone').formatter({
      'pattern': '({{999}})-{{999}}-{{9999}}',
    });
    $('input#id_phone').blur(checkPhoneInputUS);
    $('input#id_email').blur(checkEmail);

    // call form submit
    $('#callForm').submit(function(e) {
        e.preventDefault();

        $('input#id_phone').trigger('blur');
        var userPhone = cleanPhoneUS($('input#id_phone').val());
        var userCountry = 'US';
        var validPhone = userPhone && checkPhoneInputUS($('input#id_phone'));

        $('input#id_email').trigger('blur');
        var validEmail = checkEmail($('input#id_email'));

        if (!validPhone || !validEmail) {
            return false;
        }
        
        var callData = {
            'campaignId': 2,
            'userPhone': userPhone,
            'userCountry': userCountry
        };
        $.getJSON('http://sumofus.callpower.org/call/create', callData,
            function(response) {
                trackEvent('call-placed');
                $('.script').html(response.script);
                showOverlay();
                $('button[type="submit"]').html('Thanks <i class="icon-ok-circled">')
                    .addClass('complete')
                    .attr('disabled', 'disabled');

                $.post('/submit', $('#callForm').serialize(),
                    function(response) {
                        trackEvent('ak-submit');
                    }
                );
            }
        );
        $('button[type="submit"]').html('Calling <i class="icon-spin animate-spin">');

        
    });
});