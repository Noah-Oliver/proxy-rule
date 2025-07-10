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
  config["geodata-mode"] = true
  config["geodata-loader"] = "memconservative"
  config["geo-auto-update"] = true
  config["geo-update-interval"] = 24
  config["geox-url"] = {
    geoip: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat",
    geosite: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    mmdb: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country.mmdb",
    asn: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb",
  }
  config["external-controller"] = "127.0.0.1:9090"
  config["unified-delay"] = true
  config["tcp-concurrent"] = false
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
    ipv6: true,
    "enhanced-mode": "redir-host",
    "default-nameserver": ["system","223.5.5.5","119.29.29.29"],
    "nameserver": ["system","223.5.5.5","119.29.29.29"],
    "nameserver-policy": {
      "rule-set:unlock,proxy": ["1.1.1.1#PROXY","8.8.8.8#PROXY"],
      "geosite:category-ai-!cn,spotify": ["1.1.1.1#PROXY","8.8.8.8#PROXY"],
      "geosite:gfw,category-android-app-download,category-porn,geolocation-!cn,tld-!cn": ["1.1.1.1#PROXY","8.8.8.8#PROXY"],
    },
  }
  config["tun"] = {
    enable: true,
    stack: "system",
    "auto-route": true,
    "auto-detect-interface": true,
    "dns-hijack": [],
    mtu: 9000
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
      udp: true
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
      proxies: ["DIRECT",],
      "include-all": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Final.png",
    },
    {
      name: "Unlock",
      type: "select",
      proxies: ["DIRECT","PROXY",],
      "include-all": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Available_1.png",
    },
    {
      name: "Download",
      type: "select",
      proxies: ["DIRECT","PROXY",],
      "include-all": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Download.png",
    },
    {
      name: "CN",
      type: "select",
      proxies: ["DIRECT","PROXY",],
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Proxy.png",
    },
    {
      name: "No match",
      type: "select",
      proxies: ["DIRECT","PROXY",],
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Stack.png",
    },
    {
      name: "AD",
      type: "select",
      proxies: ["REJECT","DIRECT","PROXY",],
      icon: "https://github.com/NB921/picture/raw/main/AD3.png",
    },
  ]

  // 覆盖原配置中的规则
  config["rule-providers"] = {
    AD: {
    ...ruleProviderCommon,
    url: "https://github.com/blackmatrix7/ios_rule_script/raw/master/rule/Clash/AdGuardSDNSFilter/AdGuardSDNSFilter_Classical_No_Resolve.yaml",
    behavior: "classical",
    format: "yaml",
    },
    "AD!": {
    ...ruleProviderCommon,
    url: "https://github.com/blackmatrix7/ios_rule_script/raw/master/rule/Clash/AdGuardSDNSFilter/Direct/Direct_No_Resolve.yaml",
    behavior: "classical",
    format: "yaml",
    },
    download1: {
    ...ruleProviderCommon,
    url: "https://github.com/blackmatrix7/ios_rule_script/raw/master/rule/Clash/Download/Download_No_Resolve.yaml",
    behavior: "classical",
    format: "yaml",
    },
    "game-platforms-download": {
    ...ruleProviderCommon,
    url: "https://github.com/blackmatrix7/ios_rule_script/raw/master/rule/Clash/Game/GameDownload/GameDownload_No_Resolve.yaml",
    behavior: "classical",
    format: "yaml",
    },
    download: {
    ...ruleProviderCommon,
    url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/download.list",
    behavior: "classical",
    format: "text",
    },
    unlock: {
    ...ruleProviderCommon,
    url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/unlock.list",
    behavior: "classical",
    format: "text",
    },
    proxy: {
    ...ruleProviderCommon,
    url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/proxy.list",
    behavior: "classical",
    format: "text",
    },
    direct: {
    ...ruleProviderCommon,
    url: "https://github.com/Noah-Oliver/proxy-rule/raw/main/clash%20rule/direct.list",
    behavior: "classical",
    format: "text",
    },
  }
  config["rules"] = [
    "AND,((NOT,((RULE-SET,AD!))),(RULE-SET,AD)),AD",

    "RULE-SET,download,Download",
    "RULE-SET,download1,Download",
    "RULE-SET,game-platforms-download,Download",
    "GEOSITE,category-game-platforms-download,Download",


    "RULE-SET,unlock,Unlock",
    "GEOSITE,category-ai-!cn,Unlock",
    "GEOSITE,spotify,Unlock",

    "RULE-SET,proxy,PROXY",
    "RULE-SET,direct,CN",

    "GEOSITE,gfw,PROXY",
    "GEOSITE,category-android-app-download,PROXY",
    "GEOSITE,category-porn,PROXY",
    "GEOSITE,cn,CN",
    "GEOSITE,geolocation-!cn,PROXY",
    "GEOSITE,tld-!cn,PROXY",
    "GEOIP,cn,CN",

    "MATCH,No match",
  ]

  // 返回修改后的配置
  return config
}
