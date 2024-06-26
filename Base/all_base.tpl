{% if request.target == "clash" or request.target == "clashr" %}
allow-lan:true
bind-address: "*"
mode: rule
log-level: info
ipv6:true
external-controller: 127.0.0.1:9090
unified-delay: true
tcp-concurrent: true
dns:
	enable:true
	prefer-h3: false
	listen:0.0.0.0:1053
	ipv6: true
	enhanced-mode: fake-ip
	fake-ip-filter:
		- '*.lan'
		- localhost.ptlogin2.qq.com
	nameserver:
		- https://doh.pub/dns-query
		- https://dns.alidns.com/dns-query
	proxy-server-nameserver:
		- https://doh.pub/dns-query
	fallback:
    - https://dns.google/dns-query
    - https://1.1.1.1/dns-query
sniff:
	enable:true
	sniff:
		HTTP:
			ports: [80, 8080-8880]
				override-destination: true
		TLS:
			ports: [443, 8443]
		QUIC:
			ports: [443, 8443]
		skip-domain:
			- Mijia Cloud
mixed-port: 7890
tun:
	enable:true
	stack:mixed
	device:clash
	auto-route: true
	auto-detect-interface: true
	dns-hijack:
		- any:53
		- tcp://any:53

rules:
	- RULE-SET,AD,💩 广告
	- RULE-SET,Download,DIRECT
	- RULE-SET,GameDownloadCN,DIRECT
	- RULE-SET,GameDownload,🎮 游戏下载
	- RULE-SET,gfw,🌎 国外
	- RULE-SET,Apple,🍎 苹果
	- RULE-SET,Microsoft,Ⓜ️ 微软
	- RULE-SET,telegram,🌎 国外
	- RULE-SET,google,🌎 国外
	- RULE-SET,proxy,🌎 国外
	- RULE-SET,direct,🧱 国内
	- RULE-SET,lancidr,🧱 国内
	- RULE-SET,cncidr,🧱 国内
	- MATCH,🐟 未知
rule-providers:
	AD:
		type:http
		url:"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/AdGuardSDNSFilter/AdGuardSDNSFilter_Classical.yaml"
		interval:86400
		proxy: DIRECT
		behavior: classical
		format: yaml
	Download:
		type:http
		url:"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Download/Download.yaml"
		interval:86400
		proxy: DIRECT
		behavior: classical
		format: yaml
	GameDownloadCN:
		type:http
		url:"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Game/GameDownloadCN/GameDownloadCN.yaml"
		interval:86400
		proxy: DIRECT
		behavior: classical
		format: yaml
	GameDownload:
		type:http
		url:"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Game/GameDownload/GameDownload.yaml"
		interval:86400
		proxy: DIRECT
		behavior: classical
		format: yaml
	gfw:
		type:http
		url:"https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/gfw.txt"
		interval:86400
		proxy: DIRECT
		behavior: domain
		format: text
	Apple:
		type:http
		url:"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Apple/Apple_Classical.yaml"
		interval:86400
		proxy: DIRECT
		behavior: classical
		format: yaml
	Microsoft:
		type:http
		url:"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Microsoft/Microsoft.yaml"
		interval:86400
		proxy: DIRECT
		behavior: classical
		format: yaml
	telegram:
		type:http
		url:"https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/telegramcidr.txt"
		interval:86400
		proxy: DIRECT
		behavior: ipcidr
		format: text
	google:
		type:http
		url:"https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/google.txt"
		interval:86400
		proxy: DIRECT
		behavior: domain
		format: text
	proxy:
		type:http
		url:"https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/proxy.txt"
		interval:86400
		proxy: DIRECT
		behavior: domain
		format: text
	direct:
		type:http
		url:"https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/direct.txt"
		interval:86400
		proxy: DIRECT
		behavior: domain
		format: text
	lancidr:
		type:http
		url:"https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/lancidr.txt"
		interval:86400
		proxy: DIRECT
		behavior: ipcidr
		format: text
	cncidr:
		type:http
		url:"https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/cncidr.txt"
		interval:86400
		proxy: DIRECT
		behavior: ipcidr
		format: text
ntp:
  enable: true
  write-to-system: false
  server: time.apple.com
  port: 123
  interval: 30
	{% if local.clash.new_field_name == "true" %}
		proxies: ~
		proxy-groups: ~
		#rules: ~
	{% else %}
		Proxy: ~
		Proxy Group: ~
		#Rule: ~
	{% endif %}
{% endif %}
