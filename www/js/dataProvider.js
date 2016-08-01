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
      settings,
      createDbPromise,
      getSettingsBinded,
      setSettingsBinded,
      getSettingsPromise;

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
      var deferred = $q.defer();

      if (!db) {
        db = $cordovaSQLite.openDB({
          name: "connectWiseInt.db",
          location: 'default'
        });
        createDbPromise = createTableIfNotExist(db);
        getSettingsBinded = _.bind(getSettings, null, createDbPromise, db);
        setSettingsBinded = _.bind(setSettings, null, createDbPromise, db);
        getSettingsBinded().then(function (res) {
          settings = res;
          deferred.resolve()
        });
      } else {
        deferred.resolve()
      }

      return deferred.promise;
    }

    function getSettings(createDbPromise, db) {
      return createDbPromise.then(function () {
        var deferred = $q.defer();
        var query = 'select * from settings';

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

    function getBaseUrl () {
      // return 'https://' + settings.companyUrl + '.connectwisedev.com/v2016_5/apis/3.0';
      
      // For local testing (redirect to 'https://staging.connectwisedev.com/v2016_5/apis/3.0/')
      return '/api'
    }

    function getConfig() {
      var companyUrl = settings.companyUrl,
        companyName = settings.companyName,
        publicKey = settings.publicKey,
        privateKey = settings.privateKey,
        auth = companyName + '+' + publicKey + ':' + privateKey;

      return {
        headers:  {
          'Authorization': 'Basic ' + btoa(auth)
        }
      };
    }

    function saveSettings(settings) {
      setSettingsBinded(settings);
    }

    function getCompanies() {
      var companyUrl = settings.companyUrl;

      return $http.get(getBaseUrl() + '/company/companies', getConfig());
    }

    return {
      init: init,
      getConfig: getConfig,
      getBaseUrl: getBaseUrl,
      saveSettings: saveSettings,
      getCompanies: getCompanies,
      getSettings: function () {
        return settings;
      }
    };
  }
  provider.$inject = injectArray;
  app.service('dataProvider', provider);

})();