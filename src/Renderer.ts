import { marked } from 'marked';
import { VxJson, VxMediaExtended } from './types';

let homepage_html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex">
<style type="text/css">body{margin:40px
auto;max-width:650px;line-height:1.6;font-size:18px;color:#444;padding:0
10px}h1,h2,h3{line-height:1.2}</style>
<title>We Hate Xitter.</title>
</head>
<body>
`;

let end_homepage_html = `
</body>
</html>
`

const username_template_var = "TMPLUSRNMETMPL";

let attempt = `
# We hate X.

See [our homepage](/) for more information.

Please try this Bluesky link to see if they are on bluesky: [${username_template_var}.bsky.social](https://${username_template_var}.bsky.social)
`;

export function renderUserPage(markdown: string): any {
	return homepage_html + marked.parse(markdown) + end_homepage_html
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
<title>We Hate Xitter.</title>
</head>
</html>
`;
}

export function renderImageEmbed(vx_json: VxJson, media_url: string): any {
	return renderEmbed(`
<meta name='og:title' content='${vx_json.user_name} (@${vx_json.user_screen_name}) on the worst site' />
<meta name='og:site_name' content='Please stop using X, seriously.' />
<meta name='twitter:card' content='summary_large_image' />
<meta name='twitter:site' content='${media_url}' />
<meta name='og:description' content='${vx_json.text}' />
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

export function renderTextEmbed(vx_json: VxJson): any {

	return renderEmbed(`
	<meta property="og:image" content="${vx_json.user_profile_image_url}" />
	<meta name="twitter:card" content="tweet" />
	<meta name="twitter:image" content="${vx_json.user_profile_image_url}" />
	<meta name="twitter:creator" content="@${vx_json.user_screen_name}" />
	<meta property="og:description" content="${vx_json.text}" />
<meta name='og:title' content='${vx_json.user_name} (@${vx_json.user_screen_name}) on the worst site' />
<meta name='og:site_name' content='Please stop using X, seriously.' />
`);
}

export function renderVideoEmbed(vx_json: VxJson, media: VxMediaExtended, vidlink: string): any {
	let username = vx_json.user_screen_name;
	let name = vx_json["user_name"];
	let text = vx_json["text"];

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
<meta property="og:description" content="${vx_json.text}" />

<meta name='og:title' content='${vx_json.user_name} (@${vx_json.user_screen_name}) on the worst site' />
<meta name='og:site_name' content='Please stop using X, seriously.' />
`);
}
