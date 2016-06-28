/// <reference path="/wwwroot/lib/angular/angular.js"/> 
/// <reference path="/wwwroot/lib/angular-uuid/uuid.js"/> 
/// <reference path="/wwwroot/lib/angular-local-storage/dist/angular-local-storage.js"/> 
/// <reference path="/wwwroot/lib/angular-mocks/angular-mocks.js"/> 
/// <reference path="/wwwroot/js/modules/fdAuth.js"/> 



describe('apiManager', function () {
    var apiManager;
    var $httpBackend;
    var localStorageService;
    var $window;
    var API;
    var API_AUTH;
    var uuid4;
    var $http;
    var validTokenResult;

    beforeEach(module('fdAuth'));
    beforeEach(inject(function ($injector) {

        $httpBackend = $injector.get('$httpBackend');
        localStorageService = $injector.get('localStorageService');
        $window = $injector.get('$window');
        API = $injector.get('API');
        API_AUTH = $injector.get('API_AUTH');

        uuid4 = $injector.get('uuid4');
        spyOn(uuid4, "generate").and.callFake(function () {
            return '29cf6d9f-cbad-465e-a550-55721e05c43c';
        });
        $http = $injector.get('$http');
        //last - create test object
        apiManager = $injector.get('apiManager');
        apiManager.logout();
        validTokenResult = { token: 'new client token.' + $window.btoa(JSON.stringify({ exp: Math.round(new Date().getTime() / 1000) + 5000, accessToken: '1', refreshToken: '2' })) };

    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should send HTTP request to authentication server', function () {
        $httpBackend.expectPOST(API_AUTH)
            .respond(validTokenResult);
        apiManager.login();
        $httpBackend.flush();
    });

    it('should send auth info as request body payload', function () {
        $httpBackend.expectPOST(API_AUTH, {
            applicationId: 'jr6V8KpEWkDqdXaqFWBmxhtbbXwJsbwscFIOSreI0MM=',
            deviceUUID: '29cf6d9f-cbad-465e-a550-55721e05c43c',
            deviceName: $window.navigator.userAgent
        })
            .respond(validTokenResult);

        apiManager.login();
        $httpBackend.flush();
    });


    it('should send timestamp and reference headers', function () {
        $httpBackend.expectPOST(API_AUTH, undefined, function (headers) {
            return headers["X-UTC-Timestamp"] != null && headers["X-Reference"] != null;
        })
        .respond(validTokenResult);

        apiManager.login();
        $httpBackend.flush();
    });


    it('should persist token in local storage', function () {

        $httpBackend.whenPOST(API_AUTH)
            .respond(validTokenResult);

        apiManager.login();
        $httpBackend.flush();

        expect(localStorageService.get('jwtToken')).toBe(validTokenResult.token);
    });

    it('should be logged in', function () {

        $httpBackend.whenPOST(API_AUTH)
            .respond(validTokenResult);

        apiManager.login();
        $httpBackend.flush();

        expect(apiManager.isLoggedIn()).toBe(true);
    });

    it('should fail authentication', function () {
        var error = jasmine.createSpy();
        $httpBackend.whenPOST(API_AUTH).respond(403, 'Application token is not valid');

        apiManager.login().error(error);
        $httpBackend.flush();

        expect(error).toHaveBeenCalled();
        expect(error.calls.mostRecent().args[0]).toBe('Application token is not valid');
    });



    it('E2E: should make login when api calls', function () {

        var testUrl = 'http://fd-api-2-testing.freelancediary.com/auth/test_fdjwtv1';

        $httpBackend.expectPOST(API_AUTH)
            .respond({ token: 'E2E client token.' + $window.btoa(JSON.stringify({ exp: Math.round(new Date().getTime() / 1000) + 5000, accessToken: '1', refreshToken: '2' })) });

        $httpBackend.expectGET(testUrl, undefined, function (headers) {
            return headers["X-UTC-Timestamp"] != null && headers["X-Reference"] != null
                && headers.Authorization != null && headers.Authorization.split('.')[0] === 'E2E client token'
        })
         .respond(200, 'OK');

        var error = jasmine.createSpy();
        var success = jasmine.createSpy();
        apiManager.api().then(
            function () {
                $http.get(testUrl)
               .success(success)
               .error(error);
            });
        $httpBackend.flush();

        expect(success).toHaveBeenCalled();

    });

    it('E2E: should make login when api calls, and then refresh', function () {

        var testUrl = 'http://fd-api-2-testing.freelancediary.com/auth/test_fdjwtv1';
        var refreshUrl = API_AUTH + '/refresh';


        //login call
        $httpBackend.expectPOST(API_AUTH,
             {
                 applicationId: 'jr6V8KpEWkDqdXaqFWBmxhtbbXwJsbwscFIOSreI0MM=',
                 deviceUUID: '29cf6d9f-cbad-465e-a550-55721e05c43c',
                 deviceName: $window.navigator.userAgent
             })
            .respond({ token: 'E2E client token.' + $window.btoa(JSON.stringify({ exp: Math.round(new Date().getTime() / 1000) - 1, accessToken: '1', refreshToken: '2' })) });


        var successLogin = jasmine.createSpy();
        apiManager.login().success(successLogin);
        $httpBackend.flush();

        //refresh call
        $httpBackend.expectPOST(refreshUrl,
            {
                accessToken: '1',
                refreshToken: '2'
            }
            , function (headers) {
                return headers["X-UTC-Timestamp"] != null && headers["X-Reference"] != null
                    && headers.Authorization != null && headers.Authorization.split('.')[0] === 'E2E client token'
            })
        .respond({ token: 'E2E client token.' + $window.btoa(JSON.stringify({ exp: Math.round(new Date().getTime() / 1000) + 50, accessToken: '1', refreshToken: '2' })) });

        //call for test
        $httpBackend.expectGET(testUrl, undefined, function (headers) {
            return headers["X-UTC-Timestamp"] != null && headers["X-Reference"] != null
                && headers.Authorization != null && headers.Authorization.split('.')[0] === 'E2E client token'
        })
         .respond(200, 'OK');


        expect(successLogin).toHaveBeenCalled();
        expect(apiManager.isLoggedIn()).toBe(false);


        var error = jasmine.createSpy();
        var success = jasmine.createSpy();

        apiManager.api().then(
            function () {
                $http.get(testUrl)
               .success(success)
               .error(error);
            });
        $httpBackend.flush();

        expect(success).toHaveBeenCalled();

    });

});