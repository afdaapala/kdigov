$(function () {

    var url = server_url + '/api';
    var socket = io.connect(server_url);
    var token = $("meta[name='auth-token']").attr("content");
    var pathname = window.location.search.split('&id=')[1];


    new Vue({
        el: '#main-show',
        data: {
            loading: false,
            searchQuery: '',
            searchQueryIsDirty: false,
            isCalculating: false,
            displays:[],
            image_path: 'data/',
            file:'',
            products: [],
            uploadFile: '',
            selectedProduct: '',
            currentSlideID: '0',
            dataPerairan: [],
            perairan: false,
            signage:{
                name:'',
                logo: [],
                sync_time: '',
                timer: '',
                folder: ''
            },
            editSlide:{
                signageID: '',
                id: '',
                title: '',
                area_id: '',
                background_img: '',
                overlay: false,
                perairan: ''
            },
            newSlide: {
                signageID: '',
                title: '',
                area_id: '',
                background_img: '',
                overlay: ''
            },
            hours: [],
            image: '',
            disabled: true
        },
        created: function () {
           this.getSlide();
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

                this.$http.get(url + '/area/list/' + this.selectedProvince)
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
            getSlide: function () {
                this.$http.get(url + '/signage/'+pathname, {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'displays', data.data[0]);
                        this.image_path = '/configFile/'+this.displays.folder+'/';
                    }, function (error) {
                        swal(error.data)
                        window.location = '/login';
                    })
                    .catch(function (e) {
                        console.log(e);
                    });

                for(var i=1; i <=24 ; i++){
                    this.hours.push(i);
                }
            },
            getMeteoProduct: function () {
                this.$http.get(url + '/ftp/lsFTP', {
                    headers: {
                        Authorization: token
                    }
                })
                    .then(function (data) {
                        Vue.set(this, 'products', data.data);
                        console.log(this.products);
                    }, function (error) {
                        swal(error.data)
                    //    window.location = '/login';
                    })
                    .catch(function (e) {
                        console.log(e);
                    });

                for(var i=1; i <=24 ; i++){
                    this.hours.push(i);
                }
            },
            updateMainSlide: function (id) {
                if (this.uploadFile.length != 0) {
                    this.displays.logo_2 = 'logo2';
                } else{
                    this.displays.logo_2 = '';
                }


                this.$http.put(url + '/signage/updateMainSlide', this.displays, {
                    headers: {
                        Authorization: token
                    }
                }).then(function (response) {

                    if (this.uploadFile.length != 0) {
                        var data = new FormData();
                        data.append('file', this.uploadFile[0]);
                        data.append('newPath', '/configFile/' + this.displays.folder);
                        data.append('name', 'logo2');
                        this.file = data;

                        this.$http.post(url + '/lib/upload', this.file, {
                            headers: {
                                Authorization: token
                            }
                        }).then(function (response) {
                            swal({
                                title: "Update Berhasil",
                                type: "info",
                                showCancelButton: false,
                                confirmButtonText: "Ok",
                            }).then(function () {
                                location.reload();
                            });
                        }, function (response) {
                            swal({
                                title: "Terjadi Masalah",
                                type: "danger",
                                showCancelButton: false,
                                confirmButtonText: "Ok",
                            }).then(function () {
                                location.reload();
                            });
                        });
                    } else{
                        swal({
                            title: "Update Berhasil",
                            type: "info",
                            showCancelButton: false,
                            confirmButtonText: "Ok",
                        }).then(function () {
                            location.reload();
                        });

                    }

                }, function (response) {
                    swal({
                        title: "Terjadi Masalah",
                        type: "danger",
                        showCancelButton: false,
                        confirmButtonText: "Ok",
                    }).then(function () {
                        location.reload();
                    });
                });


            },
            updateSlide: function (id) {

                this.editSlide.signageID = id;
                if (this.uploadFile.length != 0) {
                    this.editSlide.background_img = 'slide-'+this.editSlide.id;
                } else{
                    this.editSlide.background_img = 'default';
                }

                this.$http.put(url + '/signage/updateSlide', this.editSlide, {
                    headers: {
                        Authorization: token
                    }
                }).then(function (response) {

                    if (this.editSlide.background_img != 'default') {
                        var data = new FormData();
                        data.append('file', this.uploadFile[0]);
                        data.append('newPath', '/configFile/' + this.displays.folder);
                        data.append('name', 'slide-'+this.editSlide.id+'.'+this.uploadFile[0].type.substring('/'));
                        this.file = data;

                        this.$http.post(url + '/lib/upload', this.file, {
                            headers: {
                                Authorization: token
                            }
                        }).then(function (response) {
                            swal({
                                title: "Update Berhasil",
                                type: "info",
                                showCancelButton: false,
                                confirmButtonText: "Ok",
                            }).then(function () {
                                location.reload();
                            });
                        }, function (response) {
                            swal({
                                title: "Terjadi Masalah",
                                type: "danger",
                                showCancelButton: false,
                                confirmButtonText: "Ok",
                            }).then(function () {
                                location.reload();
                            });
                        });
                    } else{
                        swal({
                            title: "Update Berhasil",
                            type: "info",
                            showCancelButton: false,
                            confirmButtonText: "Ok",
                        }).then(function () {
                            location.reload();
                        });

                    }
                }, function (response) {
                    swal({
                            title: "Terjadi Masalah",
                            type: "danger",
                            showCancelButton: false,
                            confirmButtonText: "Ok",
                        }).then(function () {
                        location.reload();
                    });
                });


            },
            loadPerairan: function () {
                    this.$http.get(url + '/signage/perairan', {
                        headers: {
                            Authorization: token
                        }
                    }).then(function (response) {
                        console.log(response);
                        Vue.set(this, 'dataPerairan', response.data.Wilayah_Perairan.Data[0].Row);
                        console.log(this.dataPerairan);
                    }, function (response) {
                        console.log('Error!:', response.data);
                    });

            },
            uploadPhoto: function () {
                var slideNum = this.displays.slides.length+1;
                var data = new FormData();
                data.append('file', this.uploadFile[0]);
                data.append('newPath', '/configFile/'+this.displays.folder);
                data.append('name', 'slide-'+slideNum);
                this.file = data;
                this.$http.post(url + '/lib/upload', this.file, {
                    headers: {
                        Authorization: token
                    }
                }).then(function (response) {
                    console.log(response);
                }, function (response) {
                    console.log('Error!:', response.data);
                });

                this.addSlide();


            },
            addSlide: function () {
                var slideNumber = this.displays.slides.length + 1;
                this.newSlide.background_img = 'slide-'+slideNumber;
                this.newSlide.signageID = this.displays._id;

                this.$http.post(url + '/signage/slide', this.newSlide, {
                    headers: {
                        Authorization: token
                    }
                }).then(function (response) {
                    swal({
                            title: "Penambahan Slide Berhasil",
                            type: "info",
                            showCancelButton: false,
                            confirmButtonText: "Ok"
                        }).then(function () {
                        location.reload();
                    });
                }, function (response) {
                    swal({
                            title: "Terjadi Masalah Dalam Penambahan Slide",
                            type: "danger",
                            showCancelButton: false,
                            confirmButtonText: "Ok",
                        }).then(function () {
                        location.reload();
                    });
                });


            },
            onChange: function () {
                this.options = this.options
            },
            onFileChange: function (e,fileID) {
                var slideNum = this.displays.slides.length+1;
                var files = e.target.files || e.dataTransfer.files;
                this.uploadFile = files;
                this.fileName = files;
                if (!files.length)
                    return;
                this.createImage(files[0],files[0].name);
            },
            createImage(file, fileName) {
                this.signage.logo_1 = [];
                var image = new Image();
                var reader = new FileReader();
                var vm = this;

                reader.onload = (e) => {
                    vm.image = e.target.result;
                };
                reader.readAsDataURL(file);

            },removeImage: function (e) {
                this.image = '';
            },
            edit: function (id) {
                window.location = '/slideEdit?token='+token+'&id='+id
            },
            showModal: function (id,modal) {

                if (modal == 'editSlide') {


                    if(this.displays.slides[id].wilayahPerairan != null){
                        this.editSlide.perairan = this.displays.slides[id].wilayahPerairan;
                        this.perairan = true;
                    } else{
                        this.editSlide.perairan = '';
                        this.perairan = false;
                    }

                    this.loadPerairan();
                    this.editSlide.title = this.displays.slides[id].title;
                    this.editSlide.overlay = this.displays.slides[id].overlay;
                    this.editSlide.background_img = this.displays.slides[id].background_img;
                    this.editSlide.id = id;

                } else if (modal == 'createSlide') {
                    this.newSlide.area_id = id
                    this.getMeteoProduct();
                }

                $('#' + modal).modal('show');
            },
            updateSlideStatus: function (signageID, id) {

                if(id > 8) {

                    Vue.http.interceptors.push(function (request, next) {

                        // modify method
                        request.method = 'POST';

                        // modify headers
                        request.headers.set('Authorization', token);

                        // continue to next interceptor
                        next();
                    });


                    var data = {
                        signageID: this.displays._id,
                        key: id
                    }

                    swal({
                        title: 'Anda yakin?',
                        text: "File anda akan hilang",
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Ya!'
                    }).then(function () {
                        console.log(data)
                        Vue.http.post(url + '/signage/removeSlide', data).then(function (response) {
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
                } else{


                    this.$http.get(url+'/signage/updateSlideStatus?signageID='+signageID+'&slideID='+ id, {
                        headers: {
                            Authorization: token
                        }
                    })
                        .then(function (data) {
                            swal({
                                title: "Update Status berhasil",
                                type: "info",
                                showCancelButton: false,
                                confirmButtonText: "Ok"
                            }).then(function () {
                                location.reload();
                            });
                        }, function (error) {
                            swal(error.data)
                            //    window.location = '/login';
                        })
                        .catch(function (e) {
                            console.log(e);
                        });


                }
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
