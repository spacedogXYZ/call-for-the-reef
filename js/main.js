function validatePhone(num) {
        num = num.replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '');
        num = num.replace("+", "").replace(/\-/g, '');

        if (num.charAt(0) == "1")
            num = num.substr(1);

        if (num.length != 10)
            return false;

        return num;
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
    $('#phoneForm').submit(function(e) {
        e.preventDefault();
        var phone = $('#phone').val();

        if (!validatePhone(phone))
            return alert('Please enter a valid phone number!');

        var data = {
            campaignId: 'demo',
            userPhone: validatePhone(phone),
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