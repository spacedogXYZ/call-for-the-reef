function cleanPhoneAUS(num) {
    // remove country code
    num = num.replace("+61", "");
    // remove spaces, parens
    num = num.replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
    // remove plus, dash
    num = num.replace("+", "").replace(/\-/g, '');

    if (num.length != 10)
        return false;

    return num;
}

function checkPhoneInputAUS(input) {
    $(this).next('.input-icon')
        .removeClass('icon-mobile')
        .removeClass('icon-phone')
        .removeClass('icon-help-circled')
        .removeClass('error')
        .removeClass('valid');
    $(this).siblings('.help-text').text('');

    var val = cleanPhoneAUS($(this).val());
    var isMobile = /^04[0-9, ]{1,10}$/.test(val);
    var isLandline = /^0[^4][0-9, ]{1,9}$/.test(val);

    if (isMobile) {
        $(this).next('.input-icon').addClass('icon-mobile').addClass('valid');
    } else if (isLandline) {
        $(this).next('.input-icon').addClass('icon-phone').addClass('valid');
    } else {
        $(this).next('.input-icon').addClass('icon-help-circled').addClass('error');
        $(this).siblings('.help-text').text('Please ensure this is a valid Australian phone number, with area code.');
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
        var phone = cleanPhoneAUS($('#phone').val());

        if (!phone) {
            return alert('Please enter a valid Australian phone number');
        }

        var data = {
            campaignId: 'demo',
            userPhone: phone,
            zipcode: '00000'
        };

        // $.ajax({
        //     url: 'http://demo.callpower.org/call/create',
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