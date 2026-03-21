/**
 * 整个脚本的总开关，在Mihomo Party使用的话，请保持为true
 * true = 启用
 * false = 禁用
 */
const enable = true

//proxies排除节点
const exclude_filter = "剩余|流量|套餐|到期|使用|文档|最新|网址|官网|更新|订阅|地址|客服|群|TG|地址|公告|版本|维护"

// ====== 地区分组======
const regionMap = {
  "🇭🇰香港": /\b(🇭🇰|hk|hong\s?kong)\b|香港/i,
  "🇸🇬新加坡": /\b(🇸🇬|sg|singapore)\b|新加坡/i,
  // "🇹🇼台湾": /\b(🇹🇼|tw|taiwan|taipei)\b|台灣|台湾|台北/i,
  // "🇯🇵日本": /\b(🇯🇵|jp|jpn|japan|osaka)\b|日本|东京|大阪/i,
  // "🇰🇷韩国": /\b(🇰🇷|kr|kor|korea|seoul)\b|韩国|首尔/i,
  // "🇺🇸美国": /\b(🇺🇸|US|usa|america|united\s?states|los\s?angeles|san\s?francisco|seattle|chicago|washington)\b|美國|美国|洛杉矶|旧金山|西雅图|芝加哥|华盛顿/i
}

// // 图标
// const regionIcons = {
//   "🇭🇰香港": "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Hong_Kong.png",
//   "🇸🇬新加坡": "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Singapore.png",
//   "🇹🇼台湾": "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Taiwan.png",
//   "🇯🇵日本": "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Japan.png",
//   "🇺🇸美国": "https://github.com/Koolson/Qure/raw/master/IconSet/Color/United_States.png",
//   "🌏其他": "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Global.png"
// }

// 规则集通用配置
const ruleProviderCommon = {
  type: "http",
  interval: 28800,
  //proxy: "国内",
}

// 健康检测通用配置
const proxyhealthcheck = {
  url: "https://www.gstatic.com/generate_204",
  interval: 0,
  lazy: true,
  timeout: 5000,
  "max-failed-times": 5,
  "expected-status": '200-299'
}

//添加节点
const addproxies = [
  {
    name: "直连",
    type: "direct",
    udp: true
  },
  {
    name: "阻止",
    type: "reject"
  }
]

// 程序入口
function main(config) {
  if (!config.proxies) return config;
  const excludeRegex = new RegExp(`(?:${exclude_filter})`, "i");

  // 仅保留有效且不命中排除关键词的订阅节点
  const filteredSubProxies = config.proxies.filter(p =>
    p.name &&
    !excludeRegex.test(p.name) &&
    Object.values(p).every(v => v !== null && v !== undefined && v !== '')
  );

  // proxy属性修改
  filteredSubProxies.forEach(proxy => {
    proxy.udp = true;
  });

  config.proxies = [...addproxies, ...filteredSubProxies]

  config["allow-lan"] = true
  config["mode"] = "rule"
  config["log-level"] = "info"
  config["ipv6"] = true
  config["tcp-concurrent"] = true
  config["unified-delay"] = true
  config["external-controller"] = "127.0.0.1:9090"
  config["secret"] = "mihomo-party-clash"
  config["profile"] = {
    //存储 select 选择记录
    "store-selected": true,
    "store-fake-ip": false,
  }
  config["dns"] = {
    enable: true,
    "cache-algorithm": "arc",
    ipv6: true,
    "enhanced-mode": "redir-host"
  }

  config["tun"] = {
    enable: false,
    stack: "system",
    "dns-hijack": [
      "any:53",
      "tcp://any:53"
    ],
    "auto-route": true,
    "auto-detect-interface": true,
  }

  config["sniffer"] = {
    enable: false,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": true,
    sniff: {
      HTTP: {
        ports: [80, '8080-8880'],
      },
      TLS: {
        ports: [443, 8443],
      },
      QUIC: {
        ports: [443, 8443],
      },
    },
  }

  //总开关关闭时不处理策略组
  if (!enable) {
    return config;
  }

  config["proxy-groups"] = [
    {
      name: "国外",
      type: "select",
      // "include-all-providers": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Final.png",
      ...proxyhealthcheck
    },
    {
      name: "解锁",
      type: "select",
      proxies: ["国外"],
      // "include-all-providers": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Available_1.png",
      ...proxyhealthcheck
    },
    {
      name: "下载",
      type: "select",
      proxies: ["直连", "国外"],
      // "include-all-providers": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Download.png",
      ...proxyhealthcheck
    },
    {
      name: "国内",
      type: "select",
      proxies: ["直连", "国外"],
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Proxy.png",
      ...proxyhealthcheck
    },
    {
      name: "广告",
      type: "select",
      proxies: ["阻止", "直连", "国外"],
      icon: "https://github.com/NB921/picture/raw/main/AD3.png",
      ...proxyhealthcheck
    },
  ]

  // 注入地区组的主组
  const targetGroups = ["国外", "解锁", "下载"];

  // 创建地区桶
  const regionBuckets = {
    ...Object.fromEntries(
      Object.keys(regionMap).map(k => [k, []])
    ),
    "🌏其他": []
  };
  // 分类节点
  for (const proxy of filteredSubProxies) {
    const name = proxy.name;
    let matched = false;

    for (const [region, regex] of Object.entries(regionMap)) {
      if (regex.test(name)) {
        regionBuckets[region].push(name);
        matched = true;
        break;
      }
    }
    if (!matched) {
      regionBuckets["🌏其他"].push(name);
    }
  }

  // 创建地区策略组
  const activeRegions = [];
  for (const region of [...Object.keys(regionMap), "🌏其他"]) {
    if (regionBuckets[region]?.length > 0) {
      activeRegions.push(region);
    }
  }

  for (const region of activeRegions) {
    const proxies = regionBuckets[region];

    config["proxy-groups"].push({
      name: region,
      type: "select",
      proxies,
      ...proxyhealthcheck,
      // icon: regionIcons[region] || regionIcons["🌏其他"]
    });
  }

  // 把地区组注入到主组中
  for (const group of config["proxy-groups"]) {
    if (!targetGroups.includes(group.name)) continue;

    group.proxies = group.proxies || [];

    // 注入 activeRegions
    // 避免重复
    const newProxies = [
      ...group.proxies.filter(n => !activeRegions.includes(n)),
      ...activeRegions
    ];

    group.proxies = newProxies;
  }
  // 覆盖原配置中的规则
  config["rule-providers"] = {
    "direct": {
      ...ruleProviderCommon,
      url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/direct.list",
      behavior: "classical",
      format: "text",
    },

    "download": {
      ...ruleProviderCommon,
      url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/download.list",
      behavior: "classical",
      format: "text",
    },

    "proxy": {
      ...ruleProviderCommon,
      url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/proxy.list",
      behavior: "classical",
      format: "text",
    },

    "unlock": {
      ...ruleProviderCommon,
      url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/unlock.list",
      behavior: "classical",
      format: "text",
    },

    AD: {
      ...ruleProviderCommon,
      url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/AdGuardSDNSFilter/AdGuardSDNSFilter_Classical.yaml",
      behavior: "classical",
      format: "yaml",
    },

    "cn!": {
      ...ruleProviderCommon,
      url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/gfw.mrs",
      behavior: "domain",
      format: "mrs",
    },
  }
  config["rules"] = [
    "RULE-SET,download,下载",
    "RULE-SET,unlock,解锁",
    "RULE-SET,direct,国内",
    "RULE-SET,proxy,国外",

    "RULE-SET,AD,广告",
    "RULE-SET,cn!,国外",

    "MATCH,国内"
  ]

  // 返回修改后的配置
  return config
}
