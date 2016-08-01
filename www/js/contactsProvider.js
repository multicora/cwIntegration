(function () {
  var app = angular.module('app'),
    injectArray = ['$http', '$q', '$timeout', 'dataProvider'];

  function provider ($http, $q, $timeout, dataProvider) {
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

    function saveContact(contact) {
      var emailCommunicationItem;

      contact.communicationItems = contact.communicationItems || [];
      emailCommunicationItem = getEmailCommunicationItem(contact.communicationItems);
      if (emailCommunicationItem) {
        emailCommunicationItem.value = contact.email;
      } else {
        contact.communicationItems.push({
          "type": {
            "name": "email",
          },
          "value": contact.email,
          "defaultFlag": true,
          "communicationType": "Email"
        });
      }

      return $http.post(dataProvider.getBaseUrl() + '/company/contacts', contact, dataProvider.getConfig());
    }

    function getEmailCommunicationItem(communicationItems) {
      return communicationItems.find(
        function (item) {
          return item.type.name === 'email';
        }
      );
    }


    return {
      getContacts: getContacts,
      getCustomFields: getCustomFields,
      createTypeField: createTypeField,
      getTypeField: getTypeField,
      saveContact: saveContact
    };
  }

  provider.$inject = injectArray;
  app.service('contactsProvider', provider);
})();

