require('dotenv').config();
const { ClientSecretCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

//Environment variables required to connect to the keyvault
const configKeys = [
    "KV_TENANT_ID",
    "KV_CLIENT_ID",
    "KV_CLIENT_SECRET",
    "KEYVAULT_NAME"
];

configKeys.forEach((configKey)=>{

    if(!process.env[configKey])
        throw new Error(`Missing environment varable ${configKey}`);
    
})

const credential = new ClientSecretCredential(

    process.env.KV_TENANT_ID,
    process.env.KV_CLIENT_ID,
    process.env.KV_CLIENT_SECRET,
    {
        additionallyAllowedTenants:'*'
    }
);

const vaultName = process.env.KEYVAULT_NAME
const url = `https://${vaultName}.vault.azure.net`;

const client = new SecretClient(url, credential);

module.exports = {

    //Copies all retrieved keys from keyvault to local environment as env variables
    async copyKeysToEnv() {

        let secretNames= []
        
        for await (let secretProperties of client.listPropertiesOfSecrets()) {

            secretNames.push(secretProperties.name)
            
        }
        
        for( secretName of secretNames){

            let parsedSecretName = secretName.replaceAll('-', '_');
            
            const latestSecret = await client.getSecret(secretName);

            process.env[parsedSecretName]= latestSecret.value
        }

    }
};


