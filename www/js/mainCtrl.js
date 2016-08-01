(function () {

  var app = angular.module('app'),
    injectArray = ['$state', 'cordovaResolver', 'dataProvider'];

  function controller ($state, cordovaResolver, dataProvider) {
    var settings;

    cordovaResolver.ready(() => {
      settings = dataProvider.getSettings();
      if ( !isSettingsSetted(settings) ) {
        $state.go('appSettings');
      }
    })

    function isSettingsSetted(settings) {
      settings = settings || {};
      return !!(settings.companyUrl && settings.companyName && settings.publicKey && settings.privateKey);
    }
  }
  controller.$inject = injectArray;
  app.controller('mainCtrl', controller);

})();