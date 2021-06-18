$(document).ready(function () {
    var timer = 65000;
    var speedSlide = 1000;
    var currentSlide = 1;
    var totalSlide = $('.content_wrapper').children().length;
    var currentHour = new Date().getHours();
    var state = 1;
    var url = server_url;
    var mainTitle = '';

    checkSignage();

    $('.current-date-display').html(moment().locale('id').format("dddd, D MMMM YYYY"));

    var socket = io.connect(server_url);
    socket.on('news', function (data) {
        var url = server_url;
        location.reload();
    });

    socket.on('update', function (data) {
        location.reload();
    });

    loadMainConfiguration();
    loadSlide1(url, currentHour);
    loadSlide2(url, currentHour);
    loadSlide3(url);
    loadSlide4(url);
    getWarning();
    loadPerairanUtama(url);


});

function loadSlide1(url, currentHour) {
    $.ajax({
        url: url + "/getSlide1/" + currentHour,
        type: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: function (error) {
            console.log(error.responseText);
            if (error.responseText == '"No Data"') {
                swal({
                    title: "Belum Ada Area Terpilih",
                    text: "Silahkan Pilih Area Di Dashboard",
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ke Dashboard",
                    closeOnConfirm: false,
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            document.location = server_url + '/dashboard';
                        }
                    });
            }
        },
        success: function (msg) {



            if (msg === 'Gagal Update Slide') {

                $('body').html('<div style="background: #000; color: #fff; font-size: 200%; text-align: center; padding-top: 20%">Terjadi Gangguan Pada Display</div>')
            }

            var day = msg.time.substring(6);
            var month = msg.time.substring(4, 6);
            var year = msg.time.substring(0, 4);

            $('#area').html(msg.area.description);
            $('#current_weather_text').html(msg.currentTemp + '&deg; C');
            $('#current_weather_text_title').html(msg.currentWeatherText);
            $('#current_weather_img').html('<img src="/images/media/animated/' + msg.currentWeather + '.svg">');
            $('#max-temperature').html(msg.tempMaxToday + '&deg; C');
            $('#max-temperature-tomorrow').html(msg.tempMaxTomorrow + '&deg; C');
            $('#max-humidity').html(msg.humidMaxToday + '%');
            $('#max-humidity-tomorrow').html(msg.humidMaxTomorrow + '%');
            $('#min-temperature').html(msg.tempMinToday + '&deg; C');
            $('#min-temperature-tomorrow').html(msg.tempMinTomorrow + '&deg; C');
            $('#min-humidity').html(msg.humidMinToday + '%');
            $('#min-humidity-tomorrow').html(msg.humidMinTomorrow + '%');
            $('#wff-1').html(msg.wff1 + '&deg; C');
            $('#wff-2').html(msg.wff2 + '&deg; C');
            $('#wff-3').html(msg.wff3 + '&deg; C');
            $('#wff-4').html(msg.wff4 + '&deg; C');
            $('#wff-5').html(msg.wff5 + '&deg; C');
            $('#wff-6').html(msg.wff6 + '&deg; C');

            $('#wfp-1').html('<img src="/images/media/animated/' + msg.wfp1 + '.svg">');
            $('#wfp-2').html('<img src="/images/media/animated/' + msg.wfp2 + '.svg">');
            $('#wfp-3').html('<img src="/images/media/animated/' + msg.wfp3 + '.svg">');
            $('#wfp-4').html('<img src="/images/media/animated/' + msg.wfp4 + '.svg">');
            $('#wfp-5').html('<img src="/images/media/animated/' + msg.wfp5 + '.svg">');
            $('#wfp-6').html('<img src="/images/media/animated/' + msg.wfp6 + '.svg">');

            $('#hff-1').html(msg.hff1 + '%');
            $('#hff-2').html(msg.hff2 + '%');
            $('#hff-3').html(msg.hff3 + '%');
            $('#hff-4').html(msg.hff4 + '%');
            $('#hff-5').html(msg.hff5 + '%');
            $('#hff-6').html(msg.hff6 + '%');

            $('#wdf-1').html(msg.wdf1);
            $('#wdf-2').html(msg.wdf2);
            $('#wdf-3').html(msg.wdf3);
            $('#wdf-4').html(msg.wdf4);
            $('#wdf-5').html(msg.wdf5);
            $('#wdf-6').html(msg.wdf6);

            $('#wsf-1').html(msg.wsf1 + ' KPH');
            $('#wsf-2').html(msg.wsf2 + ' KPH');
            $('#wsf-3').html(msg.wsf3 + ' KPH');
            $('#wsf-4').html(msg.wsf4 + ' KPH');
            $('#wsf-5').html(msg.wsf5 + ' KPH');
            $('#wsf-6').html(msg.wsf6 + ' KPH');
            $('#slide1-date').html('Pemutakhiran Data ' + day + '-' + month + '-' + year);

        }
    });

}

function loadSlide2(url, currentHour) {

    $.ajax({
        url: url + "/getSlide2/" + currentHour,
        type: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: function (error) {
            console.log(error);
        },
        success: function (msg) {

            console.log(msg)
            if (msg === 'Gagal Update Slide') {

                $('body').html('<div style="height: 1090px; background: #000; color: #fff; font-size: 200%; text-align: center; padding-top: 20%">Terjadi Gangguan Pada Display</div>')
            }

            var val = '';
            var day = msg[0].time.substring(6);
            var month = msg[0].time.substring(4, 6);
            var year = msg[0].time.substring(0, 4);

            for (var i = 0; i < msg.length; i++) {
                val += '<tr>\n' +
                    '                    <td style="width: 15%">' + msg[i].areaName + '</td>\n' +
                    '                    <td style="width: 15%"><img src="/images/media/animated/' + msg[i].weatherToday + '.svg" width="135" height="135"/></td>\n' +
                    '                    <td style="width: 20%">' + msg[i].tempMinToday + '-' + msg[i].tempMaxToday + '</td>\n' +
                    '                    <td style="width: 20%">' + msg[i].humidMinToday + '-' + msg[i].humidMaxToday + '</td>\n' +
                    '                    <td style="width: 25%">' + msg[i].windSpeed + '   ' + msg[i].windDir + '</td>\n' +
                    '                    <td style="width: 20%"><img src="/images/media/animated/' + msg[i].weatherTomorrow + '.svg" width="135" height="135" /></td>\n' +
                    '                </tr>';


            }

            $('#province-title').html('Provinsi ' + msg[0].province);
            $('#province-weather-list').html(val);
            $("#province-weather-list").scroller();
            $('#slide2-date').html('Pemutakhiran Data ' + day + '-' + month + '-' + year);

        }
    });

}

function loadSlide3(url) {
    $.ajax({
        url: url + "/getSlide3",
        type: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: function (error) {
            console.log(error);
        },
        success: function (msg) {
            var val = '';
            var date = msg.publicationDate;

            if (msg === 'Gagal Update Slide') {

                $('body').html('<div style="height: 1090px; background: #000; color: #fff; font-size: 200%; text-align: center; padding-top: 20%">Terjadi Gangguan Pada Display</div>')
            }


            $('#date-perairan').html('Pemutakhiran Data ' + date);

            var list = '';
            var potensi = '';
            for (var i = 0; i < msg.value.length; i++) {

                potensi = msg.value[i].status[0];
                if (potensi == 'Aman') {
                    potensi = '<div class="blue-tag">Aman</div>';
                } else {
                    potensi = '<div class="red-tag">Tidak Aman</div>';
                }


                list += '<div class="perairan-table">\n' +
                    '\n' +
                    '                <div class="perairan-table-title blue-tag" style="border-radius: 20px 20px 0 0;">\n' +
                    '                    ' + msg.value[i].Wilayah[0] + '\n' +
                    '                </div>\n' +
                    '\n' +
                    '                <div class="perairan-table-details">\n' +
                    '                    ' + msg.value[i].Cuaca[0] + ' \n' +
                    '                </div>\n' +
                    '                <div class="perairan-table-details">\n' +
                    '                    ' + msg.value[i].Angin_Knot[0] + ' KPH \n' +
                    '                </div>\n' +
                    '\n' +
                    '                <div class="perairan-table-details">\n' +
                    '                   ' + msg.value[i].Arah_Angin[0] + ' \n' +
                    '                </div>\n' +
                    '\n' +
                    '                <div class="perairan-table-details no-border-bottom">\n' +
                    '                    ' + msg.value[i].Gelombang_Rata[0] + ' m \n' +
                    '                </div>\n' +
                    '\n' +
                    '            </div>'
            }

            $('.perairan-table-wrapper').html(list);
            $(".perairan-table-wrapper").scroller();


        }
    });

}

function loadSlide4(url) {
    $.ajax({
        url: url + "/getSlide4",
        type: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: function (error) {
            console.log(error);
        },
        success: function (msg) {

            if (msg === 'Gagal Update Slide') {

                $('body').html('<div style="height: 1090px; background: #000; color: #fff; font-size: 200%; text-align: center; padding-top: 20%">Terjadi Gangguan Pada Display</div>')
            }

            var val = '';

            var date = msg[0].Tanggal[0];
            var hour = msg[0].Jam[0];
            var point = msg[0].point[0].coordinates;
            var lintang = msg[0].Lintang[0];
            var bujur = msg[0].Bujur[0];
            var magnitude = msg[0].Magnitude[0];
            var kedalaman = msg[0].Kedalaman[0];
            var wil1 = msg[0].Wilayah1[0];
            var wil2 = msg[0].Wilayah2[0];
            var wil3 = msg[0].Wilayah3[0];
            var wil4 = msg[0].Wilayah4[0];
            var wil5 = msg[0].Wilayah5[0];
            var potensi = msg[0].Potensi[0];

            var today = new Date();
            var curDate = today.getDate();

            // if (curDate != date.split("-")[0]) {
            //     $('#slide-content-3').remove();
            // }

            if (potensi == 'tidak berpotensi TSUNAMI') {
                potensi = '<div class="blue-tag"><b>TIDAK BERPOTENSI</b> Tsunami</div>';
            } else {
                potensi = '<div class="red-tag"><b>BERPOTENSI</b> Tsunami</div>';
            }

            $('#date-gempa').html('');
            $('#waktu-gempa').html(hour + ' ' + date);
            $('#koordinat').html(point);
            $('#magnitude').html(magnitude);
            $('#kedalaman').html(kedalaman);
            $('#lintang').html(lintang);
            $('#bujur').html(bujur);
            $('#tsunami').html(potensi);
            $('#wilayah1').html(wil1);
            $('#wilayah2').html(wil2);
            $('#wilayah3').html(wil3);

            var timer = 35000;
            var speedSlide = 1000;

            loadSlides(speedSlide, timer);


        }
    });

}

function loadPerairanUtama(url) {
    $.ajax({
        url: url + "/getPerairanUtama",
        type: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: function (error) {
            console.log(error);
        },
        success: function (msg) {

            if (msg === 'Gagal Update Slide') {

                $('body').html('<div style="height: 1090px; background: #000; color: #fff; font-size: 200%; text-align: center; padding-top: 20%">Terjadi Gangguan Pada Display</div>')
            }

            var val = '';

            if (msg[0] != null) {
                $('#current_weather_text_title').append('<div class="nama-perairan-title">' + msg[0].Wilayah + '</div><div class="perairan-title">Tinggi Gelombang : ' + msg[0].Gelombang_Rata + ' m</div>');
            }




        }
    });

}

function checkSignage() {

    $.ajax({
        url: "/checkSignage",
        type: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: function (error) {
            console.log(error);
        },
        success: function (msg) {

            if (msg.text == 'No Result Found') {
                window.location = '/registerSignage'
            }


        }
    });

}

function getWarning() {

    $.ajax({
        url: "/getWarning",
        type: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: function (error) {

            console.log(error);
        },
        success: function (msg) {


            if (msg === 'Gagal Update Slide') {

                $('body').html('<div style="background: #000; color: #fff; font-size: 200%; text-align: center; padding-top: 20%">Terjadi Gangguan Pada Display</div>')
            }

            if (msg.toUpperCase() == 'NIL' || msg.toUpperCase() == '<STRONG>N I H I L</STRONG>' || msg.toUpperCase() == 'NIHIL' || msg.toUpperCase() == 'NIHIL.' || msg.toUpperCase() == 'NIL.' || msg.toUpperCase() == '-NIHIL-' || msg.toUpperCase() == '-NIL-') {
                $('.running-text').find('marquee').html('Badan Meteorologi Klimatologi Dan Geofisika');
            } else {

                $('.running-text').find('marquee').html(msg);
            }

        }
    });

}

function loadMainConfiguration() {
    $.ajax({
        url: "/loadMainConfiguration",
        type: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: function (error) {
            console.log(error);
        },
        success: function (msg) {
            if (msg.logo.length > 1) {
                $('.logo_wrapper').append('<div class="logo_img" id="logo-2"><img src="/activeSignage/' + msg.logo[1] + '"/></div>');
            }
        }
    });
}

function loadSlides(speedSlide, timer) {

    $.ajax({
        url: "/loadSlides",
        type: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        error: function (error) {
            console.log(error);
        },
        success: function (msg) {



            var now = moment().locale('id').format("dddd, D-MMMM-YYYY");
            var currentSlide = 0;
            var state = 0;
            var playableSlide = [];

            $('#info-gempa-title').html(msg[3].title);
            $('#info-perairan-title').html(msg[2].title);
            $('.slideshow-background').html('')
            for (var i = 0; i < msg.length; i++) {
                var slideNum = i + 1;
                if (msg[i].image !== undefined) {


                    var content = '<div class="slide-content" id="slide-content-' + slideNum + '" slide-status="false">\n' +
                        '        <div class="main-title">\n' +
                        '         ' + msg[i].title +
                        '        </div>\n' +
                        ' <div class="sub-title-1 border_top"> \n' +
                        '<div class="current-date-display"></div> \n' +
                        '</div>\n' +
                        '        <div class="image-content ffmc">\n' +
                        '            <img src="/activeSignage/' + msg[i].image + '" />\n' +
                        '        </div>\n' +
                        '\n' +
                        '        <div class="clearfix"></div>\n' +
                        '\n' +
                        '    </div>';
                }

                if (i > 1) {
                    $('#slide-content-' + i).attr('slide-status', msg[i].status);
                    $('#slide-content-' + i).find('.main-title').html(msg[i].title);
                    $('#slide-content-' + i).find('.image-content').html('<img src="/activeSignage/' + msg[i].image + '" />');
                    $('.content_wrapper').append(content);
                }


                // if (msg[i].overlay == true) {
                //     $('.slideshow-background').append('<div id="slide-' + i + '">\n' +
                //         '\n' +
                //         '    <div class="background">\n' +
                //         '        <img src="/activeSignage/' + msg[i].background_img + '" />\n' +
                //         '        <div class="overlay"></div>\n' +
                //         '    </div>\n' +
                //         '\n' +
                //         '</div>')
                // } else {

                //     $('.slideshow-background').append('<div id="slide-' + i + '">\n' +
                //         '\n' +
                //         '    <div class="background">\n' +
                //         '        <img src="/activeSignage/' + msg[i].background_img + '" />\n' +
                //         '    </div>\n' +
                //         '\n' +
                //         '</div>')
                // }

            }


            $('.slideshow-background').append('<div id="slide-' + i + '">\n' +
                '\n' +
                '    <div class="background">\n' +
                '        <img src="/activeSignage/' + msg[0].background_img + '" />\n' +
                '        <div class="overlay"></div>\n' +
                '    </div>\n' +
                '\n' +
                '</div>')

            $('.current-date-display').html(moment().locale('id').format("dddd, D MMMM YYYY"));
            var day = $('.current-date-display').html().split(' ')[0];
            var date = $('.current-date-display').html().split(' ')[1];
            var jam = $('.current-date-display').html().split(' ')[2];




            $('#date').html(now);
            $('#date-2').html(now);

            //   setTimeout(function() {
            //     $('.slideshow-background').slick({
            //       arrows: false,
            //       infinite: true,
            //       adaptiveHeight: true,
            //       autoplay: true,
            //       speed: speedSlide,
            //       autoplaySpeed: timer
            //   });
            // }, 1000);



            var localTimer = '35000';


            setInterval(function () {

                if (currentSlide == 0) {
                    timer = 55000
                } else {
                    timer = 35000
                }


                if (currentSlide < totalSlide - 1) {
                    $('#' + playableSlide[currentSlide]).removeClass('active').fadeOut('slow');
                    currentSlide++;
                } else {
                    $('#' + playableSlide[currentSlide]).removeClass('active').fadeOut('slow');
                    currentSlide = 0;
                }

                $('#' + playableSlide[currentSlide]).addClass('active').fadeIn('slow');




            }, timer + speedSlide);


            $('.content_wrapper').find('.slide-content').each(function () {
                if ($(this).attr('slide-status') == 'false') {
                    $(this).remove();
                }
            })

            $('.content_wrapper').find('.slide-content').each(function (key) {
                playableSlide.push($(this).attr('id'));
            })



            var totalSlide = playableSlide.length;




        }
    });

}
