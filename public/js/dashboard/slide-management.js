$(function () {

    var url = server_url + '/api';
    var socket = io.connect(server_url);
    var token = $("meta[name='auth-token']").attr("content");

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
            perairan: false,
            dataPerairan: [],
            wilayahPerairan: [],
            signage: {
                name: '',
                province: '',
                area_id: '',
                display_status: false,
                perairan: '',
                wilayahPerairan: []
            },
            disabled: true
        },
        created: function () {
            this.getProvince();
            this.listSignage();
        },
        computed: {
            searchIndicator: function () {
                if (this.isCalculating) {
                    return ''
                } else if (this.searchQueryIsDirty) {
                    return ''
                } else {
                    return ''
                }
            },
            validation: function () {
                return {
                    firstName: !!this.newData.firstName.trim()
                }
            },

            isValid: function () {
                var validation = this.validation
                return Object.keys(validation).every(function (key) {
                    return validation[key]
                })
            },
            options: function () {

                var options = ''

                this.$http.get(url + '/area/list/' + this.signage.province)
                    .then(function (data) {
                        if (Object.keys(data.data).length != 0) {
                            Vue.set(this, 'areas', data.data);
                            this.disabled = false;
                        } else {
                            swal('Area Belum Terdaftar, Harap Kontak Administrator');
                        }
                    })
                    .catch(function () {

                    });

                return options

            }
        },
        watch: {
            searchQuery: function () {
                this.searchQueryIsDirty = true
                this.expensiveOperation()
            }
        },
        methods: {
            getProvince: function () {
                this.$http.get(url + '/province/list')
                    .then(function (data) {
                        Vue.set(this, 'provinces', data.data);
                    })
                    .catch(function () {

                    });
            },
            listSignage: function () {
                this.$http.get(url + '/signage/list?id=59a981b19389432094cd3f85', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'displays', data.data);
                        console.log(data);
                    }, function (error) {
                        swal(error.data)
                    })
                    .catch(function (e) {
                        console.log(e);
                    });
            },
            lsFTP: function () {
                this.$http.get(url + '/ftp/lsFTP', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        console.log(data);
                    }, function (error) {
                        swal(error.data)
                    })
                    .catch(function (e) {
                        console.log(e);
                    });
            },
            saveDisplay: function () {
                this.loading = true;
                this.$http.post(url + '/signage/', this.signage, {
                    headers: {
                        Authorization: token
                    }
                }).then(function (response) {
                    this.loading = false;
                    var status = '';
                    for(var i=0; i < response.data.length; i++){

                        if(response.data[i].status == true){
                            status += response.data[i].file+' Berhasil diunduh <br/>';
                        } else{
                            status += response.data[i].file+' Gagal diunduh <br/>';
                        }
                    }
                    console.log(status);
                    swal({
                        title: "Registrasi Berhasil",
                        html: status,
                        type: "info",
                        showCancelButton: false,
                        confirmButtonText: "Ok"
                    }).then(function () {
                        location.reload();
                    });
                }, function (response) {
                    console.log('Error!:', response.data);
                });
            },
            loadPerairan: function () {
                this.loading = true;
                if (this.perairan == true) {
                    this.$http.get(url + '/signage/perairan', {
                        headers: {
                            Authorization: token
                        }
                    }).then(function (response) {
                        Vue.set(this, 'dataPerairan', response.data.Wilayah_Perairan.Data[0].Row);
                        this.loading = false;
                    }, function (response) {


                        swal({
                            title: "Error loading perairan",
                            type: "danger",
                            showCancelButton: false,
                            confirmButtonText: "Ok"
                        }).then(function () {
                            location.reload();
                        });
                        this.loading = false;
                    });
                }
            },
            onChange: function () {
                this.options = this.options
            },
            edit: function (id) {
                window.location = '/slideEdit?token=' + token + '&id=' + id
            },
            remove: function (id, areaID, name) {
                Vue.http.interceptors.push(function (request, next) {

                    // modify method
                    request.method = 'DELETE';

                    // modify headers
                    request.headers.set('Authorization', token);

                    // continue to next interceptor
                    next();
                });


                var data = {
                    body: {
                        signageID: id,
                        areaID: areaID,
                        name: name
                    }
                }

                swal({
                    title: 'Anda yakin?',
                    text: "Display anda akan hilang",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ya!'
                }).then(function () {
                    Vue.http.delete(url + '/signage', data).then(function (response) {
                        swal(
                            'Deleted!',
                            'Your file has been deleted.',
                            'success'
                        )
                        location.reload();
                    }, function (response) {
                        swal(
                            'Failed To Delete!',
                            response,
                            'success'
                        )
                    });


                })
            },
            showModal: function (modal, title, id) {
                this.selectedTitle = title;
                this.selectedID = id;
                if (modal == 'viewProvince') {
                    this.areas = []
                    this.getArea();
                }

                $('#' + modal).modal('show');
            },

            expensiveOperation: _.debounce(function () {
                this.isCalculating = true
                this.values = [];
                setTimeout(function () {
                    this.$http({
                        url: '/dashboard-invitation?name=' + this.searchQuery,
                        method: 'GET'
                    }).then(function (response) {
                        this.$set(this, 'values', response.data.data);
                        this.isCalculating = false
                        this.searchQueryIsDirty = false
                        console.log(response.data.data);
                    }, function (response) {
                        // error callback
                    });

                }.bind(this), 500)
            }, 500)

        },
    })
    ;

});

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function loadProvince(url) {

}
