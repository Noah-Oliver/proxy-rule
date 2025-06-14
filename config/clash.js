/**
 * 整个脚本的总开关，在Mihomo Party使用的话，请保持为true
 * true = 启用
 * false = 禁用
 */
const enable = true

//代理分组去除通用
const groupExcludeFilter = {
  "exclude-filter": "剩余|流量|套餐|到期|使用|文档|最新|网址|官网|更新|订阅|地址",
}

// 规则集通用配置
const ruleProviderCommon = {
  type: "http",
  interval: 28800,
  //proxy: "DIRECT",
}

// 规则集配置
const ruleProviders = {
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
  Proxy1: {
    ...ruleProviderCommon,
    url: "https://github.com/ACL4SSR/ACL4SSR/raw/master/Clash/ProxyGFWlist.list",
    behavior: "classical",
    format: "text",
  },
  Direct1: {
    ...ruleProviderCommon,
    url: "https://github.com/ACL4SSR/ACL4SSR/raw/master/Clash/ChinaDomain.list",
    behavior: "classical",
    format: "text",
  },
  Cn1: {
    ...ruleProviderCommon,
    url: "https://github.com/ACL4SSR/ACL4SSR/raw/master/Clash/ChinaIp.list",
    behavior: "classical",
    format: "text",
  },
  Cn2: {
    ...ruleProviderCommon,
    url: "https://github.com/ACL4SSR/ACL4SSR/raw/master/Clash/ChinaIpV6.list",
    behavior: "classical",
    format: "text",
  },
}

// 规则
const rules = [
  // 自定义规则
  "AND,((DST-PORT,443),(NETWORK,udp)),REJECT",
  "AND,((NOT,((RULE-SET,AD!))),(RULE-SET,AD)),AD",

  "RULE-SET,download,Download",
  "RULE-SET,unlock,Unlock",
  "RULE-SET,proxy,PROXY",
  "RULE-SET,direct,CN",

  "RULE-SET,Proxy1,PROXY",
  "RULE-SET,Direct1,CN",

  "RULE-SET,Cn1,CN",
  "RULE-SET,Cn2,CN",

  "MATCH,No match",
]

// 程序入口
function main(config) {
  //去掉免费节点
  const proxies = config.proxies.filter((proxy) => !proxy.name.includes("剩余|流量|套餐|到期|使用|文档|最新|网址|官网|更新|订阅|地址"));
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
  config["tcp-concurrent"] = false
  config["find-process-mode"] = "strict"
  config["profile"] = {
    //存储 select 选择记录
    "store-selected": true,
  }
  config["dns"] = {
    enable: true,
    ipv6: true,
  }
  config["sniffer"] = {
    enable: true,
    "force-dns-mapping": true,
    "parse-pure-ip": false,
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
    "force-domain": [
      "+.v2ex.com",
    ],
    "skip-domain": [
      "Mijia Cloud",
    ],
    "skip-src-address": [
      "192.168.0.3/32",
    ],
    "skip-dst-address": [
      "192.168.0.3/32",
    ],
  }
  config["proxy-groups"] = [
    {
      name: "PROXY",
      ...groupExcludeFilter,
      type: "select",
      proxies: ["DIRECT",],
      "include-all": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Final.png",
    },
    {
      name: "Unlock",
      ...groupExcludeFilter,
      type: "select",
      proxies: ["DIRECT","PROXY",],
      "include-all": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Available_1.png",
    },
    {
      name: "Download",
      ...groupExcludeFilter,
      type: "select",
      proxies: ["DIRECT","PROXY",],
      "include-all": true,
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Download.png",
    },
    {
      name: "CN",
      ...groupExcludeFilter,
      type: "select",
      proxies: ["DIRECT","PROXY",],
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Proxy.png",
    },
    {
      name: "No match",
      ...groupExcludeFilter,
      type: "select",
      proxies: ["DIRECT","PROXY",],
      icon: "https://github.com/Koolson/Qure/raw/master/IconSet/Color/Stack.png",
    },
    {
      name: "AD",
      ...groupExcludeFilter,
      type: "select",
      proxies: ["REJECT","DIRECT","PROXY",],
      icon: "https://github.com/NB921/picture/raw/main/AD3.png",
    },
  ]

  // 覆盖原配置中的规则
  config["rule-providers"] = ruleProviders
  config["rules"] = rules

  // 返回修改后的配置
  return config
}
