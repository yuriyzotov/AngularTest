function MainController($scope,$window, apiManager, uuid4) {
    
    $scope.message = '';

    function handleRequest(res) {
        var token = res.data ? res.data.token : null;
        if (token) { console.log('JWT:', token); $scope.message = 'Token is ' + token; }
        else if (res.data && res.data.message) { $scope.message = res.data.message }
        else { $scope.message ="Login error" }

    }

    $scope.login = function () {
        apiManager.login()
          .then(handleRequest, handleRequest)
    }
    $scope.testToken = function () {
        apiManager.api().then(
            function () {
                $http.get('http://fd-api-2-testing.freelancediary.com/auth/test_fdjwtv1')
                    .success(function ()
                    { $scope.message = 'test passed' })
                    .error(function ()
                    { $scope.message = 'test failed' });
            }
        )
       .catch(function () { $scope.message = 'Cannot login' });
    }
    $scope.logout = function () {
        apiManager.logout && apiManager.logout()
    }
    $scope.isLoggedIn = function () {
        return apiManager.isLoggedIn ? apiManager.isLoggedIn() : false
    }

}