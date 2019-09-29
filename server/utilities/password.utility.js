const passwordGenerator = require('generate-password');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
var bcrypt = require('bcryptjs');

// generate auto password
function password() {
    return passwordGenerator.generate({
        length: 10,
        numbers: true,
        excludeSimilarCharacters: true
    });
}
const encryptedStringLocal = cryptr.encrypt(password());
const decryptedStringLocal = cryptr.decrypt(encryptedStringLocal);

module.exports = {
    encryptedPassword: encryptedStringLocal,
    decryptedPassword: decryptedStringLocal,
    createPassword:function() {
        let thisPassword = password();
        return {
            // encryptedString : cryptr.encrypt(thisPassword),
            // decryptedString : thisPassword
            encryptedString : bcrypt.hashSync(thisPassword, 8),
            decryptedString : thisPassword
        }
    },
    updatePassword:function(pass) {
        // let thisPassword = password();
        return {
            // encryptedString : cryptr.encrypt(thisPassword),
            // decryptedString : thisPassword
            encryptedString : bcrypt.hashSync(pass, 8),
            decryptedString : pass
        }
    }
  
}