export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDX-yL7kUqReokojYMAD0SPufMdz3_jFQk',
    authDomain: 'fir-authentication-6b51c.firebaseapp.com',
    projectId: 'fir-authentication-6b51c',
    storageBucket: 'fir-authentication-6b51c.firebasestorage.app',
    messagingSenderId: '86110013462',
    appId: '1:86110013462:web:02f1c0098081667fda0d37',
    measurementId: 'G-ED5BT0EVNQ'
  }
};

export function hasFirebaseConfig(): boolean {
  const requiredValues = [
    environment.firebase.apiKey,
    environment.firebase.authDomain,
    environment.firebase.projectId,
    environment.firebase.storageBucket,
    environment.firebase.messagingSenderId,
    environment.firebase.appId
  ];

  return requiredValues.every((value) => typeof value === 'string' && value.length > 0 && !value.startsWith('YOUR_'));
}
