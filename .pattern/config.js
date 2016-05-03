(function () {
  'use strict';

  angular.module('limestoneApp')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('dashboard', {
          url: '/dashboard',
          templateUrl: 'app/pages/dashboard/dashboard.html',
          controller: 'DashboardCtrl as vm'
        });
    }]);

})();
