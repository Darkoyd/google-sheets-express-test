const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// El SCOPE define los permisos de la aplicación
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Carga el archivo de credenciales
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Autoriza y realiza el callback
    authorize(JSON.parse(content), addCats);
});

/**
 * Crea un cliente de OAuth2
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback Callback para la ejecución
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Revisa si ya hay un token
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

//---------------------------------------------------------------------

function addCats(auth) {
    let gato1 = ['Pelusa', 10, 'Marrón', 'Verde']
    let gato2 = ['Simón', 2, 'Blanco', 'Azul']
    let values = [gato1, gato2]
    let resource = {
        values
    }
    const sheets = google.sheets({ version: 'v4', auth })
    sheets.spreadsheets.values.append({
        spreadsheetId: '1NYZvxwiEYjsO_-_8wFqlK1qFptk-OCqhzLHyuzJuUSU',
        range: 'Hoja 1',
        valueInputOption: 'RAW',
        resource
    }, (err, result) => {
        if (err) {
            // Handle error.
            console.log(err);
        } else {
            console.log(`Success`);
        }
    });
}