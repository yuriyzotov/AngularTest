(function () {
    'use strict';

    angular.module('fdAuth', [
        // Angular modules 
        'LocalStorageModule'
        , 'uuid'
        // Custom modules 
        // 3rd Party Modules
    ])
    .constant('API', 'http://fd-api-2-testing.freelancediary.com')
    .constant('API_AUTH', 'http://fd-api-2-testing.freelancediary.com/auth')

    //interceptor used to insert headers into request
    .factory('authInterceptor', ['$q','API', 'API_AUTH', 'authStorage', 'uuid4', function authInterceptor($q,API, API_AUTH, authStorage, uuid4) {
        return {
            // automatically attach Authorization header if we have token
            // all requests to API should contain special headers "X-UTC-Timestamp" and "X-Reference"
            request: function (config) {
                var token = authStorage.getToken();
                if (config.url.indexOf(API) === 0) {
                    config.headers = config.headers || {};
                    config.headers["X-UTC-Timestamp"] = encodeURIComponent(Math.round(new Date().getTime() / 1000));
                    config.headers["X-Reference"] = encodeURIComponent(uuid4.generate());
                    if (token) {
                        config.headers.Authorization = token;
                    }
                }
                return config;
            },
            // If a token was sent back, save it
            response: function (res) {
                if (res.config.url.indexOf(API_AUTH) === 0 && res.data.token) {
                    authStorage.saveToken(res.data.token);
                }
                return res;
            },

            // optional method
            requestError: function (rejection) {
                return $q.reject(rejection);
            },
            responseError: function (rejection) {
                return $q.reject(rejection);
            },

        }
    }
    ])
    //service used to store auth JWT tokens and parse it
    .service('authStorage', ['$window', 'localStorageService', function authStorage($window, localStorageService) {
        var self = this;
        var tokenName = 'jwtToken';
        //JWT methods here

        //check if token is valid
        self.validateToken = function(token)
        {
            if (!token) return false;
            try {
                var params = self.parseJwt(token);
            }
            catch (e) {
                console.log('ERROR: Invalid fdAuth token format:' + token);
                return false;
            }
            return true;
        }

        //parse token, can raise an exception
        self.parseJwt = function (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse($window.atob(base64));
        }

        //save non-empty token to storage
        self.saveToken = function (token) {
            if (self.validateToken(token)) {
                localStorageService.add(tokenName, token);
            }else {
                self.clear();
            }
        }

        //get token from storage, if token not valid returns null
        self.getToken = function () {
            var token = localStorageService.get(tokenName);
            if (token && self.validateToken(token)) {
                return token;
            } else {
                self.clear();
                return null;
            }
        }

        //remove token from storage
        self.clear = function () {
            localStorageService.remove(tokenName);
        }
    }
    ]
    )
    //service is used to work with logins and api calls, to make api call you need to do apiManager.api().then(<here you call method>)
    .service('apiManager',
       ['API', 'API_AUTH', '$http', '$window', '$q', 'uuid4', 'authStorage',
       function apiManager(API, API_AUTH, $http, $window, $q, uuid4, authStorage) {
           var self = this;
           self.deviceUUID = uuid4.generate();
           self.deviceName = $window.navigator.userAgent;
           self.applicationId = 'jr6V8KpEWkDqdXaqFWBmxhtbbXwJsbwscFIOSreI0MM=';

           //internal func to check if need to refresh token
           var shouldRefresh = function () {
               var token = authStorage.getToken();
               if (token) {
                   var params = authStorage.parseJwt(token);
                   return Math.round(new Date().getTime() / 1000) > params.exp;
               }
               return false;
           }

           //internal func to refresh token
           var refresh = function () {
               var token = authStorage.getToken();
               if (token) {
                   var params = authStorage.parseJwt(token);
                   return $http.post(API_AUTH + '/refresh', {
                       accessToken: params.accessToken,
                       refreshToken: params.refreshToken
                   });
               }
           }

           //check if we logged in and token is not expired
           self.isLoggedIn = function () {
               var token = authStorage.getToken();
               if (token) {
                   var params = authStorage.parseJwt(token);
                   return Math.round(new Date().getTime() / 1000) <= params.exp;
               } else {
                   return false;
               }
           }

           //used to make sage api calls, fucntion will check if we logged in and do login when not
           self.api = function () {
               var deferred = $q.defer();
               if (!self.isLoggedIn()) {
                   self.login().success(function (res) {
                       deferred.resolve(res)
                   }).error(function () {
                       deferred.reject()
                   });
               }
               else {
                   deferred.resolve()
               }

               return deferred.promise;
           }

           //used to logout and clear token
           self.logout = function () {
               authStorage.clear();
           }

           //used to login
           self.login = function () {
               if (shouldRefresh()) {
                   return refresh();
               }
               else {
                   return $http.post(API_AUTH, {
                       applicationId: self.applicationId,
                       deviceUUID: self.deviceUUID,
                       deviceName: self.deviceName
                   })
               }
           };
       }])
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    })

    ;
})();