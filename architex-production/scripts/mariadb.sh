#!/usr/bin/env bash
# Architex OS — portable MariaDB start/stop/status (E:\Hermes\mariadb)
set -e
MARIADB="E:/Hermes/mariadb"
INI="$MARIADB/my-architex.ini"

case "${1:-status}" in
  start)
    "$MARIADB/bin/mysqld.exe" --defaults-file="$INI" --console &
    echo "MariaDB starting (pid $!)..."
    ;;
  stop)
    "$MARIADB/bin/mysqladmin.exe" -u root shutdown
    echo "MariaDB stopped."
    ;;
  status)
    if "$MARIADB/bin/mysql.exe" -u root -e "SELECT 1" >/dev/null 2>&1; then
      echo "MariaDB is RUNNING:"
      "$MARIADB/bin/mysql.exe" -u root -e "SELECT VERSION() AS version;"
    else
      echo "MariaDB is NOT running. Start with: $0 start"
    fi
    ;;
  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
