$(function () {

    var url = server_url;

    new Vue({
        el: '#main-show',
        data: {
            loading: false,
            searchQuery: '',
            searchQueryIsDirty: false,
            isCalculating: false,
            selectedProvince: 'Aceh',
            provinces: [],
            areas: [],
            user: {
                email: '',
                password: '',
                confirmPassword: '',
                name: '',
                areaID: ''
            },
            disabled: true
        },
        created: function () {

            this.getProvince();

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

                this.$http.get(url + 'api/area/list/' + this.selectedProvince)
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
                this.$http.get(url + 'api/province/list')
                    .then(function (data) {
                        Vue.set(this, 'provinces', data.data);
                    })
                    .catch(function () {

                    });
            },
            onChange: function () {
                this.options = this.options
            },
            saveUser: function () {
                this.$http.post(url + 'api/auth/register', this.user).then(function (response) {
                    swal({
                            title: "Registrasi Berhasil",
                            type: "info",
                            showCancelButton: false,
                            confirmButtonText: "Ok",
                            closeOnConfirm: false
                        },
                        function () {
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
