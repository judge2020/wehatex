export type VxMediaExtended = {
	altText: string|null;
	size: {
		height: number;
		width: number;
	};
	thumbnail_url: string;
	type: string;
	url: string;
}

export type VxJson = {
	allSameType: boolean;
	article: any|null;
	combinedMediaUrl: string|null;
	communityNote: any|null;
	conversationID: string;
	date: string;
	date_epoch: number;
	hasMedia: boolean;
	hashtags: string[];
	lang: string;
	mediaURLs: string[];
	media_extended: VxMediaExtended[];
	pollData: any|null;
	possibly_sensitive: boolean;
	qrt: VxJson|null;
	qrtURL: string|null;
	replies: number;
	retweets: number;
	text: string|null;
	tweetID: string;
	tweetURL: string;
	user_name: string;
	user_profile_image_url: string;
	user_screen_name: string;

}
