/**
 * 整个脚本的总开关，在Mihomo Party使用的话，请保持为true
 * true = 启用
 * false = 禁用
 */
const enable = true

//proxies排除节点
const exclude_filter = "剩余|流量|套餐|到期|使用|文档|最新|网址|官网|更新|订阅|地址"

// 规则集通用配置
const ruleProviderCommon = {
  type: "http",
  interval: 28800,
  //proxy: "国内",
}

//添加节点
const addproxies = [
  {
    name: "直连",
    type: "direct",
    udp: true,
    "ip-version": "ipv4-prefer"
  },
  {
    name: "阻止",
    type: "reject"
  }
]

// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object"
      ? Object.keys(config["proxy-providers"]).length
      : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  config["allow-lan"] = true
  config["mode"] = "rule"
  config["log-level"] = "info"
  config["ipv6"] = true
  config["disable-keep-alive"] = true
  config["external-controller"] = "127.0.0.1:9090"
  config["unified-delay"] = true
  config["tcp-concurrent"] = true
  config["find-process-mode"] = "strict"
  config["etag-support"] = true
  config["profile"] = {
    //存储 select 选择记录
    "store-selected": true,
    "store-fake-ip": false,
  }
  config["dns"] = {
    enable: true,
    "cache-algorithm": "arc",
    listen: "0.0.0.0:1053",
    ipv6: true,
    "enhanced-mode": "redir-host",
    "default-nameserver": ["system"],
    "nameserver": ["system"],
    "nameserver-policy": {
      //PROXY
      "rule-set:0proxy,gfw,cn!": ["1.1.1.1#国外"],
      //Unlock
      "rule-set:0unlock,ai,spotify": ["1.1.1.1#解锁"],
    },
  }
  config["tun"] = {
    enable: true,
    stack: "system",
    "auto-route": true,
    "auto-detect-interface": true,
    "dns-hijack": ["any:53"],
    mtu: 1280
  }
  config["sniffer"] = {
    enable: true,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": false,
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
  config["ntp"] = {
    enable: true,
    server: "pool.ntp.org",
    interval: 480
  }

  const proxiesprovider = {
    原本: {
      type: "inline",
      payload: config.proxies
    }
  }

  // 合并 proxy-providers
  if (config["proxy-providers"]) {
    config["proxy-providers"] = {
      ...config["proxy-providers"],
      ...proxiesprovider
    }
  } else {
    config["proxy-providers"] = { ...proxiesprovider }
  }

  // 修改 proxy-providers
  Object.values(config["proxy-providers"]).forEach(provider => {
    if (provider.override) {
      provider.override.udp = true
      provider.override["ip-version"] = "ipv4-prefer"
    }
    provider["exclude-filter"] = exclude_filter
  })

  config["proxies"] = [...addproxies]

  //总开关关闭时不处理策略组
  if (!enable) {
    return config;
  }

  config["proxy-groups"] = [
    {
      name: "国外",
      type: "select",
      proxies: ["直连"],
      "include-all-providers": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Final.png",
    },
    {
      name: "解锁",
      type: "select",
      proxies: ["直连", "国外"],
      "include-all-providers": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Available_1.png",
    },
    {
      name: "下载",
      type: "select",
      proxies: ["直连", "国外"],
      "include-all-providers": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Download.png",
    },
    {
      name: "国内",
      type: "select",
      proxies: ["直连", "国外"],
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Proxy.png",
    },
    {
      name: "不明",
      type: "select",
      proxies: ["直连", "国外"],
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Stack.png",
    },
    {
      name: "广告",
      type: "select",
      proxies: ["阻止", "直连", "国外"],
      icon: "https://github.com/NB921/picture/raw/main/AD3.png",
    },
  ]

  // 覆盖原配置中的规则
  config["rule-providers"] = {
    "0direct": {
      ...ruleProviderCommon,
      url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/direct.list",
      behavior: "classical",
      format: "text",
    },

    "0download": {
      ...ruleProviderCommon,
      url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/download.list",
      behavior: "classical",
      format: "text",
    },

    "0proxy": {
      ...ruleProviderCommon,
      url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/proxy.list",
      behavior: "classical",
      format: "text",
    },

    "0unlock": {
      ...ruleProviderCommon,
      url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/unlock.list",
      behavior: "classical",
      format: "text",
    },

    AD: {
      ...ruleProviderCommon,
      url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/category-ads%40ads.list",
      behavior: "domain",
      format: "text",
    },

    "game-platforms-download": {
      ...ruleProviderCommon,
      url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/category-game-platforms-download.list",
      behavior: "domain",
      format: "text",
    },

    ai: {
      ...ruleProviderCommon,
      url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/category-ai-!cn.list",
      behavior: "domain",
      format: "text",
    },

    spotify: {
      ...ruleProviderCommon,
      url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/spotify.list",
      behavior: "domain",
      format: "text",
    },

    cn: {
      ...ruleProviderCommon,
      url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/geolocation-cn.list",
      behavior: "domain",
      format: "text",
    },

    cnip: {
      ...ruleProviderCommon,
      url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geoip/cn.list",
      behavior: "ipcidr",
      format: "text",
    },

    gfw: {
      ...ruleProviderCommon,
      url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/gfw.list",
      behavior: "domain",
      format: "text",
    },

    "cn!": {
      ...ruleProviderCommon,
      url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/geolocation-!cn.list",
      behavior: "domain",
      format: "text",
    },
  }
  config["rules"] = [
    "RULE-SET,0download,下载",
    "RULE-SET,0unlock,解锁",
    "RULE-SET,0proxy,国外",
    "RULE-SET,0direct,国内",

    "RULE-SET,AD,广告",
    
    "RULE-SET,game-platforms-download,下载",
    
    "RULE-SET,ai,解锁",
    "RULE-SET,spotify,解锁",

    "RULE-SET,gfw,国外",
    "RULE-SET,cn,国内",
    "RULE-SET,cn!,国外",
    "RULE-SET,cnip,国内",

    "MATCH,不明"
  ]

  // 返回修改后的配置
  return config
}
