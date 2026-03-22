
// 整个脚本的总开关，在Mihomo Party使用的话，请保持为true
const ENABLE = true;

// 代理排除关键词
const EXCLUDE_FILTER = "剩余|流量|套餐|到期|使用|文档|最新|网址|官网|更新|订阅|地址|客服|群|TG|地址|公告|版本|维护";

// ==================== 是否启用地区分组 ====================
const ENABLE_REGION_GROUP = true;

// 地区组健康检查通用配置
const REGION_HEALTH_CHECK = {
  type: "select",
  // select：手动选择
  // url-test：自动选择
  //fallback：自动回退
  //load-balance：负载均衡
};

// 地区配置
const REGION_CONFIG = {
  "香港": {
    regex: /\b(🇭🇰|hk|hong\s?kong)\b|香港/i,
    icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/Hongkong(3).png"
  },
  "新加坡": {
    regex: /\b(🇸🇬|sg|singapore)\b|新加坡/i,
    icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/singapore.png"
  },
  // "台湾": {
  //   regex: /\b(🇹🇼|tw|taiwan|taipei)\b|台灣|台湾|台北/i,
  //   icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/taiwan(4).png"
  // },
  // "日本": {
  //   regex: /\b(🇯🇵|jp|jpn|japan|osaka)\b|日本|东京|大阪/i,
  //   icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/Japan(2).png"
  // },
  // "韩国": {
  //   regex: /\b(🇰🇷|kr|kor|korea|seoul)\b|韩国|首尔/i,
  //   icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/Korea(2).png"
  // },
  // "美国": {
  //   regex: /\b(🇺🇸|US|usa|america|united\s?states|los\s?angeles|san\s?francisco|seattle|chicago|washington)\b|美國|美国|洛杉矶|旧金山|西雅图|芝加哥|华盛顿/i,
  //   icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/US(2).png"
  // },
  "其他": {
    regex: /.*/i,
    icon: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/icon/qure/color/Available.png"
  },
  // "所有": {
  //   icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/05icon/quanqiu(3).png"
  // }
};

// 规则集通用配置
const RULE_PROVIDER_COMMON = {
  type: "http",
  interval: 28800,
};

// 代理组健康检查通用配置
const PROXY_HEALTH_CHECK = {
  url: "https://www.gstatic.com/generate_204",
  interval: 0,
  lazy: true,
  timeout: 5000,
  tolerance: 50,
  "max-failed-times": 5,
  "expected-status": '200-299',
  strategy: "consistent-hashing"
  // consistent-hashing：将相同的 目标地址 的请求分配给策略组内的同一个代理节点
  // round-robin：将会把所有的请求分配给策略组内不同的代理节点
  // sticky-sessions：将相同的 来源地址 和 目标地址 的请求分配给策略组内的同一个代理节点
};

// 添加的固定节点
const ADDITIONAL_PROXIES = [
  {
    name: "直连",
    type: "direct",
    udp: true
  },
  {
    name: "阻止",
    type: "reject"
  }
];

// 规则提供者URL配置
const RULE_PROVIDER_URLS = {
  direct: { url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/direct.list", behavior: "classical", format: "text" },
  download: { url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/download.list", behavior: "classical", format: "text" },
  proxy: { url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/proxy.list", behavior: "classical", format: "text" },
  unlock: { url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/unlock.list", behavior: "classical", format: "text" },
  AD: { url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/AdGuardSDNSFilter/AdGuardSDNSFilter_Classical.yaml", behavior: "classical", format: "yaml" },
  "cn!": { url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/gfw.mrs", behavior: "domain", format: "mrs" }
};

// 过滤有效代理
function filterAndModifyProxies(proxies, excludeRegex) {
  return proxies
    .filter(proxy => proxy.name && !excludeRegex.test(proxy.name) && Object.values(proxy).every(v => v != null && v !== ''))
    .map(proxy => ({ ...proxy, udp: true }));
}


// 设置基本配置
function setBasicConfig(config) {
  const defaults = {
    "allow-lan": true,
    "mode": "rule",
    "log-level": "info",
    "ipv6": true,
    "tcp-concurrent": true,
    "unified-delay": true,
    "external-controller": "127.0.0.1:9090",
    "secret": "mihomo-party-clash",
    "profile": {
      "store-selected": true,
      "store-fake-ip": false,
    },
    "dns": {
      enable: true,
      "cache-algorithm": "arc",
      ipv6: true,
      "enhanced-mode": "redir-host"
    },
    "tun": {
      enable: false,
      stack: "system",
      "dns-hijack": ["any:53", "tcp://any:53"],
      "auto-route": true,
      "auto-detect-interface": true,
    },
    "sniffer": {
      enable: false,
      "force-dns-mapping": true,
      "parse-pure-ip": true,
      "override-destination": true,
      sniff: {
        HTTP: { ports: [80, '8080-8880'] },
        TLS: { ports: [443, 8443] },
        QUIC: { ports: [443, 8443] },
      },
    }
  };
  Object.assign(config, defaults);
}

// 创建代理组
function createProxyGroup(name, type = "select", icon = "", proxies = []) {
  return {
    name,
    type,
    ...PROXY_HEALTH_CHECK,
    ...(proxies.length > 0 && { proxies }),
    ...(icon && { icon })
  };
}

// 创建地区分组
function createRegionGroups(filteredProxies) {
  const regionBuckets = Object.fromEntries(Object.keys(REGION_CONFIG).map(key => [key, []]));
  const allProxyNames = filteredProxies.map(p => p.name);

  filteredProxies.forEach(proxy => {
    let matched = false;
    // 遍历配置，但不处理“所有”和“其他”，它们有特殊逻辑
    for (const [region, cfg] of Object.entries(REGION_CONFIG)) {
      if (region !== "其他" && region !== "所有" && cfg.regex.test(proxy.name)) {
        regionBuckets[region].push(proxy.name);
        matched = true;
        break;
      }
    }
    // 如果没匹配到任何具体地区，丢进“其他”
    if (!matched) {
      regionBuckets["其他"].push(proxy.name);
    }
  });

  // 关键：强制给“所有”组赋值全部节点
  if (regionBuckets.hasOwnProperty("所有")) {
    regionBuckets["所有"] = allProxyNames;
  }

  return Object.entries(regionBuckets)
    .filter(([_, proxies]) => proxies.length > 0)
    .map(([region, proxies]) => {
      // 默认使用全局配置
      let finalType = REGION_HEALTH_CHECK.type;

      // 关键修改：如果是“其他”或“所有”组，强制覆盖 type 为 select
      if (region === "其他" || region === "所有") {
        finalType = "select";
      }

      return {
        ...REGION_HEALTH_CHECK,
        ...PROXY_HEALTH_CHECK,
        name: region,
        proxies,
        icon: REGION_CONFIG[region].icon,
        type: finalType
      };
    });
}

// 注入地区组到主组
function injectRegionsToGroups(proxyGroups, activeRegions, targetGroups) {
  proxyGroups.forEach(group => {
    if (!targetGroups.includes(group.name)) return;
    group.proxies = [
      ...(group.proxies || []).filter(p => !activeRegions.includes(p)),
      ...activeRegions
    ];
  });
}

// 设置规则提供者
function setRuleProviders(config) {
  config["rule-providers"] = Object.fromEntries(
    Object.entries(RULE_PROVIDER_URLS).map(([key, cfg]) => [
      key, { ...RULE_PROVIDER_COMMON, ...cfg }
    ])
  );
}

// 规则列表 - 提取为常量
const RULES_LIST = [
  "RULE-SET,download,下载",
  "RULE-SET,unlock,解锁",
  "RULE-SET,direct,国内",
  "RULE-SET,proxy,国外",
  "RULE-SET,AD,广告",
  "RULE-SET,cn!,国外",
  "MATCH,国内"
];

// 设置规则
function setRules(config) {
  config["rules"] = RULES_LIST;
}

// 程序入口
function main(config) {
  if (!config.proxies) return config;

  const excludeRegex = new RegExp(`(?:${EXCLUDE_FILTER})`, "i");

  // 过滤有效代理
  const filteredProxies = filterAndModifyProxies(config.proxies, excludeRegex);

  // 添加固定节点
  config.proxies = [...ADDITIONAL_PROXIES, ...filteredProxies];

  // 设置基本配置
  setBasicConfig(config);

  // 如果总开关关闭，不处理策略组
  if (!ENABLE) return config;

  // 创建主代理组
  const mainGroups = [
    createProxyGroup("国外", "select", "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Final.png"),
    { ...createProxyGroup("解锁", "select", "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Available_1.png"), proxies: ["国外"] },
    { ...createProxyGroup("下载", "select", "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Download.png"), proxies: ["直连", "国外"] },
    { ...createProxyGroup("国内", "select", "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Proxy.png"), proxies: ["直连", "国外"] },
    { ...createProxyGroup("广告", "select", "https://github.com/NB921/picture/raw/main/AD3.png"), proxies: ["阻止", "直连", "国外"] },
  ];

  // ── 根据开关决定如何填充节点 ───────────────────────────────
  let regionGroups = [];
  let activeRegions = [];
  const targetGroups = ["国外", "解锁", "下载"];

  if (ENABLE_REGION_GROUP) {
    // 创建地区分组
    regionGroups = createRegionGroups(filteredProxies);
    activeRegions = regionGroups.map(g => g.name);

    // 把地区组加到 proxy-groups 列表
    mainGroups.push(...regionGroups);

    // 注入地区组名称 到 指定的主组
    injectRegionsToGroups(mainGroups, activeRegions, targetGroups);
  } else {
    // 不使用地区组 → 将所有过滤后的节点追加到原有节点之后
    const allProxyNames = filteredProxies.map(p => p.name);

    mainGroups.forEach(group => {
      if (targetGroups.includes(group.name)) {
        // 使用 Set 是为了防止重复添加（例如 group.proxies 里本来就有某个节点）
        // 如果确定没有重复，直接 group.proxies = [...group.proxies, ...allProxyNames] 也可以
        group.proxies = [...new Set([...(group.proxies || []), ...allProxyNames])];
      }
    });
  }

  // 最终合并所有 proxy-groups
  config["proxy-groups"] = mainGroups;

  // 设置规则提供者 & 规则
  setRuleProviders(config);
  setRules(config);

  return config;
}
