"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv"); // Import the types for dotenv
const identity_1 = require("@azure/identity");
const keyvault_secrets_1 = require("@azure/keyvault-secrets");
// Load environment variables from a .env file
(0, dotenv_1.config)();
const configKeys = [
    'KV_TENANT_ID',
    'KV_CLIENT_ID',
    'KV_CLIENT_SECRET',
    'KEYVAULT_NAME',
];
// Check if all the required environment variables are present
for (const key of configKeys) {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable ${key}`);
    }
}
// Create a ClientSecretCredential object to authenticate with Azure AD
const credential = new identity_1.ClientSecretCredential(process.env.KV_TENANT_ID, process.env.KV_CLIENT_ID, process.env.KV_CLIENT_SECRET, {
    additionallyAllowedTenants: ['*'],
});
// Create a SecretClient object to communicate with the Key Vault
const vaultName = process.env.KEYVAULT_NAME;
const url = `https://${vaultName}.vault.azure.net`;
const client = new keyvault_secrets_1.SecretClient(url, credential);
// Export the copyKeysToEnv function as the default export
async function copyKeysToEnv() {
    const secretNames = [];
    // List all secret properties from the Key Vault
    for await (const secretProperties of client.listPropertiesOfSecrets()) {
        secretNames.push(secretProperties.name);
    }
    // Copy the secret values to local environment variables
    for (const secretName of secretNames) {
        const parsedSecretName = secretName.replaceAll('-', '_');
        if (!process.env[parsedSecretName]) {
            const latestSecret = await client.getSecret(secretName);
            process.env[parsedSecretName] = latestSecret.value;
        }
    }
}
exports.default = copyKeysToEnv;
;
