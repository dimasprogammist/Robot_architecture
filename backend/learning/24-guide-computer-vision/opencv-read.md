---
id: vision-opencv-read
title: OpenCV: прочитать и показать
category: vision
section: С нуля
order: 4
description: OpenCV: прочитать и показать
tags: [vision, основы]
technologies: []
related: []
---

# OpenCV: прочитать и показать

**OpenCV** — библиотека функций для картинок. Она не «видит сама». Вы вызываете функцию, она возвращает таблицу.

```python
import cv2

image = cv2.imread("photo.png")
print(image.shape)
cv2.imshow("preview", image)
cv2.waitKey(0)
```

`shape` для цветного снимка — три числа: высота, ширина, число каналов. OpenCV читает цвет как **BGR**, не RGB: первый канал синий. Это частая причина «перепутанных» цветов, если отдать массив в другую библиотеку без перевода.

`imread` вернёт `None`, если путь неверный. Проверяйте это до `shape`.
