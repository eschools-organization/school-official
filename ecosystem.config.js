module.exports = {
  apps: [{
    name: "bg",
    script: "npm",
    args: "start",
    cwd: "/var/www/html/bg",
    max_restarts: 5,
    min_uptime: "10s",
  }]
};
