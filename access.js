const { GoogleAuth } = require('google-auth-library');

// Get a GoogleAuth client instance
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// Get an access token for FCM
const getAccessToken = async () => {
  const accessTokenResponse = await auth.getAccessToken();
  return accessTokenResponse.token;
};

// Use the access token to send a message to FCM
const sendMessage = async (message) => {
  const accessToken = await getAccessToken();
  const response = await fetch('https://fcm.googleapis.com/v1/projects/PROJECT_ID/messages:send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  const data = await response.json();
  return data;
};
