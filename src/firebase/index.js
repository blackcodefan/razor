import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBNHW5rxKv7ynCIcdKpFmoHqkATCOCvuEs",
    authDomain: "ez-razor.firebaseapp.com",
    databaseURL: "https://ez-razor-default-rtdb.firebaseio.com",
    projectId: "ez-razor",
    storageBucket: "ez-razor.appspot.com",
    messagingSenderId: "709361811608",
    appId: "1:709361811608:web:bb00cab637230f2a6350ed",
    measurementId: "G-F2VE6RL12W"
};

let authenticateApp = firebase.initializeApp(firebaseConfig, 'authenticate');
let registerApp = firebase.initializeApp(firebaseConfig, 'register');

export const auth = firebase.auth(authenticateApp);

export const database = firebase.firestore(authenticateApp);
export const realtimedb = firebase.database(authenticateApp);

export const generateUserDocument = async (user) => {

    const id = Date.now().toString();
    const userRef = database.doc(`users/${id}`);

    await userRef.set({
        "id": id,
        "name": user.name,
        "username": user.userName,
        "password": user.password,
        "type":user.type
    });

};

export const getUserDocument = async (username) => {

    const userDocument = await database.collection(`users`)
        .where('username', '==', username)
        .get();

    return await userDocument.docs[0].data();
};

export const createUserWithEmailAndPasswordHandler = async (user) => {

     try {
         await registerApp
             .auth()
             .createUserWithEmailAndPassword(`${user.userName}@gmail.com`, user.password);

         await  generateUserDocument(user);
         return {success: true};
     }catch (e) {
         return {success: false, error: e.message};
     }
};

export const signInWithEmailAndPasswordHandler = async (credential) => {
    try {
        await auth.signInWithEmailAndPassword(`${credential.username}@gmail.com`, credential.password);
        return {success: true};
    }catch(e){
        return {success: false, error:e.message};
    }
};

export const logout =async (event) =>{
    event.preventDefault();
    await auth.signOut();
};