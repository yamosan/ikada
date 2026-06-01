#!/bin/bash

set -euo pipefail

i=1

while true; do
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  if (( i % 15 == 0 )); then
    level="error"
  elif (( i % 5 == 0 )); then
    level="warn"
  else
    level="info"
  fi

  status_codes=("200" "200" "200" "200" "201" "204" "301" "400" "401" "403" "404" "500" "502" "503")
  methods=("GET" "GET" "GET" "POST" "PUT" "DELETE" "PATCH")
  paths=("/api/users" "/api/users/%s/profile" "/api/orders" "/api/orders/%s/items" "/api/products" "/api/auth/login" "/api/health" "/api/search")
  regions=("us-east-1" "us-west-2" "eu-west-1" "ap-northeast-1")

  sc=${status_codes[$((RANDOM % ${#status_codes[@]}))]}
  method=${methods[$((RANDOM % ${#methods[@]}))]}
  path=$(printf "${paths[$((RANDOM % ${#paths[@]}))]}" "$((RANDOM % 1000))")
  region=${regions[$((RANDOM % ${#regions[@]}))]}

  if (( RANDOM % 7 == 0 )); then
    plain_messages=(
      "server starting up..."
      "reloading configuration"
      "WARNING: deprecated config key detected"
      "connected to database"
      "shutting down gracefully"
      "healthcheck passed"
      "this is a plain text log line, not JSON"
    )
    printf '%s\n' "${plain_messages[$((RANDOM % ${#plain_messages[@]}))]}"
  else
    printf '{"ts":"%s","level":"%s","service":"test-sh","seq":%s,"message":"synthetic log event %s","metadata":{"requestId":"req-%s","duration_ms":%s,"user":{"id":%s,"name":"user-%s","email":"user-%s@example.com","roles":["viewer","editor"],"preferences":{"theme":"dark","language":"ja","notifications":{"email":true,"push":false,"sms":false}}},"http":{"method":"%s","path":"%s","status":%s,"headers":{"content-type":"application/json","x-request-id":"req-%s","x-forwarded-for":"192.168.%s.%s"}},"server":{"hostname":"app-server-%s","region":"%s","version":"1.4.2","uptime_sec":%s},"tags":["auto-generated","test","v2"],"context":{"correlationId":"corr-%s","parentSpanId":"span-%s","traceFlags":1},"nested":{"a":{"b":{"c":{"d":{"e":"deeply-nested-value"}}}}}}}\n' \
      "$ts" "$level" "$i" "$i" \
      "$i" "$((RANDOM % 5000))" "$((i % 10))" "$((i % 10))" "$((i % 10))" \
      "$method" "$path" "$sc" "$i" "$((RANDOM % 256))" "$((RANDOM % 256))" \
      "$((i % 3))" "$region" "$((i * 60 + RANDOM % 3600))" \
      "$((RANDOM % 100000))" "$((RANDOM % 100000))"
  fi

  i=$((i + 1))
  sleep 1
done
