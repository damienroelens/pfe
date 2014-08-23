'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('constatApp.services', [])
    .service('Context', ['$location', '$rootScope',
        function($location, $rootScope) {
            return {
                cat: function() {
                    var loca = $location.path();
                    if (loca == '/menu') {
                        return 'Constat d\'accident';
                    } else {
                        if (loca == '/declaration' || loca == '/declaration/1' || loca == '/declaration/map' || loca == '/declaration/photo' || loca == '/declaration/circons' || loca == '/declaration/dessin') {
                            return 'Déclaration - Commun';
                        } else {
                            if (loca == '/profil' || loca == '/profil/1' || loca == '/profil/2') {
                                return 'Profil';
                            } else {
                                if (loca == '/assistance') {
                                    return 'Assistance'
                                } else {
                                    if (loca == '/declaration/2') {
                                        return 'Déclaration - Volet A'
                                    } else {
                                        if (loca == '/declaration/3') {
                                            return 'Déclaration - Volet B'
                                        } else {
                                            if (loca == '/declaration/recap1' || loca == '/declaration/recap2' || loca == '/declaration/recap3') {
                                                return 'Déclaration'
                                            } 
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                next: function() {
                    var locat = $location.path();
                    if (locat == '/menu' || locat == '/declaration') {
                        return false;
                    } else {
                        return true;
                    }
                },
                prev: function() {
                    var locat = $location.path();
                    if (locat == '/menu') {
                        return false;
                    } else {
                        return true;
                    }
                },
                nextLoc: function() {
                    $rootScope.transite = 'active';
                    var lo = $location.path();
                    switch (lo) {
                        case '/declaration/map':
                            return '/declaration/1'
                            break;
                        case '/declaration/1':
                            return '/declaration/recap1'
                            break;
                        case '/declaration/recap1':
                            return '/declaration/2'
                            break;
                        case '/declaration/2':
                            return '/declaration/3'
                            break;
                        case '/declaration/3':
                            return '/declaration/recap2'
                            break;
                        case '/declaration/recap2':
                            return '/declaration/photo'
                            break;
                        case '/declaration/photo':
                            return '/declaration/dessin'
                            break;
                        case '/declaration/circons':
                            return '/declaration'
                            break;
                        case '/declaration/dessin':
                            return '/declaration/recap3'
                            break;
                        case '/declaration/recap3':
                            return '/declaration/confirm'
                            break;
                        case '/profil':
                            return '/menu'
                            break;
                        case '/assistance':
                            return '/menu'
                            break;
                        default:
                            return '/menu';
                    }
                },
                prevLoc: function() {
                    $rootScope.transite = 'passive';
                    var lo = $location.path();
                    switch (lo) {
                        case '/declaration':
                            return '/declaration/circons'
                            break;
                        case '/declaration/1':
                            return '/declaration'
                            break;
                        case '/declaration/2':
                            return '/declaration/recap1'
                            break;
                        case '/declaration/recap1':
                            return '/declaration/1'
                            break;
                        case '/declaration/recap2':
                            return '/declaration/3'
                            break;
                        case '/declaration/recap3':
                            return '/declaration/dessin'
                            break;
                        case '/declaration/confirm':
                            return '/declaration/recap3'
                            break;
                        case '/declaration/3':
                            return '/declaration/2'
                            break;
                        case '/declaration/photo':
                            return '/declaration/recap2'
                            break;
                        case '/declaration/circons':
                            return '/menu'
                            break;
                        case '/declaration/dessin':
                            return '/declaration/photo'
                            break;
                        case '/profil':
                            return '/menu'
                            break;
                        case '/assistance':
                            return '/menu'
                            break;
                        case '/declaration':
                            return '/declaration/circons'
                            break;
                        default:
                            return '/menu';
                    }
                }
            }
        }
    ])
    .service('User', ['$rootScope',
        function($rootScope) {
            return {
                save: function() {
                    $rootScope.$emit('saveUser');
                },
                savePosition: function() {
                    $rootScope.$emit('savePosition');
                },
                saveCanvas: function() {
                    $rootScope.$emit('saveCanvas');
                },
                saveVoletA: function() {
                    $rootScope.$emit('saveVoletA');
                },
                saveVoletB: function() {
                    $rootScope.$emit('saveVoletB');
                },
                saveDataDay: function() {
                    $rootScope.$emit('saveDataDay');
                },
                saveCircons: function() {
                    $rootScope.$emit('saveCircons');
                }
            }
        }
    ])
    .service('Dispatch', ['$rootScope',
        function($rootScope) {
            return {
                get: function() {
                    return $rootScope.adress;
                },
                put: function(data) {
                    $rootScope.adress = data;
                }
            }
        }
    ]).service('Loading', ['$rootScope',
        function($rootScope) {
            return {
                set: function() {
                    if ($('.loading').length) {
                        $('.loading').fadeIn(200);
                    } else {
                        var p = $('<div style="display:none;" class="loading"><p>Chargement</p></div>');
                        $('body').append(p);
                        $('.loading').fadeIn(200)
                        $('.loading').on('click', function() {
                            $('.loading').fadeOut(200);
                        });
                    }
                },
                unset: function() {
                    if ($('.loading').is(':visible')) {
                        $('.loading').fadeOut(200);
                    }
                }
            }
        }
    ]).service('Dessins', ['$rootScope',
        function($rootScope) {
            return {
                get: function(item) {
                    switch (item) {
                        case 'voiture1':
                            return function(ctx) {
                                ctx.beginPath();

                                ctx.moveTo(125.5, 8.3);
                                ctx.lineTo(125.5, 3.6);
                                ctx.bezierCurveTo(125.5, 1.9, 124.2, 0.5, 122.5, 0.5);
                                ctx.lineTo(122.0, 0.5);
                                ctx.bezierCurveTo(120.2, 0.5, 119.5, 1.9, 119.5, 3.6);
                                ctx.lineTo(119.5, 8.5);
                                ctx.lineTo(3.4, 8.5);
                                ctx.lineTo(0.5, 11.7);
                                ctx.lineTo(0.5, 79.3);
                                ctx.lineTo(3.4, 81.5);
                                ctx.lineTo(119.5, 81.5);
                                ctx.lineTo(119.5, 86.4);
                                ctx.bezierCurveTo(119.5, 88.1, 120.7, 89.5, 122.5, 89.5);
                                ctx.lineTo(123.0, 89.5);
                                ctx.bezierCurveTo(124.7, 89.5, 125.5, 88.1, 125.5, 86.4);
                                ctx.lineTo(125.5, 81.3);
                                ctx.lineTo(167.5, 75.1);
                                ctx.lineTo(167.5, 14.5);
                                ctx.lineTo(125.5, 8.3);
                                ctx.closePath();

                                // calque1/Trac transparent/Trac
                                ctx.moveTo(126.5, 64.3);
                                ctx.bezierCurveTo(126.5, 70.1, 122.1, 74.8, 116.3, 74.8);
                                ctx.lineTo(105.7, 73.3);
                                ctx.bezierCurveTo(99.9, 73.3, 95.5, 68.6, 95.5, 62.8);
                                ctx.lineTo(95.5, 27.8);
                                ctx.bezierCurveTo(95.5, 22.0, 100.1, 17.3, 105.9, 17.3);
                                ctx.lineTo(116.4, 15.2);
                                ctx.bezierCurveTo(122.2, 15.2, 126.5, 19.9, 126.5, 25.7);
                                ctx.lineTo(126.5, 64.3);
                                ctx.closePath();

                                // KineticJS specific context method
                                ctx.fillStrokeShape(this);
                            };
                            break;
                        case 'voiture2':
                            return function(ctx) {
                                ctx.beginPath();

                                ctx.moveTo(125.5, 8.3);
                                ctx.lineTo(125.5, 3.6);
                                ctx.bezierCurveTo(125.5, 1.9, 124.2, 0.5, 122.5, 0.5);
                                ctx.lineTo(122.0, 0.5);
                                ctx.bezierCurveTo(120.2, 0.5, 119.5, 1.9, 119.5, 3.6);
                                ctx.lineTo(119.5, 8.5);
                                ctx.lineTo(3.4, 8.5);
                                ctx.lineTo(0.5, 11.7);
                                ctx.lineTo(0.5, 79.3);
                                ctx.lineTo(3.4, 81.5);
                                ctx.lineTo(119.5, 81.5);
                                ctx.lineTo(119.5, 86.4);
                                ctx.bezierCurveTo(119.5, 88.1, 120.7, 89.5, 122.5, 89.5);
                                ctx.lineTo(123.0, 89.5);
                                ctx.bezierCurveTo(124.7, 89.5, 125.5, 88.1, 125.5, 86.4);
                                ctx.lineTo(125.5, 81.3);
                                ctx.lineTo(167.5, 75.1);
                                ctx.lineTo(167.5, 14.5);
                                ctx.lineTo(125.5, 8.3);
                                ctx.closePath();

                                // calque1/Trac transparent/Trac
                                ctx.moveTo(126.5, 64.3);
                                ctx.bezierCurveTo(126.5, 70.1, 122.1, 74.8, 116.3, 74.8);
                                ctx.lineTo(105.7, 73.3);
                                ctx.bezierCurveTo(99.9, 73.3, 95.5, 68.6, 95.5, 62.8);
                                ctx.lineTo(95.5, 27.8);
                                ctx.bezierCurveTo(95.5, 22.0, 100.1, 17.3, 105.9, 17.3);
                                ctx.lineTo(116.4, 15.2);
                                ctx.bezierCurveTo(122.2, 15.2, 126.5, 19.9, 126.5, 25.7);
                                ctx.lineTo(126.5, 64.3);
                                ctx.closePath();

                                // KineticJS specific context method
                                ctx.fillStrokeShape(this);
                            };
                            break;
                        case 'route1':
                            return function(ctx) {
                                ctx.beginPath();
                                ctx.moveTo(519.0, 200.0);
                                ctx.lineTo(1.0, 200.0);
                                ctx.lineTo(1.0, 1.0);
                                ctx.lineTo(519.0, 1.0);
                                ctx.lineTo(519.0, 200.0);
                                ctx.closePath();
                                ctx.fillStrokeShape(this);
                                ctx.stroke();

                                ctx.beginPath();
                                ctx.moveTo(22.0, 100.0);
                                ctx.lineTo(91.0, 100.0);
                                ctx.stroke();

                                ctx.beginPath();
                                ctx.moveTo(157.0, 100.0);
                                ctx.lineTo(226.0, 100.0);
                                ctx.stroke();

                                ctx.beginPath();
                                ctx.moveTo(292.0, 100.0);
                                ctx.lineTo(361.0, 100.0);
                                ctx.stroke();

                                ctx.beginPath();
                                ctx.moveTo(427.0, 100.0);
                                ctx.lineTo(496.0, 100.0);
                                ctx.stroke();
                            }
                            break;
                        default:
                            return;
                    }
                },
                getColor: function(item) {
                    switch (item) {
                        case 'voiture1':
                            return 'yellow'
                            break;
                        case 'voiture2':
                            return 'red'
                            break;
                        case 'route1':
                            return 'rgb(240,240,240)'
                            break;
                    }
                }
            }
        }
    ]);