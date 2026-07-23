import { PROXY_GROUPS } from "./constants";

const customRules = [
    // CUSTOM_USER_RULES_START
    `DOMAIN,ykk.emby.moe,${PROXY_GROUPS.LOW_COST}`,
    `DOMAIN,random.ouonet.org,${PROXY_GROUPS.LOW_COST}`,
    `DOMAIN,server2.cn2gias.uk,${PROXY_GROUPS.LOW_COST}`,
    `DOMAIN,server3.cn2gias.uk,${PROXY_GROUPS.LOW_COST}`,
    `DOMAIN,s3.array2026.com,${PROXY_GROUPS.LOW_COST}`,
    `DOMAIN,neo.iflya321.com,${PROXY_GROUPS.LOW_COST}`,
    `DOMAIN,cflocal.xxlb.net,${PROXY_GROUPS.LOW_COST}`,
    `DOMAIN,pc528.net,DIRECT`,
    // CUSTOM_USER_RULES_END
];

const baseRules = [
    `DST-PORT,22,${PROXY_GROUPS.SSH}`,
    `GEOIP,private,DIRECT,no-resolve`,

    `RULE-SET,Tracking,${PROXY_GROUPS.AD_BLOCK}`,
    `RULE-SET,Advertising,${PROXY_GROUPS.AD_BLOCK}`,
    `RULE-SET,ADBlock,${PROXY_GROUPS.AD_BLOCK}`,
    `RULE-SET,AdditionalFilter,${PROXY_GROUPS.AD_BLOCK}`,
    `RULE-SET,AdvertisingIP,${PROXY_GROUPS.AD_BLOCK},no-resolve`,
    `RULE-SET,SogouInput,${PROXY_GROUPS.SOGOU_INPUT}`,

    `RULE-SET,Private,DIRECT`,
    `RULE-SET,Direct,DIRECT`,
    `RULE-SET,LocationDKS,${PROXY_GROUPS.LOCATION_DKS}`,
    `RULE-SET,XPTV,DIRECT`,
    `RULE-SET,Download,${PROXY_GROUPS.DOWNLOAD}`,
    `RULE-SET,AppleCN,DIRECT`,
    `RULE-SET,SteamFix,DIRECT`,
    `RULE-SET,GoogleFCM,DIRECT`,
    `GEOSITE,google-cn,DIRECT`,
    `GEOSITE,google-play@cn,DIRECT`,
    `GEOSITE,microsoft@cn,DIRECT`,
    `GEOSITE,category-games@cn,DIRECT`,
    `GEOSITE,category-game-platforms-download,DIRECT`,
    `GEOSITE,category-public-tracker,DIRECT`,
    `RULE-SET,PrivateIP,DIRECT,no-resolve`,
    `RULE-SET,XPTVIP,DIRECT,no-resolve`,

    ...customRules,


    `DOMAIN-SUFFIX,truthsocial.com,${PROXY_GROUPS.TRUTH_SOCIAL}`,
    `DOMAIN-KEYWORD,speedtest,${PROXY_GROUPS.SPEEDTEST}`,
    `RULE-SET,Speedtest,${PROXY_GROUPS.SPEEDTEST}`,
    `RULE-SET,StaticResources,${PROXY_GROUPS.STATIC_RESOURCES}`,
    `RULE-SET,CDNResources,${PROXY_GROUPS.STATIC_RESOURCES}`,
    `RULE-SET,AdditionalCDNResources,${PROXY_GROUPS.STATIC_RESOURCES}`,
    `GEOSITE,openai,${PROXY_GROUPS.AI_SERVICE}`,
    `RULE-SET,AI,${PROXY_GROUPS.AI_SERVICE}`,
    `RULE-SET,AIIP,${PROXY_GROUPS.AI_SERVICE},no-resolve`,
    `GEOSITE,category-ai-!cn,${PROXY_GROUPS.AI_SERVICE}`,

    `GEOSITE,bilibili,${PROXY_GROUPS.BILIBILI}`,
    `GEOSITE,bahamut,${PROXY_GROUPS.BAHAMUT}`,
    `RULE-SET,YouTube,${PROXY_GROUPS.YOUTUBE}`,
    `GEOSITE,youtube,${PROXY_GROUPS.YOUTUBE}`,
    `RULE-SET,Netflix,${PROXY_GROUPS.NETFLIX}`,
    `RULE-SET,NetflixIP,${PROXY_GROUPS.NETFLIX},no-resolve`,
    `GEOSITE,netflix,${PROXY_GROUPS.NETFLIX}`,
    `GEOIP,netflix,${PROXY_GROUPS.NETFLIX},no-resolve`,
    `RULE-SET,Emby,${PROXY_GROUPS.EMBY}`,
    `RULE-SET,EmbyIP,${PROXY_GROUPS.EMBY},no-resolve`,
    `RULE-SET,Streaming,${PROXY_GROUPS.STREAMING}`,
    `RULE-SET,StreamingIP,${PROXY_GROUPS.STREAMING},no-resolve`,
    `GEOSITE,twitch,${PROXY_GROUPS.TWITCH}`,
    `GEOSITE,spotify,${PROXY_GROUPS.SPOTIFY}`,
    `RULE-SET,TikTok,${PROXY_GROUPS.TIKTOK}`,
    `RULE-SET,NewsMedia,${PROXY_GROUPS.NEWS_MEDIA}`,
    `GEOSITE,apple-tvplus,${PROXY_GROUPS.STREAMING}`,
    `GEOSITE,disney,${PROXY_GROUPS.STREAMING}`,
    `GEOSITE,hbo,${PROXY_GROUPS.STREAMING}`,
    `GEOSITE,primevideo,${PROXY_GROUPS.STREAMING}`,
    `GEOSITE,category-entertainment,${PROXY_GROUPS.STREAMING}`,

    `RULE-SET,Telegram,${PROXY_GROUPS.TELEGRAM}`,
    `RULE-SET,TelegramIP,${PROXY_GROUPS.TELEGRAM},no-resolve`,
    `GEOSITE,telegram,${PROXY_GROUPS.TELEGRAM}`,
    `GEOIP,telegram,${PROXY_GROUPS.TELEGRAM},no-resolve`,
    `RULE-SET,Twitter,${PROXY_GROUPS.TWITTER}`,
    `GEOSITE,twitter,${PROXY_GROUPS.TWITTER}`,
    `RULE-SET,SocialMedia,${PROXY_GROUPS.SOCIAL_MEDIA}`,
    `RULE-SET,SocialMediaIP,${PROXY_GROUPS.SOCIAL_MEDIA},no-resolve`,
    `RULE-SET,Facebook,${PROXY_GROUPS.SOCIAL_MEDIA}`,
    `RULE-SET,FacebookIP,${PROXY_GROUPS.SOCIAL_MEDIA},no-resolve`,
    `RULE-SET,Weibo,${PROXY_GROUPS.WEIBO}`,

    `GEOSITE,xbox,${PROXY_GROUPS.XBOX}`,
    `GEOSITE,steam,${PROXY_GROUPS.GAMES}`,
    `RULE-SET,Games,${PROXY_GROUPS.GAMES}`,
    `GEOSITE,category-ecommerce,${PROXY_GROUPS.SELECT}`,
    `GEOSITE,github,${PROXY_GROUPS.GITHUB}`,
    `RULE-SET,Crypto,${PROXY_GROUPS.CRYPTO}`,
    `RULE-SET,EHentai,${PROXY_GROUPS.EHENTAI}`,
    `GEOSITE,pikpak,${PROXY_GROUPS.PIKPAK}`,
    `RULE-SET,Apple,${PROXY_GROUPS.APPLE}`,
    `GEOSITE,apple,${PROXY_GROUPS.APPLE}`,
    `RULE-SET,Microsoft,${PROXY_GROUPS.MICROSOFT}`,
    `GEOSITE,microsoft,${PROXY_GROUPS.MICROSOFT}`,
    `RULE-SET,Google,${PROXY_GROUPS.GOOGLE}`,
    `RULE-SET,GoogleIP,${PROXY_GROUPS.GOOGLE},no-resolve`,
    `GEOSITE,google,${PROXY_GROUPS.GOOGLE}`,

    `RULE-SET,Proxy,${PROXY_GROUPS.SELECT}`,
    `RULE-SET,ProxyIP,${PROXY_GROUPS.SELECT},no-resolve`,
    `RULE-SET,GFWList,${PROXY_GROUPS.SELECT}`,
    `RULE-SET,China,DIRECT`,
    `RULE-SET,ChinaIP,DIRECT,no-resolve`,
    `GEOIP,cn,DIRECT`,
    `MATCH,${PROXY_GROUPS.FINAL}`,
];

/**
 * 构建最终的规则列表。
 *
 * @param {Object} params - 构建参数
 * @param {boolean} params.quicEnabled - 是否启用 QUIC（如未启用会插入 UDP:443 拦截规则）
 * @returns {string[]} 规则字符串数组
 */
export function buildRules({ quicEnabled }: { quicEnabled: boolean }): string[] {
    const ruleList = [...baseRules];
    if (!quicEnabled) {
        ruleList.unshift("AND,((DST-PORT,443),(NETWORK,UDP)),REJECT");
    }
    return ruleList;
}
