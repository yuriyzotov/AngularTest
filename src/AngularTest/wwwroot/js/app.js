(function () {
    'use strict';

    angular.module('app', [
        // Angular modules 

        // Custom modules 
         , 'fdAuth'

        // 3rd Party Modules
        
    ])
    .controller('MainController', ['$scope','$window', 'apiManager', 'uuid4', MainController]);
})();