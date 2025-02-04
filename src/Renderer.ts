import { marked } from 'marked';

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

export function renderDiscordEmbed(vx_json: any, media_url: string): any {
	let username = vx_json["user_screen_name"];
	let user_profile_image_url = vx_json["user_profile_image_url"];
	let name = vx_json["user_name"];
	let text = vx_json["text"];

	let discord_embed_html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta name='og:title' content='${name} (@${username} on the worst site' />
<meta name='og:site_name' content='Please stop using X, seriously.' />

<meta name='twitter:card' content='summary_large_image' />

<meta name='twitter:site' content='${media_url}' />

<meta name='og:description' content='${text}' />
<meta name='twitter:image' content='${media_url}' />
<meta name='twitter:image:alt' content='' />

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex">
<style type="text/css">body{margin:40px
auto;max-width:650px;line-height:1.6;font-size:18px;color:#444;padding:0
10px}h1,h2,h3{line-height:1.2}</style>
<title>We Hate Xitter.</title>
</head>
</html>
`;
	return discord_embed_html;

}
