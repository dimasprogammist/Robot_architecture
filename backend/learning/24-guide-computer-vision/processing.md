---
id: vision-processing
title: Простые преобразования
category: vision
section: С нуля
order: 5
description: Простые преобразования
tags: [vision, основы]
technologies: []
related: []
---

# Простые преобразования

Преобразование строит новую таблицу из старой.

Серое изображение:

```python
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
```

Уменьшение:

```python
small = cv2.resize(image, (320, 240))
```

Обрезка — срез массива, не отдельная «магия». В NumPy и OpenCV строка идёт первой:

```python
crop = image[40:200, 10:180]
```

Это строки с 40 до 200 и столбцы с 10 до 180. Если перепутать порядок, вырежется не тот прямоугольник.
