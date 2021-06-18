$(function () {

    var url = server_url + '/api';
    var token = $("meta[name='auth-token']").attr("content");

    new Vue({
        el: '#main-dashboard',
        data: {
            loading: false,
            searchQuery: '',
            searchQueryIsDirty: false,
            isCalculating: false,
            onlineUser: ''
        },
        created: function () {
            this.getOnlineUser();
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
            }
        },
        watch: {
            searchQuery: function () {
                this.searchQueryIsDirty = true
                this.expensiveOperation()
            }
        },
        methods: {
            getOnlineUser: function () {
                this.$http.get(url + '/auth/onlineUser', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'onlineUser', data.data);
                    })
                    .catch(function () {

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
