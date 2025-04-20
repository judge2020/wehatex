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

X, formerly known as Twitter, is ran by a Nazi.

Unfortunately, X is still the epicenter for a lot of discourse, art, political updates, etc. This continues to give it, and its owner, unprecedented control over the dissemination of information.

This site exists as a "check valve" for X: by changing an X link's domain from \`x.com\` to \`APP_HOSTNAME\`, it will embed into various applications (like Discord), but will show a block screen when visited from regular browsers, [like so](https://APP_HOSTNAME/i/status/1856383314468442217).

Hopefully, this tool can help reduce reliance on X in the long-run by denying click traffic from embeds.

---

There are many alternative platforms I urge you to prioritize browsing over X. [Bluesky](https://bsky.app) is the current frontrunner, with only a few issues such as [no support for images in Direct Messages](https://bsky.app/profile/ploommy.bsky.social/post/3ln2aftabnc2w).

There is also Mastodon, which is highly federated and enables you to own your data or escrow it with a trusted admin instead of a central platform. Unfortunately, Mastodon's popularity has drastically fallen outside of few special interests groups.

---

This site uses the  BetterTwitFix (vxtwitter / fixvx) API to obtain its tweet data and has copied some of its logic to mirror vxtwitter embeds as closely as possible. [source](https://github.com/judge2020/wehatex)

`;

export default {

    // http://wehatexstage.judge.sh/ScottGustin/status/1886877736683311127?debugjson=true
    // http://wehatexstage.judge.sh/ScottGustin/status/1886877736683311127?fox=pleading

    async fetch(request, env, ctx): Promise<Response> {
        let url = new URL(request.url);
        let handler = new Handler;
        if (url.pathname == '/') {
            return new Response(renderUserPage(homepage_md.replaceAll('APP_HOSTNAME', url.hostname)), { headers: { 'Content-Type': 'text/html' } });
        }

        let as_split = url.pathname.split('/');
        if (as_split[2] == 'status' && as_split[3] && !isNaN(Number(as_split[3]))) {
            return handler.handleTweet(request);

        }
        return new Response('404', { status: 404 });
    }
} satisfies ExportedHandler<Env>;
