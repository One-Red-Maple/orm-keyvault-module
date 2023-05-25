import { config as loadEnv } from 'dotenv'; // Import the types for dotenv
import { ClientSecretCredential } from '@azure/identity';
import { SecretClient, SecretProperties } from '@azure/keyvault-secrets';

// Define the types for the required environment variables
interface ConfigKeys {
  KV_TENANT_ID: string;
  KV_CLIENT_ID: string;
  KV_CLIENT_SECRET: string;
  KEYVAULT_NAME: string;
}

// Load environment variables from a .env file
loadEnv();

const configKeys: Array<keyof ConfigKeys> = [
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
const credential = new ClientSecretCredential(
  process.env.KV_TENANT_ID as string,
  process.env.KV_CLIENT_ID as string ,
  process.env.KV_CLIENT_SECRET as string,
  {
    additionallyAllowedTenants: ['*'],
  }
);

// Create a SecretClient object to communicate with the Key Vault
const vaultName = process.env.KEYVAULT_NAME!;
const url = `https://${vaultName}.vault.azure.net`;
const client = new SecretClient(url, credential);

// Export the copyKeysToEnv function as the default export
export default async function copyKeysToEnv(): Promise<void> {
  const secretNames: string[] = [];

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
};