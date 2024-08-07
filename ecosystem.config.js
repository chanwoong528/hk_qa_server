// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "hkqa-server", // 실행할 앱의 이름
      script: "npm",
      args: "run start:prod",
      watch: true, // 파일 변경 모니터링, 파일 변동시 재시작
      instances: 1,
      exec_mode: "cluster",
      env: {
        "PORT": 3000,
        "NODE_ENV": "prod"
      }
    }
  ]
}
