import copyKeysToEnv from './index';

async function useKeys() {
  await copyKeysToEnv();

  // Now you can access the secrets as environment variables
  console.log(process.env.KV_TENANT_ID);
  console.log(process.env.KV_CLIENT_ID);
  console.log(process.env.KV_CLIENT_SECRET);
  console.log(process.env.KEYVAULT_NAME);
}

useKeys();