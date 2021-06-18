$(function () {

    var url = server_url;
    var socket = io.connect(server_url);

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
            areas: [],
            selectedProvince: '',
            selectedArea: '',
            disabled: true
        },
        created: function () {

            this.getConfiguration();

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
                        } else{
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
            getConfiguration: function () {
                this.$http.get(url + 'getFTPCOnfig')
                    .then(function (data) {

                        Vue.set(this, 'ftp_conf', data.data[0].ftp_config);
                        Vue.set(this, 'file_conf', data.data[0].file_config);
                    })
                    .catch(function () {

                    });


                this.$http.get(url + 'getProvince')
                    .then(function (data) {
                        Vue.set(this, 'provinces', data.data);
                    })
                    .catch(function () {

                    });
            },

            onChange: function () {
                this.options = this.options
            },
            saveArea: function () {
                var data = {
                    areaID: this.selectedArea,
                    areaName: $('#'+this.selectedArea).text(),
                    province: this.selectedProvince
                }
                this.$http.post(url + 'saveArea', data).then(function (response) {
                    console.log('Success!');
                    socket.emit('update', {command: 'refresh'});
                    swal({
                            title: "Proses Berhasil",
                            type: "info",
                            showCancelButton: false,
                            confirmButtonText: "Ok",
                            closeOnConfirm: false
                        },
                        function(){
                            location.reload()
                        });
                }, function (response) {
                    console.log('Error!:', response.data);
                });


            },
            saveFTP: function () {
                var data = {
                    ftpHost: this.selectedArea,
                    ftpPort: $('#'+this.selectedArea).text(),
                    ftpUsername: $('#'+this.selectedArea).text(),
                    ftpPassword: $('#'+this.selectedArea).text(),
                    ftpPath: $('#'+this.selectedArea).text(),
                }
                this.$http.post(url + 'saveFTP', data).then(function (response) {
                    console.log('Success!');
                    socket.emit('update', {command: 'refresh'});
                    swal({
                            title: "Proses Berhasil",
                            type: "info",
                            showCancelButton: false,
                            confirmButtonText: "Ok",
                            closeOnConfirm: false
                        },
                        function(){
                            location.reload()
                        });
                }, function (response) {
                    console.log('Error!:', response.data);
                });


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
