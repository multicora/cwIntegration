(function () {
  var app = angular.module('app'),
    injectArray = ['$http', '$q', '$ionicPlatform', '$cordovaSQLite'];

  function provider ($http, $q, $ionicPlatform, $cordovaSQLite) {
    var TABLES = {
      SETTINGS: {
        NAME: 'settings',
        FIELDS: {
          FIELD: 'field',
          VALUE: 'value'
        }
      }
    };

    var db,
      createDbPromise,
      getSettingsBinded = 3,
      setSettingsBinded;

    function createTableIfNotExist(db) {
      var query = '' +
        'create table if not exists ' + TABLES.SETTINGS.NAME + ' ' +
        '(' +
          TABLES.SETTINGS.FIELDS.FIELD + ' TEXT' +
            ' unique on conflict replace, ' +
          TABLES.SETTINGS.FIELDS.VALUE + ' TEXT' +
        ')',
        deferred = $q.defer();

      $cordovaSQLite.execute(db, query).then(function(res) {
        deferred.resolve(res.insertId);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function parseData(data) {
      let parsedData = {};

      for (let i = 0; i < data.length; i++) {
        let item = data.item(i);
        parsedData[item.field] = item.value;
      }

      return parsedData;
    }

    function init() {
      if (!db) {
        db = $cordovaSQLite.openDB({
          name: "connectWiseInt.db",
          location: 'default'
        });
        createDbPromise = createTableIfNotExist(db);
        getSettingsBinded = _.bind(getSettings, null, createDbPromise, db);
        setSettingsBinded = _.bind(setSettings, null, createDbPromise, db);
      }
    }

    function getSettings(createDbPromise, db) {
      return createDbPromise.then(function () {
        let deferred = $q.defer();
        let query = 'select * from settings';

        $cordovaSQLite.execute(db, query).then(function(res) {
          deferred.resolve( parseData(res.rows) );
        }, function (err) {
          deferred.reject(err);
        });
        
        return deferred.promise;
      });
    }

    // TODO: too long
    function setSettings(createDbPromise, db, settings) {
      return createDbPromise.then(function () {
        var deferred = $q.defer(),
          keys = _.keys(settings),
          valuesStr,
          values,
          insertQuery;

        valuesStr = _.map(keys, function() { return '(?, ?)' } ).join(',');
        values = _.flatten( _.pairs(settings) );
        insertQuery = ' insert into settings (field, value) values ' + valuesStr;
        $cordovaSQLite.execute(db, insertQuery, values).then(function(res) {
          deferred.resolve(res.insertId);
        }, function (err) {
          deferred.reject(err);
        });

        return deferred.promise;
      });
    }

    function getBaseUrl (companyName) {
      // return 'https://' + companyName + '.connectwisedev.com/v2016_5/apis/3.0';
      
      // For local testing (redirect to 'https://staging.connectwisedev.com/v2016_5/apis/3.0/')
      return '/api'
    }

    function setLocalData(key, value) {
      localStorage.setItem( key, JSON.stringify(value) );
    }

    function getLocalData(key) {
      return JSON.parse( localStorage.getItem(key) );
    }

    // function getSettings() {
    //   return getLocalData('settings');
    // }

    return {
      init: init,

      getContacts: function () {
        var deferred = $q.defer();

        getSettingsBinded().then(function (settings) {
          var companyUrl = settings.companyUrl,
            companyName = settings.companyName,
            publicKey = settings.publicKey,
            privateKey = settings.privateKey,
            auth = companyName + '+' + publicKey + ':' + privateKey,
            config = {
              headers:  {
                'Authorization': 'Basic ' + btoa(auth)
              }
            };

          $http.get(getBaseUrl(companyUrl) + '/company/contacts', config).then(
            function (response) {
              deferred.resolve(response);
            },
            function (res) {
              deferred.reject(res.data);
            }
          );
        });

        return deferred.promise;
      },

      saveSettings: (settings) => {
        setSettingsBinded(settings)
      },

      getSettings: function () {
        return getSettingsBinded()
      },

      // getCustomFields: function () {
      //   https://staging.connectwisedev.com/v2016_5/apis/3.0/system/userDefinedFields
      // }
    };
  }
  provider.$inject = injectArray;
  app.service('dataProvider', provider);

})();

