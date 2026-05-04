// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

//CONFIGURACION PARA TRABAJAR EN ENTORNOS WEB
export const environment = {
  production: false,

  //URL del dominio asociado a la aplicación, para comprobar si está o no suspendido

  domainUrl: 'https://development.xerintel.net/',

  //URL del endpoint de la api de pruebas
  //apiUrl: 'https://lav8.xerintel.net/devxerintel/api/auth/',
  //apiUrl: 'http://192.168.0.33:8000/api/auth/',//LOCAL
  //apiUrl: 'https://in-situ360.com/api/auth/',//DOMINIO
  apiUrl: 'http://127.0.0.1:8000/api/auth/', //TEST_LOCAL_DESARROLLO

  stripePublishableKey:
    'pk_test_51QZVreAJPF0t9PwxhkBFGo6ZfilsynUAImsVZtTFsEe1VA5FDP7XgpW2DbTpMHiY7qathaxYVlWwEQGiCbNLF2qT00Sd9dxpAx',
  //stripePublishableKey:'pk_live_51QZVreAJPF0t9Pwxjr8TV8BwkTyy8VDj5s2x3zGK7eTS6DJ2IlNKyOL1ZeRtWYzgGTPnnChitQdRrVjaJ1sVJPS200nbTDhNoz',

  ios: {
    pushSenderId: '690561641551',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
