import CryptoJS from 'crypto-js';
import { UserResult } from './models/IUser';
                        
export const encryptData = (data:any, salt:string) =>
    CryptoJS.AES.encrypt(JSON.stringify(data), salt).toString();


export const decryptData = (ciphertext:string, salt:string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, salt);
    try {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    catch(err){
        return null;
    }
}

export const control = () => {

    const localUser = localStorage.getItem("user")
    if ( localUser ) {
        const key = process.env.REACT_APP_SALT
        const decrypt = decryptData(localUser, key!)
        if ( decrypt !== null ) {
            try {
                const usr:UserResult = decrypt
                return usr
            } catch (error) {
                localStorage.removeItem("user")
                return null
            }
        }else {
            localStorage.removeItem("user")
            return null
        }
    }else {
        return null
    }

}

export const autControl = () => {
    const stLocal = localStorage.getItem("aut")
    if ( stLocal ) {
        const key = process.env.REACT_APP_SALT
        const decrypt = decryptData(stLocal, key!)
        if ( decrypt !== null ) { 
            try {
                return decrypt;
            } catch (error) {
                return null;
            }
        }else {
            return null; 
        }
    }else {
        return null;
    }
}

export const convertDate = (params: number) => {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "numeric"
    };
    return new Date(params).toLocaleDateString([], options);
}