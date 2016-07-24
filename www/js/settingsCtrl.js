(function () {

  var app = angular.module('app'),
    injectArray = ['$state', 'dataProvider'];

  function controller ($state, dataProvider) {
    var vm = this,
      settings = dataProvider.getSettings() || {};

    vm.companyUrl = settings.companyUrl;
    vm.companyName = settings.companyName;
    vm.publicKey = settings.publicKey;
    vm.privateKey = settings.privateKey;

    vm.save = function (form) {
      form.$setSubmitted();
      if (form.$valid) {
        dataProvider.saveSettings({
          companyUrl: vm.companyUrl,
          companyName: vm.companyName,
          publicKey: vm.publicKey,
          privateKey: vm.privateKey
        });
        $state.go('contactsList');
      }
    }
  }
  controller.$inject = injectArray;
  app.controller('settingsCtrl', controller);

})();