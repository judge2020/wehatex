/**
 * npx wrangler dev
 * // npx wrangler deploy
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { renderUserPage } from './Renderer';
import Handler from './handler';

let homepage_md = `
# We hate X.

X is ran by a Nazi, or at least an attention whore who [would have ousted hiding Jews and other ethnic groups in Nazi Germany in an instant](https://rr.judge.sh/hz5o0p580zge1.jpeg).

Please use [Bluesky](https://bsky.app) or a Mastodon instance as a direct replacement.
`;

export default {

	// http://wehatexstage.judge.sh/ScottGustin/status/1886877736683311127?debugjson=true
	// http://wehatexstage.judge.sh/ScottGustin/status/1886877736683311127?fox=pleading

	async fetch(request, env, ctx): Promise<Response> {
		let url = new URL(request.url);
		let handler = new Handler;
		if (url.pathname == '/') {
			return new Response(renderUserPage(homepage_md), {headers: {"Content-Type": "text/html"}});
		}

		let as_split = url.pathname.split('/');
		if (as_split[2] == "status" && as_split[3] && !isNaN(Number(as_split[3]))) {
			return handler.handleTweet(request);

		}
		return new Response("404", {status: 404});
	},
} satisfies ExportedHandler<Env>;
