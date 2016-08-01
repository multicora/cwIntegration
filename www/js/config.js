var injectionArray = ['$q', 'cordovaResolver', 'contactsProvider', 'appConfig'];
function resolver($q, cordovaResolver, contactsProvider, appConfig) {
  var customFieldDeferred = $q.defer();
  cordovaResolver.ready(function () {
    contactsProvider.getCustomFields().then(function (res) {
      var typeField = contactsProvider.getTypeField(res.data);

      if (typeField) {
        return {
          data: typeField
        };
      } else {
        return contactsProvider.createTypeField();
      }
    }).then(function (res) {
      appConfig.typeFieldId = res.data.id;
      customFieldDeferred.resolve();
    });
  });

  return customFieldDeferred.promise;
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
