/**
 * npx wrangler dev
 * // npx wrangler deploy
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { renderDiscordEmbed, renderUserPage, renderUserRedirect } from './Renderer';

let homepage_md = `
# We hate X.

X is ran by a Nazi, or at least an attention whore very interested in stripping away fundamental human rights by any means necessary.

Please use [Bluesky](https://bsky.app) or a Mastodon instance as a direct replacement.
`;

function should_we_embed(user_agent: string): boolean {
	return user_agent.includes('iscordbot');
}

function get_4k_url_from_twimg(url: string): string | null {
	const url_o = new URL(url);
	if (!url_o.hostname.endsWith("twimg.com") || !url_o.pathname.includes("/media/")) {
		throw new Error("Invalid URL format");
	}
	const pathname = url_o.pathname;
	const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
	let final = filename.replace(/\.[^/.]+$/, "");
	if (!final || final.length === 0) {
		return null;
	}
	return `https://pbs.twimg.com/media/${final}?format=jpg&name=large`;
}

async function fixedUrlWorks(url: string): Promise<boolean> {
	let response = await fetch(url, {method: "HEAD"});
	return response.status >= 200 && response.status < 300;
}

function redirect302(url: string): Response {
	return new Response("", {
		status: 302,
		headers: {
			"location": url,
		}
	})
}


export default {

	// http://wehatexstage.judge.sh/ScottGustin/status/1886877736683311127?debugjson=true
	// http://wehatexstage.judge.sh/ScottGustin/status/1886877736683311127?fox=pleading

	async fetch(request, env, ctx): Promise<Response> {
		let url = new URL(request.url);
		if (url.pathname == '/') {
			return new Response(renderUserPage(homepage_md), {headers: {"Content-Type": "text/html"}});
		}

		let as_split = url.pathname.split('/');
		if (as_split[2] == "status" && as_split[3] && !isNaN(Number(as_split[3]))) {
			// go go go
			let should_embed = should_we_embed(request.headers.get("User-Agent")!);

			if (!should_embed && !(request.url.includes("fox=pleading") || request.url.includes("debugjson=true"))) {
				return new Response(renderUserRedirect(as_split[1]), {headers: {"Content-Type": "text/html"}});
			}

			let vxtwitter_info = await fetch("https://api.vxtwitter.com/i/status/" + as_split[3]);
			let vx_json: any = await vxtwitter_info.json();

			if (request.url.includes("debugjson=true")) {
				return new Response(JSON.stringify(vx_json, null, 4));
			}

			let combined = vx_json["combinedMediaUrl"];

			if (combined) {
				// can't 4k
				return redirect302(vx_json["combinedMediaUrl"]);
			}

			let media_url = vx_json["mediaURLs"][0];
			if (!media_url) {
				// fine I guess we'll directly redirect to vx to handle the discord embed
				return redirect302("https://www.vxtwitter.com/i/status/" + as_split[3]);
			}

			let fixed = get_4k_url_from_twimg(vx_json["mediaURLs"][0]);
			if (fixed && await fixedUrlWorks(fixed)) {
				media_url = fixed;
			}
			return new Response(renderDiscordEmbed(vx_json, media_url), {headers: {"Content-Type": "text/html"}});
		}
		return new Response("404", {status: 404});
	},
} satisfies ExportedHandler<Env>;
