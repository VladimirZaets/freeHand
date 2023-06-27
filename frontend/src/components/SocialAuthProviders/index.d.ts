export type AuthProvidersType = AuthProviderType[];
export type AuthProviderType = {
  name: string;
  url: string;
  site?: string;
  from?: string;
}
