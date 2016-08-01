(function () {
  var app = angular.module('app'),
    injectArray = ['$http', '$q', '$timeout', 'appConfig', 'dataProvider'];

  function provider ($http, $q, $timeout, appConfig, dataProvider) {
    var TYPE_FIELD_NAME = 'type';

    function createTypeField() {
      var sequenceNumberMin = 1;

      return sendRequestPostTypeField(sequenceNumberMin);
    }

    function sendRequestPostTypeField(sequenceNumber) {
      var deferred = $q.defer(),
        url = dataProvider.getBaseUrl(),
        sequenceNumberMax = 2;

      $http.post(
        url + '/system/userDefinedFields',
        {
          "caption": TYPE_FIELD_NAME,
          "podId": 1,
          "sequenceNumber": sequenceNumber,
          "fieldTypeIdentifier": "Text"
        },
        dataProvider.getConfig()
      ).then(
        function (res) {
          deferred.resolve(res);
        },
        function (res) {
          console.log('-| userDefinedFields err: ' + JSON.stringify(res));
          if (sequenceNumber + 1 <= sequenceNumberMax) {
            $timeout(function () {
              sendRequestPostTypeField(sequenceNumber + 1);
            }, 200);
          } else {
            deferred.reject();
          }
        }
      );

      return deferred.promise;
    }

    function getTypeField(fields) {
      return fields.find(function(field) {
        return field.caption === TYPE_FIELD_NAME;
      });
    }

    function getCustomFields() {
      return $http.get(
        dataProvider.getBaseUrl() + '/system/userDefinedFields',
        dataProvider.getConfig()
      );
    }

    function getContacts() {
      return $http.get(dataProvider.getBaseUrl() + '/company/contacts', dataProvider.getConfig());
    }

    console.log('-| contactsProvider3')

    return {
      getContacts: getContacts,
      getCustomFields: getCustomFields,
      createTypeField: createTypeField,
      getTypeField: getTypeField
    };
  }

  provider.$inject = injectArray;
  app.service('contactsProvider', provider);
})();

