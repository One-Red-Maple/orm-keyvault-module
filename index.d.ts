declare module 'dotenv' {
    export function config(): void;
}

declare module "@azure/identity" {
    export class ClientSecretCredential {
      constructor(tenantId: string, clientId: string, clientSecret: string, options?: { additionallyAllowedTenants: string });
    }
}

declare module "@azure/keyvault-secrets" {
    export class SecretClient {
      constructor(vaultUrl: string, credential: any);
      listPropertiesOfSecrets(): Promise<Array<{ name: string }>>;
      getSecret(secretName: string): Promise<{ value: string }>;
    }
}

declare module "orm-keyvault-module" {
    export function copyKeysToEnv(): Promise<void>;
}
