/**
 * 整个脚本的总开关，在Mihomo Party使用的话，请保持为true
 * true = 启用
 * false = 禁用
 */
const enable = true

//proxies排除节点
const blockKeywords = ["剩余","流量","套餐","到期","使用","文档","最新","网址","官网","更新","订阅","地址"]

// 规则集通用配置
const ruleProviderCommon = {
  type: "http",
  interval: 28800,
  //proxy: "DIRECT",
}

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
  config["etag-support"]= true
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
    "default-nameserver": ["223.5.5.5","119.29.29.29"],
    "nameserver": ["https://dns.alidns.com/dns-query","https://doh.pub/dns-query"],
    "nameserver-policy": {
      //PROXY
      "rule-set:0proxy,gfw,cn!,tld-!cn": ["https://dns.cloudflare.com/dns-query#PROXY","https://dns.google/dns-query#PROXY"],
      //Unlock
      "rule-set:0unlock,ai,spotify": ["https://dns.cloudflare.com/dns-query#Unlock","https://dns.google/dns-query#Unlock"],
    },
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

  config["proxies"] = config.proxies.filter(proxy => {
    return !blockKeywords.some(keyword => proxy.name.includes(keyword));
  })

  config["proxies"] = config.proxies.map(proxy => {
    return {
      ...proxy,
      udp: true,
    }
  })

  //总开关关闭时不处理策略组
  if (!enable) {
    return config;
  }

  config["proxy-groups"] = [
    {
      name: "PROXY",
      type: "select",
      proxies: ["DIRECT"],
      "include-all": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Final.png",
    },
    {
      name: "Unlock",
      type: "select",
      proxies: ["DIRECT","PROXY"],
      "include-all": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Available_1.png",
    },
    {
      name: "Download",
      type: "select",
      proxies: ["DIRECT","PROXY"],
      "include-all": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Download.png",
    },
    {
      name: "CN",
      type: "select",
      proxies: ["DIRECT","PROXY"],
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Proxy.png",
    },
    {
      name: "Unclear",
      type: "select",
      proxies: ["DIRECT","PROXY"],
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Stack.png",
    },
    {
      name: "AD",
      type: "select",
      proxies: ["REJECT","DIRECT","PROXY"],
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
    url: "https://github.com/blackmatrix7/ios_rule_script/raw/master/rule/Clash/AdGuardSDNSFilter/AdGuardSDNSFilter_Classical_No_Resolve.yaml",
    behavior: "classical",
    format: "yaml",
    },

    download: {
    ...ruleProviderCommon,
    url: "https://github.com/blackmatrix7/ios_rule_script/raw/master/rule/Clash/Download/Download_No_Resolve.yaml",
    behavior: "classical",
    format: "yaml",
    },

    "game-platforms-download1": {
    ...ruleProviderCommon,
    url: "https://github.com/blackmatrix7/ios_rule_script/raw/master/rule/Clash/Game/GameDownload/GameDownload_No_Resolve.yaml",
    behavior: "classical",
    format: "yaml",
    },

    "game-platforms-download2": {
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
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/cn.list",
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

    "tld-!cn": {
    ...ruleProviderCommon,
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/tld-!cn.list",
    behavior: "domain",
    format: "text",
    },
  }
  config["rules"] = [
    //"AND,((NOT,((RULE-SET,AD!))),(RULE-SET,AD)),AD",
    "RULE-SET,AD,AD",

    "RULE-SET,0download,Download",
    "RULE-SET,download,Download",
    "RULE-SET,game-platforms-download1,Download",
    "RULE-SET,game-platforms-download2,Download",

    "RULE-SET,0unlock,Unlock",
    "RULE-SET,ai,Unlock",
    "RULE-SET,spotify,Unlock",

    "RULE-SET,0proxy,PROXY",
    "RULE-SET,0direct,CN",

    "RULE-SET,gfw,PROXY",
    "RULE-SET,cn,CN",
    "RULE-SET,cn!,PROXY",
    "RULE-SET,tld-!cn,PROXY",
    "RULE-SET,cnip,CN",

    "MATCH,Unclear"
  ]

  // 返回修改后的配置
  return config
}
