(function () {
  var app = angular.module('app'),
    injectArray = ['$http', '$q'];

  function provider ($http, $q) {

    function getBaseUrl (companyName) {
      return 'https://' + companyName + '.connectwisedev.com/v2016_5/apis/3.0';
      
      // For local testing (redirect to 'https://staging.connectwisedev.com/v2016_5/apis/3.0/')
      // return '/api'
    }

    function setLocalData(key, value) {
      localStorage.setItem( key, JSON.stringify(value) );
    }

    function getLocalData(key) {
      return JSON.parse( localStorage.getItem(key) );
    }

    function getSettings() {
      return getLocalData('settings');
    }

    function getConfig() {
      var settings = getSettings()
        companyName = settings.companyName,
        publicKey = settings.publicKey,
        privateKey = settings.privateKey,
        auth = companyName + '+' + publicKey + ':' + privateKey;

      return {
        headers:  {
          'Authorization': 'Basic ' + btoa(auth)
        }
      }
    }

    function getEmailCommunicationItem(communicationItems) {
      return communicationItems.find(
        function (item) {
          return item.type.name === 'email';
        }
      );
    }

    return {

      getContacts: function () {
        return $q(function (resolve, reject) {
          var settings = getSettings(),
            companyUrl = settings.companyUrl;

          $http.get(getBaseUrl(companyUrl) + '/company/contacts', getConfig()).then(
            function (response) {
              resolve(response);
            },
            function (res) {
              reject(res.data);
            }
          );
        });
      },

      getContactTypes: function () {
        var settings = getSettings(),
          companyUrl = settings.companyUrl;

        return $http.get(getBaseUrl(companyUrl) + '/company/contacts/types', getConfig());
      },

      getCompanies: function () {
        var settings = getSettings(),
          companyUrl = settings.companyUrl;

        return $http.get(getBaseUrl(companyUrl) + '/company/companies', getConfig());
      },

      saveContact: function (contact) {
        var settings = getSettings(),
          companyUrl = settings.companyUrl,
          emailCommunicationItem;

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

        return $http.post(getBaseUrl(companyUrl) + '/company/contacts', contact, getConfig());
      },

      saveSettings: function (settings) {
        setLocalData('settings', settings);
      },

      getSettings: getSettings
    };
  }
  provider.$inject = injectArray;
  app.service('dataProvider', provider);

})();

