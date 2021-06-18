$(function() {

    var url = server_url;
    var url2 = client_url;

    new Vue({
        el: '#main-show',
        data: {
            loading: false,
            searchQuery: '',
            searchQueryIsDirty: false,
            isCalculating: false,
            selectedProvince: 'Aceh',
            selectedArea: '',
            provinces: [],
            areas: [],
            displays: [],
            keyID: '',
            signage: {
                id: ''
            },
            disabled: true
        },
        created: function() {
            this.checkConnection();
        },
        computed: {
            searchIndicator: function() {
                if (this.isCalculating) {
                    return ''
                } else if (this.searchQueryIsDirty) {
                    return ''
                } else {
                    return ''
                }
            },
            validation: function() {
                return {
                    firstName: !!this.newData.firstName.trim()
                }
            },

            isValid: function() {
                var validation = this.validation
                return Object.keys(validation).every(function(key) {
                    return validation[key]
                })
            },
            options: function() {

                var options = ''

                this.$http.get(url + '/api/area/list/' + this.selectedProvince)
                    .then(function(data) {
                        if (Object.keys(data.data).length != 0) {
                            Vue.set(this, 'areas', data.data);
                            this.disabled = false;
                        } else {
                            swal('Area Belum Terdaftar, Harap Kontak Administrator');
                        }
                    })
                    .catch(function() {

                    });

                return options

            },
            options2: function() {

                var options = ''

                this.$http.get(url + '/api/signage/listSignageByArea?id=' + this.selectedArea)
                    .then(function(data) {
                        if (Object.keys(data.data).length != 0) {
                            Vue.set(this, 'displays', data.data);
                            this.disabled = false;
                        } else {
                            swal('Area Belum Terdaftar, Harap Kontak Administrator');
                        }
                    })
                    .catch(function() {

                    });

                return options

            }
        },
        watch: {
            searchQuery: function() {
                this.searchQueryIsDirty = true
                this.expensiveOperation()
            }
        },
        methods: {
            checkConnection: function() {
                this.$http.get(url2 + '/checkConnection')
                    .then(function(data) {
                        if (data.data != "No Internet") {
                            this.getProvince();
                        } else {
                            swal({
                                title: "Tidak ada akses internet",
                                html: "Harap hubungkan PC ke Internet",
                                type: "info",
                                showCancelButton: false,
                                confirmButtonText: "Ok"
                            }).then(function() {
                                window.location = '/registerSignage';
                            });
                        }
                    })
                    .catch(function() {

                    });
            },
            getProvince: function() {
                this.$http.get(url + '/api/province/list', {}, {
                        headers: {
                            "Access-Control-Allow-Origin": true
                        },
                        crossOrigin: url + "/api/"
                    })
                    .then(function(data) {
                        Vue.set(this, 'provinces', data.data);
                    })
                    .catch(function() {

                    });
            },
            onChange: function() {
                this.options = this.options
            },
            onChange2: function() {
                this.options2 = this.options2
            },
            saveSignage: function() {
                this.loading = true;
                var province = $('#province-data option:selected').text();
                this.$http.post(url2 + '/activateSignage', { signage: this.displays[this.keyID], province: province }).then(function(response) {


                    this.$http.get(url2 + '/checkXML')
                        .then(function(data) {


                            this.$http.get(url2 + '/checkImage')
                                .then(function(data) {
                                    this.loading = false;
                                    swal({
                                        title: "Registrasi Berhasil",
                                        type: "info",
                                        showCancelButton: false,
                                        confirmButtonText: "Ok"
                                    }).then(function() {
                                        window.location = '/';
                                    });
                                })
                                .catch(function() {

                                });


                        })
                        .catch(function() {

                        });





                }, function(response) {
                    this.loading = false;
                    swal({
                        title: "Registrasi Gagal",
                        type: "info",
                        showCancelButton: false,
                        confirmButtonText: "Ok"
                    }).then(function() {
                        window.location = '/registerSignage';
                    });
                    console.log('Error!:', response.data);
                });

            },

            expensiveOperation: _.debounce(function() {
                this.isCalculating = true
                this.values = [];
                setTimeout(function() {
                    this.$http({
                        url: '/dashboard-invitation?name=' + this.searchQuery,
                        method: 'GET'
                    }).then(function(response) {
                        this.$set(this, 'values', response.data.data);
                        this.isCalculating = false
                        this.searchQueryIsDirty = false
                        console.log(response.data.data);
                    }, function(response) {
                        // error callback
                    });

                }.bind(this), 500)
            }, 500)

        },
    });

});