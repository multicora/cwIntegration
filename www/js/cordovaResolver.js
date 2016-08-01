(function () {

  var app = angular.module('app'),
    injectArray = ['$ionicPlatform', 'dataProvider'];

  function service ($ionicPlatform, dataProvider) {
    var listenersArr = []
    var isReady = false

    const notifyListener = (listener) => {
      listener();
    }

    $ionicPlatform.ready(() => {
      dataProvider.init().then(function () {
        isReady = true;
        listenersArr.forEach(notifyListener);
      });
    })

    return {
      ready: (listener) => {
        if (!isReady) {
          listenersArr.push(listener);
        } else {
          notifyListener(listener);
        }
      }
    }
  }
  service.$inject = injectArray;
  app.service('cordovaResolver', service);

})();