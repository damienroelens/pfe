'use strict';

/* Controllers */

angular.module('constatApp.controllers', [])
    .controller('mainCtrl', ['$scope', '$location', 'Context', 'User', '$rootScope', '$swipe', 'Loading',
        function($scope, $location, Context, User, $rootScope, $swipe, Loading) {
            //Masque le menu contextuel quand necessaire
            $('.overlay').hide();
            $scope.toggleAbout = function() {
                if ($('.overlay').is(':visible')) {
                    $('.overlay').fadeOut(200);
                } else {
                    $('.overlay').fadeIn(200);
                }
            }
            $scope.nextButton;
            $scope.forNext = function() {
                Context.next();
            };
            $scope.$watch(Context.next, function(newVal, oldVal) {
                $scope.nextButton = newVal;
            }); //Cache le bouton suivant quand il faut
            $scope.prevButton;
            $scope.forPrev = function() {
                Context.prev();
            };
            $scope.$watch(Context.prev, function(newVal, oldVal) {
                $scope.prevButton = newVal;
            }); //Cache le bouton suivant quand il faut
            $scope.nextView = function() {
                $scope.lo = '#' + Context.nextLoc();
                Loading.unset();
            }

            $scope.prevView = function() {
                $scope.lop = '#' + Context.prevLoc();
                Loading.unset();
            }

            $scope.saveUser = function() {
                var u = $location.path();
                if (u == '/profil' || u == '/profil/1' || u == '/profil/2') {
                    User.save();
                }
                if (u == '/declaration/map') {
                    User.savePosition();
                }
                if (u == '/declaration/dessin') {
                    navigator.notification.confirm('Vous allez quittez la page, votre croquis ne pourra plus être modifier dans ce constat', function() {}, 'Attention', 'Continuer,Annuler');
                    User.saveCanvas();
                }
                if (u == '/declaration/2') {
                    User.saveVoletA();
                }
                if (u == '/declaration/3') {
                    User.saveVoletB();
                }
                if (u == '/declaration/1') {
                    User.saveDataDay();
                }
                if (u == '/declaration/circons') {
                    User.saveCircons();
                }

            }
            $scope.apptitle = 'Constat d\'accident';
            $scope.getCategory = function() {
                Context.cat();
            };
            $scope.$watch(Context.cat, function(newTitle, oldTitle) {
                $scope.apptitle = newTitle;
            });
            //change le titre en fonction de la catégorie

            $('.contextMenu ul').css({
                width: $(window).width() * 0.9,
                height: $(window).height()
            });

            $scope.setTransition = function() {
                $rootScope.transite = 'active';
            }

        }
    ])
    .controller('mapCtrl', ['$scope', '$location', '$http', '$rootScope', 'Dispatch', 'Loading',
        function($scope, $location, $http, $rootScope, Dispatch, Loading) {
            $scope.loadMap = function(button) {

                $('#gmap').width($(window).width()).height($(window).height() - 48);

                $scope.gmap = L.map('gmap', {
                    zoomControl: false
                });
                $scope.gMarker = L.marker('', {
                    draggable: true
                });
                $scope.gPosition;

                Loading.set();

                navigator.geolocation.getCurrentPosition($scope.onSuccess, $scope.onErrors, {
                    timeout: 10000,
                    maximumAge: 3000,
                    enableHighAccuracy: true
                });

            }
            $scope.onSuccess = function(position) {
                $scope.gPosition = L.latLng(position.coords.latitude, position.coords.longitude);
                $scope.gmap.panTo($scope.gPosition);
                $scope.gmap.setZoom(17);
                L.tileLayer('http://{s}.tiles.mapbox.com/v3/roelensdam.idg4hnda/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="http://www.MapBox.com">MapBox</a>',
                    maxZoom: 18
                }).addTo($scope.gmap);
                $scope.gMarker.setLatLng($scope.gPosition);
                $scope.gMarker.addTo($scope.gmap);
                Loading.unset();
            }
            $scope.onErrors = function(errors) {
                navigator.geolocation.getCurrentPosition($scope.onSuccess, $scope.onErrors2, {
                    timeout: 10000,
                    maximumAge: 60000,
                    enableHighAccuracy: false
                });
            }
            $scope.onErrors2 = function(errors) {
                Loading.unset();
                navigator.notification.confirm('Votre position n\'a pu être définie, veuillez vérifier votre paramètres Internet', $scope.callback, 'Erreur', 'Réesayer,Annuler');
            }
            $scope.callback = function(button) {
                if (button == 1) {
                    Loading.set();
                    navigator.geolocation.getCurrentPosition($scope.onSuccess, $scope.onErrors, {
                        timeout: 10000,
                        maximumAge: 60000,
                        enableHighAccuracy: true
                    });
                } else {
                    $scope.$apply($location.path('/declaration/1'));
                }
            }

            $scope.loadMap();

            $rootScope.$on('savePosition', function() {
                $rootScope.position = $scope.gMarker.getLatLng();
                var getGeocoding = function(max) {
                    $http({
                        method: 'GET',
                        url: 'http://dev.virtualearth.net/REST/v1/Locations/' + $rootScope.position.lat + ',' + $rootScope.position.lng + '?o=json&key=AmYu1ctV5GfNllJLzLDKEaBAXHGvQrIYktr9aig6YEp2ZpAF9TIin2JECbp7WzdF',
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    }).
                    success(function(data, status, headers, config) {
                        //navigator.notification.alert('Success Geocoding : ' + data.resourceSets[0].resources[0].name, null, status, 'Ok');
                        $scope.temp = data.resourceSets[0].resources[0].name;
                        Dispatch.put($scope.temp);
                        Loading.set();
                    }).
                    error(function(data, status, headers, config) {

                        // this callback will be called asynchronously
                        // when the response is available
                        if (max >= 5) {
                            navigator.notification.alert('Erreur de geocoding', null, status, 'Ok');
                        } else {
                            max = max + 1;
                            getGeocoding(max);
                        }
                    });
                };
                getGeocoding(1);
                $rootScope.$$listeners.savePosition = [];
            });
        }
    ])
    .controller('positionCtrl', ['$rootScope', '$scope', 'Dispatch', 'Loading',
        function($rootScope, $scope, Dispatch, Loading) {
            var wait;
            $scope.d = new Date();
            $scope.month = $scope.d.getMonth() + 1;
            $scope.day = $scope.d.getDate();
            $scope.year = $scope.d.getFullYear();
            $scope.hours = $scope.d.getHours();
            $scope.minutes = $scope.d.getMinutes();

            $scope.yo = Dispatch.get();
            var fuu = $scope.$watch(Dispatch.get, function(newVal, oldVal) {
                if (wait == true) {
                    Loading.unset();
                }
                if (newVal === oldVal) {
                    wait = true;
                    return;
                }
                $scope.pos = newVal;
                fuu();
            });
            $scope.heure = ($scope.hours < 10 ? '0' + $scope.hours : $scope.hours) + ':' + ($scope.minutes < 10 ? '0' + $scope.minutes : $scope.minutes);
            $scope.jour = ($scope.day < 10 ? '0' + $scope.day : $scope.day) + '/' + ($scope.month < 10 ? '0' + $scope.month : $scope.month) + '/' + $scope.year;

            if (window.sessionStorage.getItem("dataday")) {

            }

            $rootScope.$on('saveDataDay', function() {

                var data = {
                    'position': $scope.pos,
                    'heure': $scope.heure,
                    'jour': $scope.jour
                };

                window.sessionStorage.setItem("dataday", JSON.stringify(data));
                $rootScope.$$listeners.saveDataDay = [];
            });
        }
    ]).controller('choiceCtrl', ['$rootScope', '$scope',
        function($rootScope, $scope) {
            $scope.setTransition = function() {
                $rootScope.transite = 'active'
            }
        }
    ])
    .controller('profilCtrl', ['$scope', '$rootScope', '$location', 'Context',
        function($scope, $rootScope, $location, Context) {

            if (window.localStorage.getItem('dataUser')) {
                var savedUser = JSON.parse(window.localStorage.getItem('dataUser'));
                $scope.name = savedUser.nom;
                $scope.surname = savedUser.prenom;
                $scope.street = savedUser.adresse;
                $scope.postal = savedUser.code;
                $scope.land = savedUser.pays;
                $scope.tel = savedUser.tel;
                $scope.email = savedUser.email;
            }
            if (window.localStorage.getItem('dataCar')) {
                var savedCar = JSON.parse(window.localStorage.getItem('dataCar'));
                $scope.car = savedCar.marque;
                $scope.ni = savedCar.ni;
                $scope.pi = savedCar.pi;
            }
            if (window.localStorage.getItem('dataAss')) {
                var savedAss = JSON.parse(window.localStorage.getItem('dataAss'))
                $scope.assname = savedAss.nom;
                $scope.ncontrat = savedAss.contrat;
                $scope.ncarte = savedAss.carte;
                $scope.agence = savedAss.agence;
                $scope.assadress = savedAss.adresse;
                $scope.asstel = savedAss.tel;
            }

            $rootScope.$on('saveUser', function() {

                var dataUser = {
                    'nom': $scope.name,
                    'prenom': $scope.surname,
                    'adresse': $scope.street,
                    'code': $scope.postal,
                    'pays': $scope.land,
                    'tel': $scope.tel,
                    'email': $scope.email
                }
                window.localStorage.setItem("dataUser", JSON.stringify(dataUser));

                var dataCar = {
                    'marque': $scope.car,
                    'ni': $scope.ni,
                    'pi': $scope.pi
                }
                window.localStorage.setItem("dataCar", JSON.stringify(dataCar));

                var dataAss = {
                    'nom': $scope.assname,
                    'contrat': $scope.ncontrat,
                    'carte': $scope.ncarte,
                    'agence': $scope.agence,
                    'adresse': $scope.assadress,
                    'tel': $scope.asstel
                }
                window.localStorage.setItem("dataAss", JSON.stringify(dataAss));
                window.plugins.toast.show('Profil sauvegardé!', 'short', 'bottom');
                $rootScope.$$listeners.saveUser = [];
            })
        }
    ])
    .controller('menuCtrl', ['$scope', '$rootScope',
        function($scope, $rootScope) {
            setTimeout(function() {
                $('.overlay').hide();
            }, 1000);
            $scope.toggleAbout = function() {
                if ($('.overlay').is(':visible')) {
                    $('.overlay').fadeOut(200);
                } else {
                    $('.overlay').fadeIn(200);
                }
            } //TODO faire un service
            $scope.setTransition = function() {
                $rootScope.transite = 'active'
            }

        }
    ])
    .controller('swipeCtrl', ['$scope', 'Context', '$location', '$swipe',
        function($scope, Context, $location, $swipe) {
            $scope.getNextLoc = function() {
                //$location.path(Context.nextLoc());
            }
            $scope.getPrevLoc = function() {
                //$location.path(Context.prevLoc());
            }

        }
    ]).controller('photoCtrl', ['$scope', 'Loading',
        function($scope, Loading) {

            $scope.pictureSource = navigator.camera.PictureSourceType;
            $scope.destinationType = navigator.camera.DestinationType;
            if (window.sessionStorage.getItem('photos')) {
                $scope.photos = JSON.parse(window.sessionStorage.getItem('photos'))
            } else {
                $scope.photos = [];
            }

            $scope.browsePhoto = function() {
                Loading.set();
                var nbrPhoto = $('#photos img').length;

                if (nbrPhoto == 3) {
                    navigator.notification.alert('3 photos maximum !', null, status, 'Ok')
                    return;
                }
                // Retrieve image file location from specified source
                navigator.camera.getPicture($scope.onPhotoURISuccess, $scope.onFail, {
                    quality: 80,
                    destinationType: $scope.destinationType.DATA_URL,
                    sourceType: $scope.pictureSource.PHOTOLIBRARY,
                    correctOrientation: true
                });
            }
            $scope.launchPhoto = function() {
                Loading.set();
                var nbrPhoto = $('#photos img').length;

                if (nbrPhoto == 3) {
                    navigator.notification.alert('3 photos maximum !', null, status, 'Ok')
                    return;
                }
                // Take picture using device camera and retrieve image as base64-encoded string
                navigator.camera.getPicture($scope.onPhotoDataSuccess, $scope.onFail, {
                    quality: 80,
                    destinationType: $scope.destinationType.DATA_URL,
                    correctOrientation: true
                });
            }

            $scope.onPhotoDataSuccess = function(imageData) {
                var smallImage = document.createElement('img');

                smallImage.addEventListener('load', function() {
                    var ratio = smallImage.height / smallImage.width;
                    var base = $(window).width() * 0.875;

                    $scope.$apply($scope.photos.push({
                        'src': "data:image/jpeg;base64," + imageData,
                        'width': base + 'px',
                        'height': (base * ratio) + 'px'
                    }));
                    Loading.unset();
                    window.sessionStorage.setItem("photos", JSON.stringify($scope.photos));

                });
                smallImage.src = "data:image/jpeg;base64," + imageData;

            }

            $scope.onPhotoURISuccess = function(imageData) {
                var largeImage = document.createElement('img');

                largeImage.addEventListener('load', function() {
                    var ratio = largeImage.height / largeImage.width;
                    var base = $(window).width() * 0.875;
                    $scope.$apply($scope.photos.push({
                        'src': "data:image/jpeg;base64," + imageData,
                        'width': base + 'px',
                        'height': (base * ratio) + 'px'
                    }));
                    Loading.unset();
                    window.sessionStorage.setItem("photos", JSON.stringify($scope.photos));

                });
                largeImage.src = "data:image/jpeg;base64," + imageData;
            }

            $scope.onFail = function(message) {
                Loading.unset();
                navigator.notification.alert('Failed because: ' + message, null, status, 'Ok');
            }

        }
    ])
    .controller('assistCtrl', ['$scope',
        function($scope) {
            $scope.numeros = [{
                'nom': 'Touring Mobilis',
                'tel': '046568129'
            }, {
                'nom': 'Axa assurance',
                'tel': '074594545'
            }];
            $scope.urgences = [{
                'nom': 'Police',
                'tel': '101'
            }, {
                'nom': 'Urgence',
                'tel': '112'
            }, {
                'nom': 'Pompiers et ambulances',
                'tel': '100'
            }];
            $scope.assurances = [{
                'nom': 'Ehtias Assistance',
                'value': 'ethias@mail.com',
                'group': 'Assurance'
            }, {
                'nom': 'Europ Assistance',
                'value': 'europ@mail.com',
                'group': 'Assurance'
            }, {
                'nom': 'Belfius Assistance',
                'value': 'belfius@mail.com',
                'group': 'Assurance'
            }];
        }
    ])
    .controller('circonsCtrl', ['$scope', '$rootScope',
        function($scope, $rootScope) {
            $scope.Uid = 0;
            $scope.tem;
            $scope.temoin;
            $scope.checke1;
            $scope.checke2;
            $scope.checke3;
            $scope.addNewTem = function() {
                $scope.Uid = $scope.Uid + 1;
                if (!$scope.tem) {
                    $scope.tem = [];
                }
                $scope.tem.push({
                    Uid: $scope.Uid,
                    name: $scope.temname,
                    adress: $scope.temsurname,
                    tele: $scope.temadress
                });

            }
            $scope.deleteMe = function(uid) {
                for (var i = 0; i <= $scope.tem.length; i++) {
                    if ($scope.tem[i].Uid == uid) {
                        $scope.tem.splice(i, 1);
                    }
                }
                if ($scope.tem.length == 0) {
                    $scope.tem = undefined;
                }
            }
            if (window.sessionStorage.getItem("circons")) {
                JSON.parse(window.sessionStorage.getItem("circons"))
            }
            $rootScope.$on('saveCircons', function() {
                console.log('event')
                var data = {
                    'presencetemoin': $scope.temoin,
                    'temoins': $scope.tem,
                    'autresparties': $scope.checke2,
                    'blesses': $scope.checke1,
                    'autresdegats': $scope.checke3
                };
                console.log(data)
                window.sessionStorage.setItem("circons", JSON.stringify(data));
                $rootScope.$$listeners.saveCircons = [];
            });
        }
    ])
    .controller('voletaCtrl', ['$scope', '$rootScope',
        function($scope, $rootScope) {
            if (window.localStorage.getItem('dataUser')) {
                var savedUser = JSON.parse(window.localStorage.getItem('dataUser'));
                $scope.name = savedUser.nom;
                $scope.surname = savedUser.prenom;
                $scope.street = savedUser.adresse;
                $scope.postal = savedUser.code;
                $scope.land = savedUser.pays;
                $scope.tel = savedUser.tel;
                $scope.email = savedUser.email;
            }
            if (window.localStorage.getItem('dataCar')) {
                var savedCar = JSON.parse(window.localStorage.getItem('dataCar'));
                $scope.car = savedCar.marque;
                $scope.ni = savedCar.ni;
                $scope.pi = savedCar.pi;
            }
            if (window.localStorage.getItem('dataAss')) {
                var savedAss = JSON.parse(window.localStorage.getItem('dataAss'))
                $scope.assname = savedAss.nom;
                $scope.ncontrat = savedAss.contrat;
                $scope.ncarte = savedAss.carte;
                $scope.agence = savedAss.agence;
                $scope.assadress = savedAss.adresse;
                $scope.asstel = savedAss.tel;
            }
            if (window.sessionStorage.getItem("voleta")) {

            }
            $rootScope.$on('saveVoletA', function() {

                window.sessionStorage.setItem("voleta", '')
                $rootScope.$$listeners.saveVoletA = [];
            });
        }
    ])
    .controller('voletbCtrl', ['$scope', '$rootScope',
        function($scope, $rootScope) {
            if (window.sessionStorage.getItem("voletb")) {

            }
            $rootScope.$on('saveVoletB', function() {

                window.sessionStorage.setItem("voletb", '')
                $rootScope.$$listeners.saveVoletB = [];
            });
        }
    ])
    .controller('recapCtrl', ['$scope', '$location',
        function($scope, $location) {
            var tes = $location.path();
            if (tes == '/declaration/recap1') {
                var donjour = JSON.parse(window.sessionStorage.getItem("dataday"));
                var circonstan = JSON.parse(window.sessionStorage.getItem("circons"));
                console.log(circonstan)
                $scope.date = donjour.jour;
                $scope.heure = donjour.heure;
                $scope.posi = donjour.position;
                $scope.temoi = circonstan.presencetemoin;
                $scope.bless = circonstan.blesses;
                $scope.vehic = circonstan.autresparties;
                $scope.dega = circonstan.autresdegats;
                $
            }
            if ($location.path() == '/declaration/recap2') {
                window.sessionStorage.getItem("")

            }
            if ($location.path() == '/declaration/recap3') {
                console.log(window.sessionStorage.getItem("croquis"))
                $scope.croquis = window.sessionStorage.getItem("croquis");
            }

        }
    ])
    .controller('confirmCtrl', ['$scope',
        function($scope) {
            $scope.toolPeny = function() {
                var item = window.sessionStorage.getItem("croquis");
                $scope.mailto = window.sessionStorage.getItem("dataUser").email;
                var request = $.ajax({
                    url: "http://www.damien-roelens.be/Constat/constat.php",
                    type: "post",
                    data: {
                        data: item,
                        email: $scope.mailto
                    }
                });

                // callback handler that will be called on success
                request.done(function(response, textStatus, jqXHR) {
                    Console.log("Envoi du constat éffectué!" + response + ' ' + textStatus)
                    navigator.notification.alert("Envoi du constat éffectué!" + response + ' ' + textStatus, null, status, 'Ok');
                });
            }
        }
    ])
    .controller('dessinCtrl', ['$scope', 'Dessins', '$rootScope','$location',
        function($scope, Dessins, $rootScope,$location) {
            $scope.moving = true;
            $scope.scaling = false;
            $scope.draw = function() {

                var lastDist = 0;
                var startScale = 1;
                var _stage = null;
                var _layer = null;
                var _selectedShape;
                var check = false;
                var devheight = $(window).height() - 100;
                var devwidth = $(window).width() - 2;
                $('#croquis').height(devheight);
                _stage = new Kinetic.Stage({
                    container: 'croquis',
                    width: devwidth,
                    height: devheight
                });
                _layer = new Kinetic.Layer();

                function getDistance(p1, p2) {
                    return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
                }

                function isOdd(num) {
                    return num % 2;
                }

                function getMinMax(str) {

                    var regex = /[+-]?\d+\.\d+/g;
                    var floats = str.match(regex).map(function(v) {
                        return parseFloat(v);
                    });
                    var minX = 99999;
                    var maxX = -99999;
                    var minY = 99999;
                    var maxY = -99999;
                    for (var i = 0; i < floats.length; i++) {

                        if (isOdd(i)) { // the array of numbers is in the form (x,y,x,y,x,y,x...)

                            // Check Y values
                            if (floats[i] < minY) {
                                minY = floats[i];
                            }
                            if (floats[i] > maxY) {
                                maxY = floats[i];
                            }

                        } else {

                            // Check X values
                            if (floats[i] < minX) {
                                minX = floats[i];
                            }
                            if (floats[i] > maxX) {
                                maxX = floats[i];
                            }
                        }
                    }
                    return {
                        minX: minX,
                        minY: minY,
                        maxX: maxX,
                        maxY: maxY
                    };
                }

                function selectionDessin(evt) {

                    if (evt.target.attrs.name) {
                        if (evt.target.attrs.name == "deletition") {
                            evt.target.getParent().remove();
                            window.plugins.toast.show('Objet supprimé', 'short', 'bottom');
                        }
                        if (evt.target.attrs.name == "layerplus") {
                            evt.target.getParent().moveUp();
                            window.plugins.toast.show('Calque supérieur', 'short', 'bottom');
                        }
                        if (evt.target.attrs.name == "layermin") {
                            evt.target.getParent().moveDown();
                            window.plugins.toast.show('Calque inférieur', 'short', 'bottom');
                        }
                    } else {
                        if (_selectedShape !== undefined) {
                            if (evt.target !== _selectedShape) {
                                _selectedShape.getParent().children[0].stroke('transparent');
                                _selectedShape.getParent().children[1].stroke('transparent');
                                _selectedShape.getParent().children[2].stroke('transparent');
                                _selectedShape.getParent().children[3].stroke('transparent');
                                _selectedShape.getParent().children[1].fill('transparent');
                                _selectedShape.getParent().children[2].fill('transparent');
                                _selectedShape.getParent().children[3].fill('transparent');
                                _selectedShape.getParent().draggable(false);
                                _selectedShape.eventListeners.touchmove = [];
                                check = true;
                            } //pour déselectionner la derniere forme

                            if (evt.target._id == _selectedShape._id) {
                                _selectedShape.getParent().children[0].stroke('transparent');
                                _selectedShape.getParent().children[1].stroke('transparent');
                                _selectedShape.getParent().children[2].stroke('transparent');
                                _selectedShape.getParent().children[3].stroke('transparent');
                                _selectedShape.getParent().children[1].fill('transparent');
                                _selectedShape.getParent().children[2].fill('transparent');
                                _selectedShape.getParent().children[3].fill('transparent');
                                _selectedShape.getParent().draggable(false);
                                _selectedShape = undefined;
                                check = false;
                            } //pour déselectioner si doucle clic 
                        } else {
                            check = true;
                        }
                        if (check) {
                            _selectedShape = evt.target;
                            var _selecRect = _selectedShape.getParent().children[0];
                            var _selecDel = _selectedShape.getParent().children[1];
                            var _selecLayerP = _selectedShape.getParent().children[2];
                            var _selecLayerM = _selectedShape.getParent().children[3];
                            _selectedShape.getParent().draggable(true);
                            _selecRect.stroke('blue');
                            _selecDel.stroke('black');
                            _selecLayerP.stroke('black');
                            _selecLayerM.stroke('black');
                            _selecDel.fill('white');
                            _selecLayerP.fill('white');
                            _selecLayerM.fill('white');

                            var minMax = getMinMax(_selectedShape.getAttrs().sceneFunc.toString());
                            _selecRect.width(minMax.maxX + 10);
                            _selecRect.height(minMax.maxY + 10);
                            _selecRect.offset({
                                x: 5,
                                y: 5
                            });
                            _selecRect.lineCap('round');
                            _selecRect.strokeWidth('5');
                        }
                    }
                    _layer.draw()
                }

                $scope.rotePos = function() {
                    if (_selectedShape) {
                        var temp = _selectedShape.getParent().rotation();
                        _selectedShape.getParent().rotation(temp + 10);
                        _layer.draw();
                    } else {
                        window.plugins.toast.show('Choisissez une forme d\'abord !', 'short', 'bottom');
                    }
                }
                $scope.roteNeg = function() {
                    if (_selectedShape) {
                        var temp = _selectedShape.getParent().rotation();
                        _selectedShape.getParent().rotation(temp - 10);
                        _layer.draw();
                    } else {
                        window.plugins.toast.show('Choisissez une forme d\'abord !', 'short', 'bottom');
                    }
                }

                $scope.transit = function() {
                    if ($scope.scaling == true) {
                        $scope.scaling = false;
                        $scope.moving = true;
                        window.plugins.toast.show('Déplacement activé', 'short', 'bottom');
                    } else {
                        $scope.scaling = true;
                        $scope.moving = false;
                        window.plugins.toast.show('Mise à échelle activé', 'short', 'bottom');
                    }
                }

                function moveScaleRota(et) {
                    if ($scope.scaling == true) {

                        _selectedShape.getParent().draggable(false);

                        var touch1 = et.touches[0];
                        var touch2 = et.touches[1];

                        if (touch1 && touch2) {
                            var dist = getDistance({
                                x: touch1.clientX,
                                y: touch1.clientY
                            }, {
                                x: touch2.clientX,
                                y: touch2.clientY
                            });

                            if (!lastDist) {
                                lastDist = dist;
                            }

                            var scale = {
                                x: _selectedShape.getParent().scale().x * dist / lastDist,
                                y: _selectedShape.getParent().scale().y * dist / lastDist
                            };

                            _selectedShape.getParent().scale(scale);
                            _layer.draw();
                            lastDist = dist;
                        }
                    }

                    if ($scope.moving == true) {
                        _selectedShape.getParent().draggable(true);
                    }

                };

                $scope.addObject = function(item) {
                    var group = new Kinetic.Group({
                        x: 0,
                        y: 0,
                        dragBoundFunc: function(pos) {
                            if (pos.y < 0) {
                                var newY = 0;
                            } else {
                                if (pos.y > devheight) {
                                    var newY = devheight;
                                } else {
                                    var newY = pos.y;
                                }
                            }
                            if (pos.x < 0) {
                                var newX = 0;
                            } else {
                                if (pos.x > devwidth) {
                                    var newX = devwidth;
                                } else {
                                    var newX = pos.x;
                                }
                            }
                            return {
                                x: newX,
                                y: newY
                            };
                        },
                        rotation: 0,
                        offset: {
                            x: 0,
                            y: 0
                        }
                    });
                    var shape = new Kinetic.Shape({
                        x: 0,
                        y: 0,
                        sceneFunc: Dessins.get(item),
                        fill: Dessins.getColor(item),
                        stroke: 'black',
                        offset: {
                            x: 0,
                            y: 0
                        }
                    });
                    var del = new Kinetic.Shape({
                        x: 0,
                        y: 0,
                        sceneFunc: function(ctx) {
                            ctx.beginPath();
                            ctx.moveTo(31.0, 16.0);
                            ctx.bezierCurveTo(31.0, 7.7, 24.3, 1.0, 16.0, 1.0);
                            ctx.bezierCurveTo(7.7, 1.0, 1.0, 7.7, 1.0, 16.0);
                            ctx.bezierCurveTo(1.0, 24.3, 7.7, 31.0, 16.0, 31.0);
                            ctx.bezierCurveTo(24.3, 31.0, 31.0, 24.3, 31.0, 16.0);
                            ctx.closePath();
                            ctx.fillStrokeShape(this);
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(23.2, 9.4);
                            ctx.lineTo(8.8, 23.7);
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(8.8, 9.4);
                            ctx.lineTo(23.2, 23.7);
                            ctx.stroke();
                        },
                        fill: 'transparent',
                        stroke: 'transparent',
                        offset: {
                            x: 25,
                            y: 30
                        },
                        name: 'deletition'
                    });
                    var layerp = new Kinetic.Shape({
                        x: 0,
                        y: 0,
                        sceneFunc: function(ctx) {
                            ctx.beginPath();
                            ctx.moveTo(31.0, 16.0);
                            ctx.bezierCurveTo(31.0, 7.7, 24.3, 1.0, 16.0, 1.0);
                            ctx.bezierCurveTo(7.7, 1.0, 1.0, 7.7, 1.0, 16.0);
                            ctx.bezierCurveTo(1.0, 24.3, 7.7, 31.0, 16.0, 31.0);
                            ctx.bezierCurveTo(24.3, 31.0, 31.0, 24.3, 31.0, 16.0);
                            ctx.closePath();
                            ctx.fillStrokeShape(this);

                            ctx.beginPath();
                            ctx.moveTo(16.4, 14.4);
                            ctx.lineTo(6.5, 20.1);
                            ctx.lineTo(16.4, 26.6);
                            ctx.lineTo(26.4, 20.1);
                            ctx.lineTo(16.4, 14.4);
                            ctx.closePath();
                            ctx.fillStrokeShape(this);

                            ctx.beginPath();
                            ctx.moveTo(16.4, 10.4);
                            ctx.lineTo(6.5, 16.1);
                            ctx.lineTo(16.4, 22.6);
                            ctx.lineTo(26.4, 16.1);
                            ctx.lineTo(16.4, 10.4);
                            ctx.closePath();
                            ctx.fillStrokeShape(this);

                            ctx.beginPath();
                            ctx.moveTo(16.4, 6.4);
                            ctx.lineTo(6.5, 12.1);
                            ctx.lineTo(16.4, 18.6);
                            ctx.lineTo(26.4, 12.1);
                            ctx.lineTo(16.4, 6.4);
                            ctx.closePath();
                            ctx.fillStrokeShape(this);

                            ctx.beginPath();
                            ctx.moveTo(18.7, 11.5);
                            ctx.lineTo(13.7, 11.5);
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(16.2, 14.0);
                            ctx.lineTo(16.2, 9.0);
                            ctx.stroke();
                        },
                        fill: 'transparent',
                        stroke: 'transparent',
                        offset: {
                            x: -25,
                            y: 30
                        },
                        name: 'layerplus'
                    });
                    var layerm = new Kinetic.Shape({
                        x: 0,
                        y: 0,
                        sceneFunc: function(ctx) {
                            ctx.beginPath();
                            ctx.moveTo(31.0, 16.0);
                            ctx.bezierCurveTo(31.0, 7.7, 24.3, 1.0, 16.0, 1.0);
                            ctx.bezierCurveTo(7.7, 1.0, 1.0, 7.7, 1.0, 16.0);
                            ctx.bezierCurveTo(1.0, 24.3, 7.7, 31.0, 16.0, 31.0);
                            ctx.bezierCurveTo(24.3, 31.0, 31.0, 24.3, 31.0, 16.0);
                            ctx.closePath();
                            ctx.fillStrokeShape(this);

                            ctx.beginPath();
                            ctx.moveTo(16.4, 14.4);
                            ctx.lineTo(6.5, 20.1);
                            ctx.lineTo(16.4, 26.6);
                            ctx.lineTo(26.4, 20.1);
                            ctx.lineTo(16.4, 14.4);
                            ctx.closePath();
                            ctx.fillStrokeShape(this);

                            ctx.beginPath();
                            ctx.moveTo(16.4, 10.4);
                            ctx.lineTo(6.5, 16.1);
                            ctx.lineTo(16.4, 22.6);
                            ctx.lineTo(26.4, 16.1);
                            ctx.lineTo(16.4, 10.4);
                            ctx.closePath();
                            ctx.fillStrokeShape(this);

                            ctx.beginPath();
                            ctx.moveTo(16.4, 6.4);
                            ctx.lineTo(6.5, 12.1);
                            ctx.lineTo(16.4, 18.6);
                            ctx.lineTo(26.4, 12.1);
                            ctx.lineTo(16.4, 6.4);
                            ctx.closePath();
                            ctx.fillStrokeShape(this);

                            ctx.beginPath();
                            ctx.moveTo(18.7, 11.5);
                            ctx.lineTo(13.7, 11.5);
                            ctx.stroke();
                        },
                        fill: 'transparent',
                        stroke: 'transparent',
                        offset: {
                            x: -75,
                            y: 30
                        },
                        name: 'layermin'
                    });
                    var selectionRect = new Kinetic.Rect({
                        x: 0,
                        y: 0,
                        width: 50,
                        height: 50,
                        fill: 'transparent',
                        stroke: 'transparent',
                        offset: {
                            x: 0,
                            y: 0
                        }
                    });
                    group.add(selectionRect, del, layerp, layerm, shape);
                    _layer.add(group);
                    _layer.draw()
                }

                _stage.add(_layer);
                _stage.draw();

                _layer.on('tap', function(evt) {

                    selectionDessin(evt);
                    if (_selectedShape) {
                        _selectedShape.getParent().addEventListener('touchmove', moveScaleRota);
                        _selectedShape.getParent().addEventListener('touchend', function() {
                            lastDist = 0;
                        }, false);
                    }
                });

                /*if (window.sessionStorage.getItem("croquis")) {
                    navigator.notification.confirm('Un croquis est déjà présent, voulez vous passez cette étape ?', function() {
                        $location.path('/declaration/recap3');
                    }, 'Attention', 'Oui,Non');
                }*/

                $rootScope.$on('saveCanvas', function() {
                    if (_selectedShape) {
                        _selectedShape.getParent().children[0].stroke('transparent');
                        _selectedShape.getParent().children[1].stroke('transparent');
                        _selectedShape.getParent().children[2].stroke('transparent');
                        _selectedShape.getParent().children[3].stroke('transparent');
                        _selectedShape.getParent().children[1].fill('transparent');
                        _selectedShape.getParent().children[2].fill('transparent');
                        _selectedShape.getParent().children[3].fill('transparent');
                        _selectedShape.getParent().draggable(false);
                        _selectedShape = undefined;
                    }
                    _stage.toDataURL({
                        callback: function(dataUrl) {
                            /*
                             * here you can do anything you like with the data url.
                             * In this tutorial we'll just open the url with the browser
                             * so that you can see the result as an image
                             */
                            window.sessionStorage.setItem("croquis", dataUrl);
                        }
                    });
                    $rootScope.$$listeners.saveCanvas = [];
                });
            }
            $scope.draw();
        }
    ]);