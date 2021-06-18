$(function () {

    var url = server_url;

    new Vue({
        el: '#main-show',
        data: {
            loading: false,
            searchQuery: '',
            searchQueryIsDirty: false,
            isCalculating: false,
            user: {},
            selectedProvince: 'Aceh',
            provinces: [],
            areas: [],
            email: '',
            password: '',
            disabled: true
        },
        created: function () {


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
            }
        },
        watch: {
            searchQuery: function () {
                this.searchQueryIsDirty = true
                this.expensiveOperation()
            }
        },
        methods: {

            login: function () {

                this.$http.post(url + 'api/auth/login', {
                    'email': this.email,
                    'password': this.password
                }).then(function (response) {
                    var token = response.data.token;
                    localStorage.setItem('token', token);
                    window.location = '/controlManagement?token='+token;
                }, function (error) {
                    console.log('Error!:', error.data);
                    //  location.reload('true');
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
