/*!
powerfullz 的 Substore 订阅转换脚本
https://github.com/powerfullz/override-rules

支持的传入参数：
- grouptype: 地区代理组类型（0=select 手动选择, 1=url-test 自动测速, 2=load-balance 负载均衡，默认 0）
  - 向后兼容：若未传 grouptype 但传了 loadbalance，则 loadbalance=true 映射为 grouptype=2，loadbalance=false 映射为 grouptype=1
- landing: auto-detected from nodes with `dialer-proxy` field; no user parameter needed
- ipv6: 启用 IPv6 支持（默认 false）
- tun: 启用 TUN 模式（默认 false）
- full: 输出完整配置（适合纯内核启动，默认 false）
- keepalive: 启用 tcp-keep-alive（默认 false）
- fakeip: DNS 使用 FakeIP 模式（默认 true；传 false 时为 RedirHost）
- quic: 允许 QUIC 流量（UDP 443，默认 false）
- threshold: 地区节点数量小于该值时不显示分组 (默认 0)
- regex: 使用正则过滤模式（include-all + filter）写入各地区代理组，而非直接枚举节点名称（默认 false）

源码已迁移至 `src/*.ts`。
*/
"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/utils.ts
  function parseBool(value, defaultValue = false) {
    if (typeof value === "undefined") return defaultValue;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return value.toLowerCase() === "true" || value === "1";
    }
    return false;
  }
  function parseNumber(value, defaultValue = 0) {
    if (value === null || typeof value === "undefined") {
      return defaultValue;
    }
    const num = parseInt(String(value), 10);
    return Number.isNaN(num) ? defaultValue : num;
  }
  function buildList(...elements) {
    return elements.flat().filter(Boolean);
  }
  function createCaseInsensitiveNodeMatcher(source) {
    return {
      source,
      regex: new RegExp(source, "i"),
      pattern: `(?i)${source}`
    };
  }
  function isNotNull(v) {
    return v !== null;
  }
  var init_utils = __esm({
    "src/utils.ts"() {
      "use strict";
    }
  });

  // src/constants.ts
  var NODE_SUFFIX, CDN_URL, SPEEDTEST_URL, LOW_COST_NODE_MATCHER, PROXY_GROUPS, countriesMeta;
  var init_constants = __esm({
    "src/constants.ts"() {
      "use strict";
      init_utils();
      NODE_SUFFIX = "节点";
      CDN_URL = "https://cdn.jsdelivr.net";
      SPEEDTEST_URL = "https://cp.cloudflare.com";
      LOW_COST_NODE_MATCHER = createCaseInsensitiveNodeMatcher(
        String.raw`0\.[0-5]|低倍率|省流|实验性`
      );
      PROXY_GROUPS = {
        SELECT: "选择代理",
        MANUAL: "手动选择",
        AUTO: "自动选择",
        FALLBACK: "故障转移",
        LANDING: "落地节点",
        LOW_COST: "低倍率节点",
        FRONT_PROXY: "前置代理",
        STATIC_RESOURCES: "静态资源",
        SPEEDTEST: "网络测试",
        LOCATION_DKS: "抖快书定位",
        AI_SERVICE: "AI服务",
        CRYPTO: "加密货币",
        DOWNLOAD: "下载服务",
        GAMES: "游戏平台",
        APPLE: "苹果服务",
        GOOGLE: "谷歌服务",
        MICROSOFT: "微软服务",
        BILIBILI: "哔哩哔哩",
        BAHAMUT: "巴哈姆特",
        XBOX: "Xbox",
        GITHUB: "Github",
        YOUTUBE: "Youtube",
        EMBY: "Emby",
        STREAMING: "国际媒体",
        NEWS_MEDIA: "新闻媒体",
        NETFLIX: "Netflix",
        TIKTOK: "TikTok",
        SPOTIFY: "Spotify",
        EHENTAI: "E-Hentai",
        TELEGRAM: "Telegram",
        SOCIAL_MEDIA: "社交平台",
        TRUTH_SOCIAL: "Truth Social",
        TWITTER: "Twitter",
        TWITCH: "Twitch",
        WEIBO: "新浪微博",
        PIKPAK: "PikPak网盘",
        SSH: "SSH",
        SOGOU_INPUT: "搜狗输入法",
        AD_BLOCK: "广告拦截",
        GLOBAL: "GLOBAL",
        FINAL: "Final"
      };
      countriesMeta = {
        香港: {
          weight: 10,
          pattern: "香港|港|\\b(?:HK|hk)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Hong Kong|HongKong|hongkong|HONG KONG|HONGKONG|深港|HKG|九龙|Kowloon|新界|沙田|荃湾|葵涌|🇭🇰",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png`
        },
        澳门: {
          pattern: "澳门|\\b(?:MO|mo)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Macau|🇲🇴",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Macao.png`
        },
        台湾: {
          weight: 20,
          pattern: "台|新北|彰化|\\b(?:TW|tw)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Taiwan|TAIWAN|TWN|TPE|ROC|🇹🇼|🇼🇸",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png`
        },
        新加坡: {
          weight: 30,
          pattern: "新加坡|坡|狮城|\\b(?:SG|sg)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Singapore|SINGAPORE|SIN|🇸🇬",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Singapore.png`
        },
        日本: {
          weight: 40,
          pattern: "日本|川日|东京|大阪|泉日|埼玉|沪日|深日|\\b(?:JP|jp)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Japan|JAPAN|JPN|NRT|HND|KIX|TYO|OSA|关西|Kansai|KANSAI|🇯🇵",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Japan.png`
        },
        韩国: {
          weight: 45,
          pattern: "韩国|韩|韓|春川|Chuncheon|首尔|\\b(?:KR|kr)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Korea|KOREA|KOR|ICN|🇰🇷",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Korea.png`
        },
        美国: {
          weight: 50,
          pattern: "美国|美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|纽约|亚特兰大|迈阿密|华盛顿|\\b(?:US|us)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|United States|UnitedStates|UNITED STATES|USA|America|AMERICA|JFK|EWR|IAD|ATL|ORD|MIA|NYC|LAX|SFO|SEA|DFW|SJC|🇺🇸",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/United_States.png`,
          excludePattern: "美属|亚美尼亚|圣多美|普林西比"
        },
        加拿大: {
          weight: 55,
          pattern: "加拿大|渥太华|温哥华|卡尔加里|蒙特利尔|Montreal|\\b(?:CA|ca)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Canada|CANADA|CAN|YVR|YYZ|YUL|🇨🇦",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Canada.png`
        },
        英国: {
          weight: 60,
          pattern: "英国|伦敦|曼彻斯特|Manchester|\\b(?:UK|uk)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Britain|United Kingdom|UNITED KINGDOM|England|GBR|LHR|MAN|🇬🇧",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/United_Kingdom.png`
        },
        澳大利亚: {
          pattern: "澳洲|澳大利亚|\\b(?:AU|au)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Australia|🇦🇺",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Australia.png`
        },
        德国: {
          weight: 70,
          pattern: "德国|德|柏林|法兰克福|慕尼黑|Munich|\\b(?:DE|de)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Germany|GERMANY|DEU|MUC|🇩🇪",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Germany.png`,
          excludePattern: "瓜德罗普"
        },
        法国: {
          weight: 80,
          pattern: "法国|法|巴黎|马赛|Marseille|\\b(?:FR|fr)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|France|FRANCE|FRA|CDG|MRS|🇫🇷",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/France.png`,
          excludePattern: "法属|布基纳法索|法罗"
        },
        俄罗斯: {
          pattern: "俄罗斯|俄|\\b(?:RU|ru)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Russia|🇷🇺",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Russia.png`,
          excludePattern: "埃塞俄比亚|白俄罗斯"
        },
        泰国: {
          pattern: "泰国|泰|\\b(?:TH|th)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Thailand|🇹🇭",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Thailand.png`,
          excludePattern: "巴泰"
        },
        印度: {
          pattern: "印度|\\b(?:IN|in)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|India|🇮🇳",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/India.png`,
          excludePattern: "印度洋"
        },
        马来西亚: {
          pattern: "马来西亚|马来|\\b(?:MY|my)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Malaysia|🇲🇾",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Malaysia.png`
        },
        阿根廷: {
          pattern: "阿根廷|布宜诺斯艾利斯|\\b(?:AR|ar)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Argentina|EZE|🇦🇷",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Argentina.png`
        },
        芬兰: {
          pattern: "芬兰|赫尔辛基|\\b(?:FI|fi)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Finland|HEL|🇫🇮",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Finland.png`
        },
        埃及: {
          pattern: "埃及|开罗|\\b(?:EG|eg)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Egypt|CAI|🇪🇬",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Egypt.png`
        },
        菲律宾: {
          pattern: "菲律宾|马尼拉|\\b(?:PH|ph)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Philippines|MNL|🇵🇭",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Philippines.png`
        },
        土耳其: {
          pattern: "土耳其|伊斯坦布尔|\\b(?:TR|tr)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Turkey|Türkiye|IST|🇹🇷",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Turkey.png`
        },
        乌克兰: {
          pattern: "乌克兰|基辅|\\b(?:UA|ua)(?:[-_ ]?\\d+(?:[-_ ]?[A-Za-z]{2,})?)?\\b|Ukraine|KBP|🇺🇦",
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Ukraine.png`
        }
      };
    }
  });

  // src/args.ts
  function parseGroupType(args) {
    if (parseBool(args.loadbalance)) return 2;
    const raw = parseNumber(args.grouptype, 1);
    if (raw === 0 || raw === 1 || raw === 2) return raw;
    return 1;
  }
  function buildFeatureFlags(args) {
    return {
      groupType: parseGroupType(args),
      ipv6Enabled: parseBool(args.ipv6),
      fullConfig: parseBool(args.full),
      keepAliveEnabled: parseBool(args.keepalive),
      fakeIPEnabled: parseBool(args.fakeip, true),
      quicEnabled: parseBool(args.quic),
      regexFilter: parseBool(args.regex),
      tunEnabled: parseBool(args.tun),
      countryThreshold: parseNumber(args.threshold, 2)
    };
  }
  var init_args = __esm({
    "src/args.ts"() {
      "use strict";
      init_utils();
    }
  });

  // src/proxy_groups.ts
  function buildGroupByType({
    name,
    icon,
    groupType,
    nodeSource
  }) {
    switch (groupType) {
      case 0:
        return { name, icon, type: "select", ...nodeSource };
      case 1:
        return {
          name,
          icon,
          type: "url-test",
          url: SPEEDTEST_URL,
          interval: 60,
          tolerance: 20,
          ...nodeSource
        };
      case 2:
        return {
          name,
          icon,
          type: "load-balance",
          strategy: "sticky-sessions",
          url: SPEEDTEST_URL,
          interval: 60,
          tolerance: 20,
          ...nodeSource
        };
    }
  }
  function buildProxyGroups({
    regexFilter,
    groupType,
    countryNames,
    countryNodes,
    lowCostNodes,
    landing,
    landingNodes,
    defaultProxies,
    defaultProxiesDirect,
    defaultSelector,
    defaultFallback,
    frontProxySelector
  }) {
    const hasTW = countryNames.includes("台湾");
    const hasHK = countryNames.includes("香港");
    const hasUS = countryNames.includes("美国");
    const groups = [
      {
        name: PROXY_GROUPS.SELECT,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Proxy.png`,
        type: "select",
        proxies: defaultSelector
      },
      {
        name: PROXY_GROUPS.MANUAL,
        icon: `${CDN_URL}/gh/shindgewongxj/WHATSINStash@master/icon/select.png`,
        "include-all": true,
        type: "select"
      },
      landing ? {
        name: PROXY_GROUPS.FRONT_PROXY,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Area.png`,
        type: "select",
        proxies: frontProxySelector
      } : null,
      landing ? {
        name: PROXY_GROUPS.LANDING,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Airport.png`,
        type: "select",
        proxies: landingNodes.map((node) => node.name).filter(isNotNull)
      } : null,
      {
        name: PROXY_GROUPS.STATIC_RESOURCES,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Cloudflare.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.SPEEDTEST,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Speedtest.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.LOCATION_DKS,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Null_Nation.png`,
        type: "select",
        proxies: defaultProxiesDirect
      },
      {
        name: PROXY_GROUPS.AI_SERVICE,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/ChatGPT.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.CRYPTO,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Cryptocurrency_1.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.DOWNLOAD,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Download.png`,
        type: "select",
        proxies: defaultProxiesDirect
      },
      {
        name: PROXY_GROUPS.GAMES,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Game.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.APPLE,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Apple_2.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.GOOGLE,
        icon: `${CDN_URL}/gh/Orz-3/mini@master/Color/Google.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.MICROSOFT,
        icon: `${CDN_URL}/gh/powerfullz/override-rules@master/icons/Microsoft_Copilot.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.XBOX,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Xbox.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.GITHUB,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/GitHub.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.BILIBILI,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/bilibili.png`,
        type: "select",
        proxies: hasTW && hasHK ? ["DIRECT", `台湾节点`, `香港节点`] : defaultProxiesDirect
      },
      {
        name: PROXY_GROUPS.BAHAMUT,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Bahamut.png`,
        type: "select",
        proxies: hasTW ? [`台湾节点`, PROXY_GROUPS.SELECT, PROXY_GROUPS.MANUAL, "DIRECT"] : defaultProxies
      },
      {
        name: PROXY_GROUPS.YOUTUBE,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/YouTube.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.EMBY,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Emby.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.STREAMING,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/DomesticMedia.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.NEWS_MEDIA,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Apple_News.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.TWITCH,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Twitch.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.NETFLIX,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Netflix.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.TIKTOK,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/TikTok.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.SPOTIFY,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Spotify.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.TELEGRAM,
        icon: `${CDN_URL}/gh/powerfullz/override-rules@master/icons/Telegram.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.SOCIAL_MEDIA,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/PBS.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.TWITTER,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Twitter.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.WEIBO,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Weibo.png`,
        type: "select",
        "include-all": true,
        proxies: defaultProxiesDirect
      },
      {
        name: PROXY_GROUPS.TRUTH_SOCIAL,
        icon: `${CDN_URL}/gh/powerfullz/override-rules@master/icons/Truth_Social.png`,
        type: "select",
        proxies: hasUS ? [`美国节点`, PROXY_GROUPS.SELECT, PROXY_GROUPS.MANUAL] : defaultProxies
      },
      {
        name: PROXY_GROUPS.EHENTAI,
        icon: `${CDN_URL}/gh/powerfullz/override-rules@master/icons/Ehentai.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.PIKPAK,
        icon: `${CDN_URL}/gh/powerfullz/override-rules@master/icons/PikPak.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.SOGOU_INPUT,
        icon: `${CDN_URL}/gh/powerfullz/override-rules@master/icons/Sougou.png`,
        type: "select",
        proxies: ["DIRECT", "REJECT"]
      },
      {
        name: PROXY_GROUPS.SSH,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Server.png`,
        type: "select",
        proxies: defaultProxies
      },
      {
        name: PROXY_GROUPS.AD_BLOCK,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/AdBlack.png`,
        type: "select",
        proxies: ["REJECT", "REJECT-DROP", "DIRECT"]
      },
      {
        name: PROXY_GROUPS.FINAL,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Final.png`,
        type: "select",
        proxies: [PROXY_GROUPS.SELECT, "DIRECT"]
      },
      {
        name: PROXY_GROUPS.AUTO,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Auto.png`,
        type: "url-test",
        url: SPEEDTEST_URL,
        proxies: defaultFallback,
        interval: 60,
        tolerance: 20
      },
      {
        name: PROXY_GROUPS.FALLBACK,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Available_1.png`,
        type: "fallback",
        url: SPEEDTEST_URL,
        proxies: defaultFallback,
        interval: 60,
        tolerance: 20
      },
      buildGroupByType({
        name: PROXY_GROUPS.LOW_COST,
        icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Lab.png`,
        groupType: lowCostNodes.length > 0 ? groupType : 0,
        nodeSource: lowCostNodes.length > 0 ? regexFilter ? { "include-all": true, filter: LOW_COST_NODE_MATCHER.pattern } : { proxies: lowCostNodes.map((node) => node.name).filter(isNotNull) } : { proxies: [...defaultFallback, PROXY_GROUPS.MANUAL, "DIRECT"] }
      }),
      ...countryNames.map((country) => {
        const meta = countriesMeta[country];
        if (!meta) return null;
        const nodeSource = regexFilter ? {
          "include-all": true,
          filter: meta.pattern,
          ...meta.excludePattern ? { "exclude-filter": meta.excludePattern } : {}
        } : { proxies: countryNodes[country]?.map((n) => n.name).filter(isNotNull) };
        return buildGroupByType({
          name: `${country}${NODE_SUFFIX}`,
          icon: meta.icon,
          groupType,
          nodeSource
        });
      })
    ];
    return groups.filter(isNotNull);
  }
  var init_proxy_groups = __esm({
    "src/proxy_groups.ts"() {
      "use strict";
      init_constants();
      init_utils();
    }
  });

  // src/node_parser.ts
  function parseLowCost(nodes) {
    return (nodes || []).filter((proxy) => LOW_COST_NODE_MATCHER.regex.test(proxy.name || ""));
  }
  function parseNodesByLanding(nodes) {
    const landingNodes = [];
    const nonLandingNodes = [];
    for (const node of nodes || []) {
      const name = node.name;
      if (!name) continue;
      if (node["dialer-proxy"] === "前置代理") {
        landingNodes.push(node);
      } else {
        nonLandingNodes.push(node);
      }
    }
    return { landingNodes, nonLandingNodes };
  }
  function parseCountries(nodes) {
    const countryNodes = /* @__PURE__ */ Object.create(null);
    for (const node of nodes) {
      const name = node.name || "";
      for (const [country, regex] of Object.entries(COUNTRY_REGEX_MAP)) {
        if (!regex.test(name)) continue;
        if (COUNTRY_EXCLUDE_MAP[country]?.test(name)) continue;
        if (!countryNodes[country]) {
          countryNodes[country] = [];
        }
        countryNodes[country].push(node);
        break;
      }
    }
    return countryNodes;
  }
  function getActiveCountryNames(countryNodes, minCount) {
    const filtered = Object.entries(countryNodes).filter(([, nodes]) => nodes.length >= minCount);
    filtered.sort(([a], [b]) => {
      const wa = countriesMeta[a]?.weight ?? Infinity;
      const wb = countriesMeta[b]?.weight ?? Infinity;
      return wa - wb;
    });
    return filtered.map(([country]) => country);
  }
  var COUNTRY_REGEX_MAP, COUNTRY_EXCLUDE_MAP;
  var init_node_parser = __esm({
    "src/node_parser.ts"() {
      "use strict";
      init_constants();
      COUNTRY_REGEX_MAP = Object.fromEntries(
        Object.entries(countriesMeta).map(([country, meta]) => {
          return [country, new RegExp(meta.pattern.replace(/^\(\?i\)/, ""))];
        })
      );
      COUNTRY_EXCLUDE_MAP = Object.fromEntries(
        Object.entries(countriesMeta).filter(([, meta]) => meta.excludePattern).map(([country, meta]) => [country, new RegExp(meta.excludePattern)])
      );
    }
  });

  // src/rules.ts
  function buildRules({ quicEnabled }) {
    const ruleList = [...baseRules];
    if (!quicEnabled) {
      ruleList.unshift("AND,((DST-PORT,443),(NETWORK,UDP)),REJECT");
    }
    return ruleList;
  }
  var customRules, baseRules;
  var init_rules = __esm({
    "src/rules.ts"() {
      "use strict";
      init_constants();
      customRules = [
        // CUSTOM_USER_RULES_START
        `DOMAIN,ykk.emby.moe,${PROXY_GROUPS.LOW_COST}`,
        `DOMAIN,random.ouonet.org,${PROXY_GROUPS.LOW_COST}`,
        `DOMAIN,server2.cn2gias.uk,${PROXY_GROUPS.LOW_COST}`,
        `DOMAIN,server3.cn2gias.uk,${PROXY_GROUPS.LOW_COST}`,
        `DOMAIN,s3.array2026.com,${PROXY_GROUPS.LOW_COST}`,
        `DOMAIN,neo.iflya321.com,${PROXY_GROUPS.LOW_COST}`,
        `DOMAIN,cflocal.xxlb.net,${PROXY_GROUPS.LOW_COST}`,
        `DOMAIN-SUFFIX,pc528.net,DIRECT`
        // CUSTOM_USER_RULES_END
      ];
      baseRules = [
        `DST-PORT,22,${PROXY_GROUPS.SSH}`,
        `GEOIP,private,DIRECT,no-resolve`,
        `DOMAIN-SUFFIX,hotjar.com,DIRECT`,
        `DOMAIN-SUFFIX,hotjar.io,DIRECT`,
        `DOMAIN-SUFFIX,contentsquare.com,DIRECT`,
        `DOMAIN-SUFFIX,contentsquare.net,DIRECT`,
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
        `MATCH,${PROXY_GROUPS.FINAL}`
      ];
    }
  });

  // src/rule_providers.ts
  function osDomain(name) {
    return {
      type: "http",
      behavior: "domain",
      format: "mrs",
      interval: 86400,
      url: `${OS_RULE_BASE}/domain/${name}.mrs`,
      path: `./ruleset/666OS/domain/${name}.mrs`
    };
  }
  function osIP(name) {
    return {
      type: "http",
      behavior: "ipcidr",
      format: "mrs",
      interval: 86400,
      url: `${OS_RULE_BASE}/ip/${name}.mrs`,
      path: `./ruleset/666OS/ip/${name}.mrs`
    };
  }
  var OS_RULE_BASE, ruleProviders;
  var init_rule_providers = __esm({
    "src/rule_providers.ts"() {
      "use strict";
      init_constants();
      OS_RULE_BASE = `${CDN_URL}/gh/enjoyracionw-sudo/Johnson-rules@dist/rules/666OS`;
      ruleProviders = {
        Tracking: osDomain("Tracking"),
        Advertising: osDomain("Advertising"),
        Direct: osDomain("Direct"),
        LocationDKS: osDomain("LocationDKS"),
        Private: osDomain("Private"),
        Download: osDomain("Download"),
        Speedtest: osDomain("Speedtest"),
        AI: osDomain("AI"),
        Telegram: osDomain("Telegram"),
        Twitter: osDomain("Twitter"),
        SocialMedia: osDomain("SocialMedia"),
        NewsMedia: osDomain("NewsMedia"),
        Games: osDomain("Games"),
        Crypto: osDomain("Crypto"),
        Netflix: osDomain("Netflix"),
        YouTube: osDomain("YouTube"),
        XPTV: osDomain("XPTV"),
        Emby: osDomain("Emby"),
        Streaming: osDomain("Streaming"),
        AppleCN: osDomain("AppleCN"),
        Apple: osDomain("Apple"),
        Google: osDomain("Google"),
        Microsoft: osDomain("Microsoft"),
        Facebook: osDomain("Facebook"),
        Proxy: osDomain("Proxy"),
        China: osDomain("China"),
        AdvertisingIP: osIP("Advertising"),
        PrivateIP: osIP("Private"),
        AIIP: osIP("AI"),
        TelegramIP: osIP("Telegram"),
        SocialMediaIP: osIP("SocialMedia"),
        XPTVIP: osIP("XPTV"),
        EmbyIP: osIP("Emby"),
        NetflixIP: osIP("Netflix"),
        StreamingIP: osIP("Streaming"),
        GoogleIP: osIP("Google"),
        FacebookIP: osIP("Facebook"),
        ProxyIP: osIP("Proxy"),
        ChinaIP: osIP("China"),
        ADBlock: {
          type: "http",
          behavior: "domain",
          format: "yaml",
          interval: 86400,
          url: `${CDN_URL}/gh/217heidai/adblockfilters@main/rules/adblockmihomolite.yaml`,
          path: "./ruleset/ADBlock.yaml"
        },
        SogouInput: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: "https://ruleset.skk.moe/Clash/non_ip/sogouinput.txt",
          path: "./ruleset/SogouInput.txt"
        },
        StaticResources: {
          type: "http",
          behavior: "domain",
          format: "text",
          interval: 86400,
          url: "https://ruleset.skk.moe/Clash/domainset/cdn.txt",
          path: "./ruleset/StaticResources.txt"
        },
        CDNResources: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: "https://ruleset.skk.moe/Clash/non_ip/cdn.txt",
          path: "./ruleset/CDNResources.txt"
        },
        TikTok: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/TikTok.list`,
          path: "./ruleset/TikTok.list"
        },
        EHentai: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/EHentai.list`,
          path: "./ruleset/EHentai.list"
        },
        SteamFix: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/SteamFix.list`,
          path: "./ruleset/SteamFix.list"
        },
        GoogleFCM: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/FirebaseCloudMessaging.list`,
          path: "./ruleset/FirebaseCloudMessaging.list"
        },
        AdditionalFilter: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/AdditionalFilter.list`,
          path: "./ruleset/AdditionalFilter.list"
        },
        AdditionalCDNResources: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/AdditionalCDNResources.list`,
          path: "./ruleset/AdditionalCDNResources.list"
        },
        Weibo: {
          type: "http",
          behavior: "classical",
          format: "text",
          interval: 86400,
          url: `${CDN_URL}/gh/powerfullz/override-rules@master/ruleset/Weibo.list`,
          path: "./ruleset/Weibo.list"
        },
        GFWList: {
          type: "http",
          behavior: "domain",
          format: "yaml",
          interval: 86400,
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
          path: "./ruleset/GFWList.yaml"
        }
      };
    }
  });

  // src/dns.ts
  function buildDnsConfig({ mode, ipv6Enabled, fakeIpFilter }) {
    const config = {
      enable: true,
      ipv6: ipv6Enabled,
      "prefer-h3": true,
      "enhanced-mode": mode,
      "default-nameserver": ["119.29.29.29", "223.5.5.5"],
      nameserver: ["system", "223.5.5.5", "119.29.29.29", "180.184.1.1"],
      fallback: [
        "quic://dns0.eu",
        "https://dns.cloudflare.com/dns-query",
        "https://dns.sb/dns-query",
        "tcp://208.67.222.222",
        "tcp://8.26.56.2"
      ],
      "proxy-server-nameserver": ["https://dns.alidns.com/dns-query", "tls://dot.pub"]
    };
    if (fakeIpFilter) {
      config["fake-ip-filter"] = fakeIpFilter;
    }
    return config;
  }
  function buildDns({ fakeIPEnabled, ipv6Enabled }) {
    if (fakeIPEnabled) {
      return buildDnsConfig({ mode: "fake-ip", ipv6Enabled, fakeIpFilter: FAKE_IP_FILTER });
    }
    return buildDnsConfig({ mode: "redir-host", ipv6Enabled });
  }
  var FAKE_IP_FILTER, snifferConfig;
  var init_dns = __esm({
    "src/dns.ts"() {
      "use strict";
      FAKE_IP_FILTER = [
        "geosite:private",
        "geosite:connectivity-check",
        "Mijia Cloud",
        "dig.io.mi.com",
        "localhost.ptlogin2.qq.com",
        "*.icloud.com",
        "*.stun.*.*",
        "*.stun.*.*.*"
      ];
      snifferConfig = {
        sniff: {
          TLS: {
            ports: [443, 8443]
          },
          HTTP: {
            ports: [80, 8080, 8880]
          },
          QUIC: {
            ports: [443, 8443]
          }
        },
        "override-destination": false,
        enable: true,
        "force-dns-mapping": true,
        "skip-domain": ["Mijia Cloud", "dlg.io.mi.com", "+.push.apple.com"]
      };
    }
  });

  // src/tun.ts
  function buildTunConfig(tunEnabled) {
    return {
      enable: tunEnabled,
      stack: "gvisor",
      device: "mihomo",
      "route-exclude-address": [
        "100.64.0.0/10",
        "fd7a:115c:a1e0::/48",
        "192.168.0.0/16",
        "fd00::/8"
      ],
      "dns-hijack": ["any:53"],
      mtu: 1500
    };
  }
  var init_tun = __esm({
    "src/tun.ts"() {
      "use strict";
    }
  });

  // src/selectors.ts
  function buildBaseLists({
    landing,
    lowCostNodes,
    countryNames,
    nonLandingNodes,
    regexFilter
  }) {
    const suffixedCountryNames = countryNames.map((c) => c + NODE_SUFFIX);
    const lowCost = lowCostNodes.length > 0 || regexFilter;
    const defaultSelector = buildList(
      PROXY_GROUPS.AUTO,
      PROXY_GROUPS.FALLBACK,
      landing && PROXY_GROUPS.LANDING,
      suffixedCountryNames,
      lowCost && PROXY_GROUPS.LOW_COST,
      PROXY_GROUPS.MANUAL,
      "DIRECT"
    );
    const defaultProxies = buildList(
      PROXY_GROUPS.SELECT,
      landing && PROXY_GROUPS.LANDING,
      suffixedCountryNames,
      lowCost && PROXY_GROUPS.LOW_COST,
      PROXY_GROUPS.MANUAL,
      "DIRECT"
    );
    const defaultProxiesDirect = buildList(
      "DIRECT",
      landing && PROXY_GROUPS.LANDING,
      suffixedCountryNames,
      lowCost && PROXY_GROUPS.LOW_COST,
      PROXY_GROUPS.SELECT,
      PROXY_GROUPS.MANUAL
    );
    const defaultFallback = buildList(landing && PROXY_GROUPS.LANDING, suffixedCountryNames);
    const frontProxySelector = buildList(
      suffixedCountryNames,
      "DIRECT",
      !regexFilter && nonLandingNodes.map((node) => node.name).filter(Boolean)
    );
    return {
      defaultProxies,
      defaultProxiesDirect,
      defaultSelector,
      defaultFallback,
      frontProxySelector
    };
  }
  var init_selectors = __esm({
    "src/selectors.ts"() {
      "use strict";
      init_constants();
      init_utils();
    }
  });

  // src/main.ts
  var require_main = __commonJS({
    "src/main.ts"() {
      init_constants();
      init_args();
      init_proxy_groups();
      init_node_parser();
      init_rules();
      init_rule_providers();
      init_dns();
      init_tun();
      init_selectors();
      var geoxURL = {
        geoip: `${CDN_URL}/gh/MetaCubeX/meta-rules-dat@release/geoip.dat`,
        geosite: `${CDN_URL}/gh/MetaCubeX/meta-rules-dat@release/geosite.dat`,
        mmdb: `${CDN_URL}/gh/MetaCubeX/meta-rules-dat@release/country.mmdb`,
        asn: `${CDN_URL}/gh/MetaCubeX/meta-rules-dat@release/GeoLite2-ASN.mmdb`
      };
      function getRawArgs() {
        try {
          return $arguments;
        } catch {
          return {};
        }
      }
      var rawArgs = getRawArgs();
      var {
        groupType,
        ipv6Enabled,
        fullConfig,
        keepAliveEnabled,
        fakeIPEnabled,
        quicEnabled,
        regexFilter,
        tunEnabled,
        countryThreshold
      } = buildFeatureFlags(rawArgs);
      function main(config) {
        if (!config.proxies || !Array.isArray(config.proxies)) {
          throw new Error("[powerfullz 的覆写脚本] 错误：Clash 配置中缺少有效的 proxies 字段");
        }
        const { landingNodes, nonLandingNodes } = parseNodesByLanding(config.proxies);
        const landing = landingNodes.length > 0 && nonLandingNodes.length > 0;
        const countryNodes = parseCountries(landing ? nonLandingNodes : config.proxies);
        const lowCostNodes = parseLowCost(landing ? nonLandingNodes : config.proxies);
        const countryNames = getActiveCountryNames(countryNodes, countryThreshold);
        const {
          defaultProxies,
          defaultProxiesDirect,
          defaultSelector,
          defaultFallback,
          frontProxySelector
        } = buildBaseLists({
          landing,
          lowCostNodes,
          countryNames,
          nonLandingNodes,
          regexFilter
        });
        const proxyGroups = buildProxyGroups({
          regexFilter,
          groupType,
          countryNames,
          countryNodes,
          lowCostNodes,
          landing,
          landingNodes,
          defaultProxies,
          defaultProxiesDirect,
          defaultSelector,
          defaultFallback,
          frontProxySelector
        });
        const globalProxies = proxyGroups.map((item) => String(item.name));
        proxyGroups.push({
          name: PROXY_GROUPS.GLOBAL,
          icon: `${CDN_URL}/gh/Koolson/Qure@master/IconSet/Color/Global.png`,
          "include-all": true,
          type: "select",
          proxies: globalProxies
        });
        const finalRules = buildRules({ quicEnabled });
        return {
          proxies: config.proxies,
          ...fullConfig && {
            "mixed-port": 7890,
            "redir-port": 7892,
            "tproxy-port": 7893,
            "routing-mark": 7894,
            "allow-lan": true,
            "bind-address": "*",
            ipv6: ipv6Enabled,
            mode: "rule",
            "unified-delay": true,
            "tcp-concurrent": true,
            "find-process-mode": "off",
            "log-level": "info",
            "geodata-loader": "standard",
            "external-controller": "127.0.0.1:9999",
            "disable-keep-alive": !keepAliveEnabled,
            profile: { "store-selected": true }
          },
          "proxy-groups": proxyGroups,
          "rule-providers": ruleProviders,
          rules: finalRules,
          sniffer: snifferConfig,
          dns: buildDns({ fakeIPEnabled, ipv6Enabled }),
          tun: buildTunConfig(tunEnabled),
          "geodata-mode": true,
          "geox-url": geoxURL
        };
      }
      globalThis.main = main;
    }
  });
  require_main();
})();
