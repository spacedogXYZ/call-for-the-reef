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

    input.next('.input-icon')
        .removeClass('icon-mobile')
        .removeClass('icon-phone')
        .removeClass('icon-help-circled')
        .removeClass('error')
        .removeClass('valid');
    input.siblings('.help-text').text('');

    var val = cleanPhoneAUS(input.val());
    var isMobile = /^04[0-9, ]{1,10}$/.test(val);
    var isLandline = /^0[^4][0-9, ]{1,9}$/.test(val);

    if (isMobile) {
        input.next('.input-icon').addClass('icon-mobile').addClass('valid');
        return true;
    } else if (isLandline) {
        input.next('.input-icon').addClass('icon-phone').addClass('valid');
        return true;
    } else {
        input.next('.input-icon').addClass('icon-help-circled').addClass('error');
        input.siblings('.help-text').text('Please ensure this is a valid Australian phone number, with area code.');
        return false;
    }
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var trackEvent = function(ev) {
    window['optimizely'] = window['optimizely'] || [];
    window.optimizely.push(["trackEvent", ev]);

    ga('send', 'event', ev);
};

$(document).ready(function() {
    $('a#faq-toggle').click(function() {
        $('div.faq').slideToggle();
    });

    $('input#phone').formatter({
      'patterns': [
            { '^04[0-9, ]{1,9}$': '{{9999}} {{999}} {{999}}' },
            { '^0[^4][0-9, ]{1,9}$': '({{99}}) {{9999}} {{9999}}' },
            { '*': '{{**********}}' },
        ]
    });

    $('input#phone').blur(checkPhoneInputAUS);

    $('#phoneForm').submit(function(e) {
        e.preventDefault();

        $('input#phone').trigger('blur');
        var phone = cleanPhoneAUS($('input#phone').val());

        if (!phone || !checkPhoneInputAUS($('input#phone'))) {
            return $('input#phone').siblings('.help-text').text('Please enter an Australian phone number');
        }

        var data = {
            campaignId: 2,
            userPhone: phone
        };

        // $.ajax({
        //     url: 'http://sumofus.callpower.org/call/create',
        //     type: "get",
        //     dataType: "json",
        //     data: data,
        //     success: function(res) {
        //         trackEvent('call-power');
        //     }
        // });
        $('.overlay').css('display', 'table');
        setTimeout(function() {
            $('.overlay').addClass('visible');
            setTimeout(function() {
                $('.overlay .inner').addClass('visible');
            }, 10);
        }, 100);
    });

    $('.close').click(function() {
      $('.overlay').css('display','none');
    });
});