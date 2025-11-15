#!/bin/bash

# Speedtest Engine: TCP Buffer & System Tuning Script
# 
# This script documents recommended kernel settings for accurate high-speed testing.
# These settings should be applied by the system operator (requires root/sudo).
#
# Purpose: Tune Linux kernel to support accurate speed testing at >300 Mbps
# - Increase TCP send/receive buffers
# - Increase IP forward and default buffer sizes
# - Optimize network stack performance
#
# WARNING: These are aggressive tuning settings suitable for speed testing servers.
# Review and customize for your environment before applying.

echo "=========================================="
echo "WiFiFly Speedtest Engine Tuning"
echo "=========================================="
echo ""
echo "This script shows commands to tune kernel for high-speed testing."
echo "These commands require root access (sudo)."
echo ""
echo "Do NOT run this script directly. Instead, copy and paste each command"
echo "as needed, reviewing each change carefully."
echo ""
echo "=========================================="
echo ""

echo "# 1. Increase TCP send buffer (default 4 MB, recommend 128 MB for >300 Mbps)"
echo "sudo sysctl -w net.ipv4.tcp_wmem='4096 87380 134217728'"
echo ""

echo "# 2. Increase TCP receive buffer (default 4 MB, recommend 128 MB)"
echo "sudo sysctl -w net.ipv4.tcp_rmem='4096 87380 134217728'"
echo ""

echo "# 3. Increase system-wide socket buffer maximums"
echo "sudo sysctl -w net.core.rmem_max=134217728"
echo "sudo sysctl -w net.core.wmem_max=134217728"
echo ""

echo "# 4. Increase socket backlog for high throughput"
echo "sudo sysctl -w net.ipv4.tcp_max_syn_backlog=4096"
echo "sudo sysctl -w net.core.netdev_max_backlog=5000"
echo ""

echo "# 5. Increase file descriptor limits (edit /etc/security/limits.conf)"
echo "# Add these lines to /etc/security/limits.conf:"
echo "# * soft nofile 100000"
echo "# * hard nofile 100000"
echo "# * soft nproc 100000"
echo "# * hard nproc 100000"
echo ""

echo "# 6. Verify current settings:"
echo "sysctl net.ipv4.tcp_wmem"
echo "sysctl net.ipv4.tcp_rmem"
echo "sysctl net.core.rmem_max"
echo "sysctl net.core.wmem_max"
echo "ulimit -n  # Check file descriptor limit"
echo ""

echo "=========================================="
echo "Additional Recommendations:"
echo "=========================================="
echo ""
echo "1. Network Interface Optimization:"
echo "   - Run Ethtool to check interface offload settings"
echo "   - Enable TSO (TCP Segmentation Offload) if available"
echo "   - Verify MTU is 1500 (standard) or 9000 (jumbo frames for higher throughput)"
echo ""

echo "2. Testing Strategy:"
echo "   - Start with STREAMS_DEFAULT=6, TEST_DURATION_MS=15000 for early testing"
echo "   - Once tuned, increase to STREAMS_DEFAULT=8, TEST_DURATION_MS=30000"
echo "   - Keep ANOMALY_SPEED_THRESHOLD=1000 (conservative, adjust after validation)"
echo ""

echo "3. Monitoring:"
echo "   - Watch CPU usage during tests (should not exceed 80%)"
echo "   - Monitor memory usage (buffers will increase)"
echo "   - Check network interface counters for dropped packets"
echo ""

echo "4. Persistent Settings:"
echo "   - To make sysctl changes permanent, edit /etc/sysctl.conf"
echo "   - Then run: sudo sysctl -p"
echo ""

echo "=========================================="
echo "For detailed docs, see: BACKEND_INTEGRATION_GUIDE.md"
echo "=========================================="
