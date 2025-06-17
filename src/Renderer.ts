import { marked } from 'marked';
import { VxJson, VxMediaExtended } from './types';

let homepage_html = `
<!DOCTYPE html>
<!--suppress CssUnresolvedCustomProperty -->
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex">
  <style>
    :root {
      /* default (light) colors */
      --bg-color: #ffffff;
      --text-color: #444444;
      --link-color: #0066cc;
      --code-bg: rgba(0, 0, 0, 0.05);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        /* eye-friendly dark-mode colors */
        --bg-color: #1e1e1e;
        --text-color: #cfcfcf;
        --link-color: #4ea1ff;
        --code-bg: rgba(255, 255, 255, 0.1);
      }
    }

    body {
      margin: 40px auto;
      max-width: 650px;
      line-height: 1.6;
      font-size: 18px;
      background-color: var(--bg-color);
      color: var(--text-color);
      padding: 0 10px;
    }
    a {
      color: var(--link-color);
    }
    h1, h2, h3 {
      line-height: 1.2;
    }
    code {
      font-size: 14px;
      background-color: var(--code-bg);
      padding: 2px 4px;
      border-radius: 3px;
    }
  </style>
  <title>We Hate X.</title>
</head>
<body>
`;

let end_homepage_html = `
</body>
</html>
`;


const username_template_var = 'TMPLUSRNMETMPL';

let attempt = `
# We hate X.

See [our homepage](/) for more information.

Please try this Bluesky link to see if they are on bluesky: [${username_template_var}.bsky.social](https://${username_template_var}.bsky.social)
`;

export function renderUserPage(markdown: string): any {
    return homepage_html + marked.parse(markdown) + end_homepage_html;
}

export function renderUserRedirect(twitter_username: string): any {
    return renderUserPage(attempt.replaceAll(username_template_var, twitter_username));
}

function renderEmbed(inner_html: string): any {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
${inner_html}
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex">
<title>We Hate X.</title>
</head>
</html>
`;
}

function escapeHtml(str: string|null): string {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


export function renderImageEmbed(vx_json: VxJson, media_url: string, overrideText: string|null): any {
    return renderEmbed(`
<meta name='og:title' content='${escapeHtml(vx_json.user_name)} (@${vx_json.user_screen_name}) on the worst site' />
<meta name='og:site_name' content='Please stop using X, seriously.' />
<meta name='twitter:card' content='summary_large_image' />
<meta name='twitter:site' content='${media_url}' />
<meta name='og:description' content='${escapeHtml(overrideText ?? vx_json.text)}' />
<meta name='twitter:image' content='${media_url}' />
<meta name='twitter:image:alt' content='' />
`);
}

export function renderFoxEmbed(media_url: string): any {
    return renderEmbed(`
<meta name='og:title' content='1d6 → 1 CRITICAL FAILURE. FOX DEPLOYED' />
<meta name='og:site_name' content='FOR THE LOVE OF GOD STOP USING X' />
<meta name='twitter:card' content='summary_large_image' />
<meta name='twitter:site' content='${media_url}' />
<meta name='og:description' content='To reduce the influence X has, this link has been blackholed. YOU MAY TRY AGAIN by appending or changing the URL query params, eg adding ?try=2. Note that this could fail another 1d6.' />
<meta name='twitter:image' content='${media_url}' />
<meta name='twitter:image:alt' content='' />
`);
}

export function renderTextEmbed(vx_json: VxJson, overrideText: string|null): any {

    return renderEmbed(`
	<meta property="og:image" content="${vx_json.user_profile_image_url}" />
	<meta name="twitter:card" content="tweet" />
	<meta name="twitter:image" content="${vx_json.user_profile_image_url}" />
	<meta name="twitter:creator" content="@${escapeHtml(vx_json.user_screen_name)}" />
	<meta property="og:description" content="${escapeHtml(overrideText ?? vx_json.text)}" />
<meta name='og:title' content='${escapeHtml(vx_json.user_name)} (@${vx_json.user_screen_name}) on the worst site' />
<meta name='og:site_name' content='Please stop using X, seriously.' />
`);
}

export function renderVideoEmbed(vx_json: VxJson, media: VxMediaExtended, vidlink: string, overrideText: string|null): any {
    return renderEmbed(`
<meta name="twitter:card" content="player" />
<meta name="twitter:image" content="${media.thumbnail_url}" />

<meta name="twitter:player:width" content="${media.size.width}" />
<meta name="twitter:player:height" content="${media.size.height}" />
<meta name="twitter:player:stream" content="${vidlink}" />
<meta name="twitter:player:stream:content_type" content="video/mp4" />

<meta property="og:url" content="${vidlink}" />
<meta property="og:video" content="${vidlink}" />
<meta property="og:video:secure_url" content="${vidlink}" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="${media.size.width}" />
<meta property="og:video:height" content="${media.size.height}" />
<meta property="og:image" content="${media.thumbnail_url}" />
<meta property="og:description" content="${escapeHtml(overrideText ?? vx_json.text)}" />

<meta name='og:title' content='${escapeHtml(vx_json.user_name)} (@${vx_json.user_screen_name}) on the worst site' />
<meta name='og:site_name' content='Please stop using X, seriously.' />
`);
}
