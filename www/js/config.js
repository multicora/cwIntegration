(() => {
  const injectionArray = ['$q', 'cordovaResolver'];
  function resolver($q, cordovaResolver) {
    return $q(function (resolve, reject) {
      cordovaResolver.ready(() => {
        resolve();
      });
    });
  }
  resolver.$inject = injectionArray;

  angular.module('app')
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
    .state('contactsList', {
      url: '/',
      templateUrl: 'contactsList',
      controller: 'contactsListCtrl as vm',
      resolve: {
        resolver: resolver
      }
    })
    .state('appSettings', {
      url: '/appSettings',
      templateUrl: 'appSettings',
      controller: 'settingsCtrl as vm',
      resolve: {
        resolver: resolver
      }
    });

  });
})()