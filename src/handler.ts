import { renderFoxEmbed, renderImageEmbed, renderTextEmbed, renderUserRedirect, renderVideoEmbed } from './Renderer';
import { tinyFoxJson, VxJson } from './types';

export default class Handler {
    generate_embed_user_agents = [
        'facebookexternalhit/1.1',
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36',
        'Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US; Valve Steam Client/default/1596241936; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
        'Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US; Valve Steam Client/default/0; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0',
        'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; Valve Steam FriendsUI Tenfoot/0; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
        'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0',
        'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
        'TelegramBot (like TwitterBot)',
        'Mozilla/5.0 (compatible; January/1.0; +https://gitlab.insrt.uk/revolt/january)',
        'Synapse (bot; +https://github.com/matrix-org/synapse)',
        'Iframely/1.3.1 (+https://iframely.com/docs/about)',
        'test'
    ];

    my_user_agent = 'CloudflareWorker/0.0; WeHateX/1.0 (github.com/judge2020/wehatex)';

    should_embed(user_agent: string): boolean {
        return this.generate_embed_user_agents.includes(user_agent) || user_agent.includes('WhatsApp/');
    }

    async fixedUrlWorks(url: string): Promise<boolean> {
        let response = await fetch(url, { method: 'HEAD' });
        return response.status >= 200 && response.status < 300;
    }

    async fix_media(media_url: string): Promise<string> {
        if (media_url.startsWith('https://video.twimg.com')) {
            return media_url.replace('https://video.twimg.com/', 'https://www.vxtwitter.com/tvid/').replace('.mp4', '');
        }
        let fixedImage = this.get_4k_url_from_twimg(media_url);
        if (fixedImage && await this.fixedUrlWorks(fixedImage)) {
            return fixedImage;
        }
        return media_url;
    }

    get_4k_url_from_twimg(url: string): string | null {
        const url_o = new URL(url);
        if (!url_o.hostname.endsWith('twimg.com') || !url_o.pathname.includes('/media/')) {
            return null;
        }
        const pathname = url_o.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        let final = filename.replace(/\.[^/.]+$/, '');
        if (!final || final.length === 0) {
            return null;
        }
        return `https://pbs.twimg.com/media/${final}?format=jpg&name=large`;
    }

    determineEmbedTweet(vx_json: VxJson): VxJson {
        if (!vx_json.qrt) {
            return vx_json;
        }
        if (vx_json.qrt.hasMedia && !vx_json.hasMedia) {
            return vx_json.qrt;
        }
        return vx_json;
    }

    buildText(vx_json: VxJson): string | null {
        // if there's no base text, nothing to build
        if (!vx_json.text) {
            return null;
        }

        let text = vx_json.text;

        // Handle quoted retweet (QRT)
        if (vx_json.qrt?.text?.length) {
            text += `\n\n【QRT of ${vx_json.qrt.user_name} (@${vx_json.qrt.user_screen_name}):】`;
            text += `\n\n'${vx_json.qrt.text}'`;
        }

        // Handle community notes (original or on the quoted tweet)
        if (vx_json.communityNote || vx_json.qrt?.communityNote) {
            const note = vx_json.communityNote ?? vx_json.qrt!.communityNote!;
            const onQuoted = vx_json.communityNote ? '' : ' ON QUOTED';
            text += `\n\n【COMMUNITY NOTE${onQuoted}:】`;
            text += `\n${note}`;
        }

        return text;
    }


    async handleTweet(request: Request): Promise<Response> {
        let url = new URL(request.url);
        let as_split = url.pathname.split('/');
        let should_embed = this.should_embed(request.headers.get('User-Agent')!);

        if (!should_embed && !(request.url.includes('fox=pleading') || request.url.includes('debugjson=true'))) {
            return new Response(renderUserRedirect(as_split[1]), { headers: { 'Content-Type': 'text/html' } });
        }

        // disabled
        if (this.rollD6() == 0) {
            let fox = await fetch('https://api.tinyfox.dev/img.json?animal=fox', {
                headers: {
                    'accept': 'application/json',
                    'user-agent': this.my_user_agent
                }
            });
            let fox_json: tinyFoxJson = await fox.json();
            return new Response(renderFoxEmbed('https://api.tinyfox.dev' + fox_json.loc), { headers: { 'Content-Type': 'text/html' } });
        }

        // logic pretty much copied from BetterTwitFix's logic. This complies with the DWTFYWTPL.

        let vxtwitter_info = await fetch('https://api.vxtwitter.com/i/status/' + as_split[3], { headers: { 'user-agent': this.my_user_agent } });
        let vx_json: VxJson = await vxtwitter_info.json();

        if (request.url.includes('debugjson=true')) {
            return new Response(JSON.stringify(vx_json, null, 4));
        }

        let mediaEmbedVx = this.determineEmbedTweet(vx_json);

        let overrideText = this.buildText(vx_json);

        if (!mediaEmbedVx.hasMedia) {
            return new Response(renderTextEmbed(vx_json, overrideText), { headers: { 'Content-Type': 'text/html' } });
        }

        // Default to the combined Media URL
        if (vx_json.combinedMediaUrl && mediaEmbedVx.allSameType) {
            return new Response(renderImageEmbed(vx_json, vx_json.combinedMediaUrl, overrideText), { headers: { 'Content-Type': 'text/html' } });
        }

        // we aint handling index selection
        let media = mediaEmbedVx.media_extended[0];

        if (!media) {
            return new Response('501 not implemented', { status: 501 });
        }

        if (media.type == 'image') {
            return new Response(renderImageEmbed(vx_json, await this.fix_media(media.url), overrideText), { headers: { 'Content-Type': 'text/html' } });
        } else if (media.type == 'gif') {
            let base_gifconvert = 'https://gifconvert.vxtwitter.com/convert?url=';
            return new Response(renderVideoEmbed(vx_json, media, base_gifconvert + media.url, overrideText), { headers: { 'Content-Type': 'text/html' } });
        } else if (media.type == 'video') {
            // TODO gif handling
            return new Response(renderVideoEmbed(vx_json, media, media.url, overrideText), { headers: { 'Content-Type': 'text/html' } });
        }

        return new Response('501 not implemented', { status: 501 });
    };

    rollD6(): number {
        return Math.floor(Math.random() * 6) + 1;
    }
}
