---
id: cpp-basics
title: Основы C++
category: cpp
order: 1
description: C++ для прошивок MCU и realtime-контуров.
tags: [cpp, firmware]
technologies: [C++]
---

# Основы C++

C++ используют для STM32, ESP32 и драйверов двигателей, где важны детерминизм и работа с регистрами.

```cpp
#include <cstdint>

std::uint16_t adc_read() {
  return 0;
}
```

Для Architecture Canvas опишите в блоке MCU интерфейсы (UART, CAN) и алгоритм цикла управления.
