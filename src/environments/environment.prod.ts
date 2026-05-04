//CONFIGURACION PARA ARRANCAR EN LOCAL EL EMULADOR DE ANDROID. PRECISA NGROK
export const environment = {
  production: true,

  //URL del dominio asociado a la aplicación, para comprobar si está o no suspendido

  //domainUrl: 'https://development.xerintel.net/',

  //domainUrl: 'https://unshaveable-inge-irrecusably.ngrok-free.dev/',
  domainUrl: ' https://greatest-transmitted-reviewing-cms.trycloudflare.com/',
  //URL del endpoint de la api de pruebas
  //apiUrl: 'https://lav8.xerintel.net/devxerintel/api/auth/',
  //apiUrl: 'http://192.168.0.78:8000/api/auth/',//LOCAL
  //apiUrl: 'https://in-situ360.com/api/auth/',//DOMINIO
  //apiUrl: 'http://10.0.2.2:8000/api/auth/', //TEST_LOCAL_JOAN_MOBILE
  //apiUrl: 'https://i-360.test/api/auth/', //TEST_LOCAL_JOAN_MOBILE_ONE
  //apiUrl: 'https://unshaveable-inge-irrecusably.ngrok-free.dev/api/auth/',
  apiUrl:
    ' https://greatest-transmitted-reviewing-cms.trycloudflare.com/api/auth/',

  //stripePublishableKey:'pk_test_51QZVreAJPF0t9PwxhkBFGo6ZfilsynUAImsVZtTFsEe1VA5FDP7XgpW2DbTpMHiY7qathaxYVlWwEQGiCbNLF2qT00Sd9dxpAx',
  stripePublishableKey:
    'pk_live_51QZVreAJPF0t9Pwxjr8TV8BwkTyy8VDj5s2x3zGK7eTS6DJ2IlNKyOL1ZeRtWYzgGTPnnChitQdRrVjaJ1sVJPS200nbTDhNoz',

  ios: {
    pushSenderId: '690561641551',
  },
};

/*
export const environment = {
  production: true,


  //URL del dominio asociado a la aplicación, para comprobar si está o no suspendido

  domainUrl: 'https://development.xerintel.net/',

  //URL del endpoint de la api de pruebas
//  apiUrl: 'https://lav8.xerintel.net/devxerintel/api/auth/',
  //apiUrl: 'http://192.168.0.33:8000/api/auth/',//LOCAL
  apiUrl: 'https://in-situ360.com/api/auth/',//DOMINIO

  //stripePublishableKey:'pk_test_51QZVreAJPF0t9PwxhkBFGo6ZfilsynUAImsVZtTFsEe1VA5FDP7XgpW2DbTpMHiY7qathaxYVlWwEQGiCbNLF2qT00Sd9dxpAx',
  stripePublishableKey:'pk_live_51QZVreAJPF0t9Pwxjr8TV8BwkTyy8VDj5s2x3zGK7eTS6DJ2IlNKyOL1ZeRtWYzgGTPnnChitQdRrVjaJ1sVJPS200nbTDhNoz',

  ios: {
    pushSenderId: '690561641551',
  },
};*/
