@echo off
@if not defined npm_config_node_gyp (
  node "%~dp0config.js" %*
) else (
  node "%npm_config_node_gyp%\..\config.js" %*
)