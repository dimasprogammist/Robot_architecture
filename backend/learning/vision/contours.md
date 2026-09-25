---
id: vision-contours
title: Контуры
category: vision
section: С нуля
order: 8
description: Контуры
tags: [vision, основы]
technologies: []
related: []
---

# Контуры

**Контур** — линия по границе белой области на маске.

```python
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
```

`RETR_EXTERNAL` берёт только внешние границы, без дыр внутри.

У контура можно спросить площадь и прямоугольник вокруг:

```python
for contour in contours:
    area = cv2.contourArea(contour)
    x, y, w, h = cv2.boundingRect(contour)
```

Маленькая площадь часто означает шум, а не деталь. Её отбрасывают сравнением `area` с порогом, который вы выбираете по размеру объекта в пикселях.
