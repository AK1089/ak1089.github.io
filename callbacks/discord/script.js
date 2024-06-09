function local_on_body_load () {

    // Extract access token from URL fragment
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const token = params.get('access_token');

    // Find the code block
    const tokenElement = document.querySelector('.line-numbers');

    // If token exists, insert it into the element
    if (token && tokenElement) {
        tokenElement.textContent = `Access Token: ${token}`;
    }

    const clientId = '1249379587645771870';
    const scope = 'identify email guilds';
    const responseType = 'token';
    const redirectUri = getHostname() + 'callbacks/discord';

    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;

    // Set the authorization link href
    const authLink = document.getElementById('auth-link');
    if (authLink) {
        authLink.href = authUrl;
    }
}