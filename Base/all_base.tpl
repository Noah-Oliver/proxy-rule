{% if request.target == "clash" or request.target == "clashr" %}
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
        ntp:
          enable: true
          write-to-system: false
          server: time.apple.com
          port: 123
          interval: 30
    {% endif %}

    {% if global.clash.new_field_name == "true" %}

        proxies: ~
        proxy-groups: ~
        rules: ~
    {% else %}
        Proxy: ~
        Proxy Group: ~
        Rule: ~
    {% endif %}

{% endif %}
