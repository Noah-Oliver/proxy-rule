// ==================== 配置中心 ====================
const SETTINGS = {
  ENABLE: true,
  ENABLE_REGION_GROUP: true,
  // 新增：地区排序与启用配置。0开头表示禁用该地区组（但节点会被归入"其他"）
  // 数组顺序即为 UI 上的排序顺序
  REGION_ORDER: ["香港", "新加坡", "0台湾", "0日本", "0韩国", "0美国", "其他", "0所有"],
  EXCLUDE_FILTER: /剩余|流量|套餐|到期|使用|文档|最新|网址|官网|更新|订阅|地址|客服|群|TG|公告|版本|维护/i,
  //可选select, url-test, fallback, load-balance
  REGION_CHECK_TYPE: "select",
  PROXY_GROUP_INTERVAL: 0  //单位S
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
  "台湾": {
    regex: /\b(🇹🇼|tw|taiwan|taipei)\b|台灣|台湾|台北/i,
    icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/taiwan(4).png"
  },
  "日本": {
    regex: /\b(🇯🇵|jp|jpn|japan|osaka)\b|日本|东京|大阪/i,
    icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/Japan(2).png"
  },
  "韩国": {
    regex: /\b(🇰🇷|kr|kor|korea|seoul)\b|韩国|首尔/i,
    icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/Korea(2).png"
  },
  "美国": {
    regex: /\b(🇺🇸|US|usa|america|united\s?states|los\s?angeles|san\s?francisco|seattle|chicago|washington)\b|美國|美国|洛杉矶|旧金山|西雅图|芝加哥|华盛顿/i,
    icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/01Country/US(2).png"
  },
  "其他": {
    regex: /.*/i,
    icon: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/icon/qure/color/Available.png"
  },
  "所有": {
    icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/05icon/quanqiu(3).png"
  }
};

// 代理组健康检查通用配置
const HEALTH_CHECK_CONFIG = {
  url: "https://www.gstatic.com/generate_204",
  lazy: true,
  timeout: 5000,
  tolerance: 50,
  "max-failed-times": 3,
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

// ==================== 核心逻辑 ====================
function main(config) {
  if (!config?.proxies || !SETTINGS.ENABLE) return config;

  const filteredProxies = config.proxies
    .filter(p => p.name && !SETTINGS.EXCLUDE_FILTER.test(p.name) && Object.values(p).every(v => v != null && v !== ''))
    .map(p => ({ ...p, udp: true }));

  const allProxyNames = filteredProxies.map(p => p.name);

  // 添加固定节点
  config.proxies = [...ADDITIONAL_PROXIES, ...filteredProxies];

  // 设置基本配置
  setBasicConfig(config);

  // 3. 构建核心策略组
  const mainGroups = [
    { name: "国外", type: "select", icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Final.png", proxies: [] },
    { name: "解锁", type: "select", icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Available_1.png", proxies: ["国外"] },
    { name: "下载", type: "select", icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Download.png", proxies: ["直连", "国外"] },
    { name: "国内", type: "select", icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Proxy.png", proxies: ["直连", "国外"] },
    { name: "广告", type: "select", icon: "https://nb921.github.io/cdn/IconSet/Color/Advertising.png", proxies: ["阻止", "直连", "国外"] }
  ];

  const targetGroups = ["国外", "解锁", "下载"];

  // 4. 处理地区分组
  let finalGroups = [...mainGroups];
  if (SETTINGS.ENABLE_REGION_GROUP) {
    const regionGroups = buildRegionGroups(filteredProxies, allProxyNames);
    const regionNames = regionGroups.map(g => g.name);

    finalGroups = [...mainGroups, ...regionGroups];

    // 将地区组注入到核心组
    finalGroups.forEach(group => {
      if (targetGroups.includes(group.name)) {
        group.proxies = Array.from(new Set([...group.proxies, ...regionNames]));
      }
    });
  } else {
    finalGroups.forEach(group => {
      if (targetGroups.includes(group.name)) {
        group.proxies = Array.from(new Set([...group.proxies, ...allProxyNames]));
      }
    });
  }

  // 5. 注入健康检查与合并策略组
  config["proxy-groups"] = finalGroups.map(group => ({
    ...group,
    type: group.type || "select",
    interval: SETTINGS.PROXY_GROUP_INTERVAL,
    ...HEALTH_CHECK_CONFIG
  }));

  // 规则提供者配置
  const RULE_PROVIDER_COMMON = { type: "http", interval: 28800, behavior: "classical" };
  const RULE_PROVIDER_URLS = {
    direct: { url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/direct.list", format: "text" },
    download: { url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/download.list", format: "text" },
    proxy: { url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/proxy.list", format: "text" },
    unlock: { url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/unlock.list", format: "text" },
    AD: { url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/AdGuardSDNSFilter/AdGuardSDNSFilter_Classical.yaml", format: "yaml" },
    "cn!": { url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/gfw.mrs", behavior: "domain", format: "mrs" }
  };

  // 设置规则提供者 & 规则
  config["rule-providers"] = {};
  for (const [key, cfg] of Object.entries(RULE_PROVIDER_URLS)) {
    config["rule-providers"][key] = { ...RULE_PROVIDER_COMMON, ...cfg };
  }

  config["rules"] = [
    "RULE-SET,download,下载",
    "RULE-SET,unlock,解锁",
    "RULE-SET,direct,国内",
    "RULE-SET,proxy,国外",
    "RULE-SET,AD,广告",
    "RULE-SET,cn!,国外",
    "MATCH,国内"
  ];

  return config;
}

// 创建地区分组
// 修改后的创建地区分组函数
function buildRegionGroups(proxies, allNames) {
  // 1. 预处理 REGION_ORDER，提取出真正“启用”的组及其原始名称
  // activeRegionMap 存储 { 原始名称: 是否启用 }
  const activeRegionMap = {};
  const orderList = []; // 存储最终显示的顺序（不含前缀0的名称）

  SETTINGS.REGION_ORDER.forEach(item => {
    const isEnabled = !item.startsWith("0");
    const realName = isEnabled ? item : item.substring(1);
    activeRegionMap[realName] = isEnabled;
    if (isEnabled) {
      orderList.push(realName);
    }
  });

  // 2. 初始化桶，仅为配置中存在的地区创建桶
  const buckets = Object.fromEntries(Object.keys(REGION_CONFIG).map(k => [k, []]));

  // 3. 将节点分配到桶中
  proxies.forEach(p => {
    let matched = false;
    // 遍历 REGION_CONFIG 进行正则匹配
    for (const [name, cfg] of Object.entries(REGION_CONFIG)) {
      // 排除特殊保留组，且该组在配置中必须是“启用”状态才进行匹配
      if (name !== "其他" && name !== "所有" && activeRegionMap[name] === true) {
        if (cfg.regex?.test(p.name)) {
          buckets[name].push(p.name);
          matched = true;
          break;
        }
      }
    }
    // 如果没有匹配到任何“启用”的地区组，则归入“其他”
    if (!matched) {
      buckets["其他"].push(p.name);
    }
  });

  // 4. 特殊处理“所有”组
  if (buckets["所有"]) {
    buckets["所有"] = allNames;
  }

  // 5. 根据 REGION_ORDER 的顺序构建最终的分组对象
  const result = [];
  
  // 按照 orderList (即 REGION_ORDER 中未加0的顺序) 迭代
  orderList.forEach(name => {
    const list = buckets[name];
    const cfg = REGION_CONFIG[name];

    // 只有当组内有节点且 REGION_CONFIG 中有对应配置时才创建
    if (list && list.length > 0 && cfg) {
      result.push({
        name: name,
        proxies: list,
        icon: cfg.icon,
        // 如果是“其他”或“所有”，强制使用 select，否则使用配置的 check_type
        type: (name === "其他" || name === "所有") ? "select" : SETTINGS.REGION_CHECK_TYPE
      });
    }
  });

  return result;
}
