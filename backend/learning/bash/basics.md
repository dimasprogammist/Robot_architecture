---
id: bash-basics
title: Bash
category: bash
order: 1
description: Скрипты запуска и диагностики.
tags: [bash]
---

# Bash

```bash
#!/usr/bin/env bash
set -euo pipefail
python3 -m uvicorn app.main:app --port 8000
```
