import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';

export const getCredentials = async (identityToken: string) => {
  const cognitoIdentityClient = new CognitoIdentityClient({
    region: 'eu-north-1',
  });

  // Get the identity ID
  const getIdCommand = new GetIdCommand({
    IdentityPoolId: 'eu-north-1:163257d1-b8f4-4fbd-88e1-7edf6d07d7d7',
    Logins: {
      'cognito-idp.eu-north-1.amazonaws.com/eu-north-1_Vvg0QXGcW':
        identityToken,
    },
  });

  const identityResponse = await cognitoIdentityClient.send(getIdCommand);
  const identityId = identityResponse.IdentityId;

  // Get the credentials for the identity
  const getCredentialsCommand = new GetCredentialsForIdentityCommand({
    IdentityId: identityId,
    Logins: {
      'cognito-idp.eu-north-1.amazonaws.com/eu-north-1_Vvg0QXGcW':
        identityToken,
    },
  });

  const credentialsResponse = await cognitoIdentityClient.send(
    getCredentialsCommand,
  );
  const credentials = credentialsResponse.Credentials;

  if (!credentials) {
    throw new Error('Credentials not found!');
  }

  return { credentials, identityId };
};
