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
            ftp_conf: {},
            file_conf: {},
            xmlFiles: [],
            provinces: [],
            users: [],
            areas: [],
            selectedProvince: '',
            selectedArea: '',
            totalProvince: '',
            totalArea: '',
            selectedTitle: '',
            selectedID: '',
            areaID: '',
            user: {
                name: '',
                email: '',
                password: '',
                confirm: '',
                role: 'administrator',
                areaID: ''
            },
            disabled: true
        },
        created: function () {
            this.getProvince();
            this.getFTP();
            this.listUser();

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

                this.$http.get(url + 'downloadXML/' + this.selectedProvince)
                    .then(function (data) {
                        console.log(data);
                        if (data = true) {
                            this.$http.get(url + 'getArea/' + this.selectedProvince)
                                .then(function (data) {
                                    Vue.set(this, 'areas', data.data);
                                    this.disabled = false;
                                })
                                .catch(function () {

                                });
                        } else {
                            swal('Terjadi Masalah Pada FTP, Harap Hubungi Admin')
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
                this.$http.get(url + '/province/count', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'totalProvince', data.data);
                    })
                    .catch(function () {

                    });

                this.$http.get(url + '/area/count', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'totalArea', data.data);
                    })
                    .catch(function () {

                    });

                this.$http.get(url + '/province/list', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'provinces', data.data);
                    })
                    .catch(function () {

                    });

                this.$http.get(url + '/area/areaName/Jakarta Pusat', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'areaID', data.data[0]._id);
                        this.user.areaID = this.areaID;
                        console.log(this.user)
                    })
                    .catch(function () {

                    });


            },
            getFTP: function () {
                this.$http.get(url + '/ftp/list', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'ftp_conf', data.data[0].ftp_config);
                    })
                    .catch(function () {

                    });

            },
            getArea: function () {
                this.$http.get(url + '/area/list/' + this.selectedTitle, {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'areas', data.data);
                    }, function (error) {
                        swal(error.data)
                    })
                    .catch(function (e) {
                        console.log(e);
                    });
            },
            listUser: function () {
                this.$http.get(url + '/user/list/', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        console.log(data.data);
                        Vue.set(this, 'users', data.data);
                    }, function (error) {
                        swal(error.data)
                    })
                    .catch(function (e) {
                        console.log(e);
                    });
            },
            syncArea: function (province) {
                this.loading = true;
                this.$http.get(url + '/area/syncArea/' + province, {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {

                        if (data.data.status != 500) {

                            swal({
                                title: "Proses Sync Berhasil",
                                type: "info",
                                showCancelButton: false,
                                confirmButtonText: "Ok"
                            }).then(function () {
                                location.reload();
                            });

                        } else {
                            swal({
                                title: "Proses Sync Gagal",
                                type: "danger",
                                showCancelButton: false,
                                confirmButtonText: "Ok"
                            }).then(function () {
                                location.reload();
                            });
                        }

                        this.loading = false;

                    }, function (error) {
                        swal(error.data)
                        this.loading = false;
                    })
                    .catch(function (e) {
                        console.log(e);
                        this.loading = false;
                    });
            },
            onChange: function () {
                this.options = this.options
            },
            saveFTP: function () {
                var data = {
                    ftpHost: this.selectedArea,
                    ftpPort: $('#' + this.selectedArea).text(),
                    ftpUsername: $('#' + this.selectedArea).text(),
                    ftpPassword: $('#' + this.selectedArea).text(),
                    ftpPath: $('#' + this.selectedArea).text(),
                }
                this.$http.post(url + '/ftp/saveFTP', data, {
                    headers: {
                        Authorization: token
                    }
                }).then(function (response) {
                    console.log('Success!');
                    socket.emit('update', {command: 'refresh'});
                    swal({
                        title: "Proses Berhasil",
                        type: "info",
                        showCancelButton: false,
                        confirmButtonText: "Ok",
                    }).then(function () {
                        location.reload();
                    });
                }, function (response) {
                    console.log('Error!:', response.data);
                });


            },
            saveUser: function () {
                console.log(this.user);
                this.$http.post(url + '/user/', this.user, {
                    headers: {
                        Authorization: token
                    }
                }).then(function (response) {
                    console.log('Success!');
                    swal({
                        title: "Proses Berhasil",
                        type: "info",
                        showCancelButton: false,
                        confirmButtonText: "Ok",
                    }).then(function () {
                        location.reload();
                    });
                }, function (response) {
                    console.log('Error!:', response.data);
                });


            },
            removeUser: function (id, areaID) {
                Vue.http.interceptors.push(function (request, next) {

                    // modify method
                    request.method = 'DELETE';

                    // modify headers
                    request.headers.set('Authorization', token);

                    // continue to next interceptor
                    next();
                });


                var data = {id: id}

                swal({
                    title: 'Anda yakin?',
                    text: "Display anda akan hilang",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ya!'
                }).then(function () {
                    Vue.http.delete(url + '/user/remove?id=' + id + '&areaID=' + areaID).then(function (response) {
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
