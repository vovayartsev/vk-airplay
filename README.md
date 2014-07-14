# VK-Airplay

**Google Chrome плагин "VK-Airplay" играет музыку из vk.com через Apple TV**. (Полезно, когда на компьютере установлен Linux, или Airplay через WiFi работает нестабильно.)

![Скриншот](https://monosnap.com/image/hvUmJ43WZKcfLXt2WetBTCDAUyfy5A.png)!

# Установка

```bash
git clone https://github.com/vovayartsev/vk-airplay.git
```

**Запускаем сервер**
```bash
sudo apt-get install nodejs   # for Ubuntu
cd vk-airplay/vk-airplay-trampoline
npm install
./start.sh
```

**Устанавливаем Chrome-плагин**

1. открываем в Chrome страничку Extensions
2. включаем Developer Mode, нажимаем "Load Unpacked Extension", указываем путь до папки vk-airplay-chrome
![Extensions tab](https://monosnap.com/image/we1CGSnnqtihazxn0XQdB3myTxyxB0.png)
После этого в списке должен появиться плагин "VK Airplay Control", а на vk.com/audios - цветные "палочки" слева от названия песен.


# Pull Request'ы приветствуются!

Требуются улучшения в следующих направлениях (в порядке приоритета)

* Стабильность NodeJS-сервера - он периодически теряет соединение с AppleTV и "крешится" 
* Упрощение установки
* Поддержка видео VK
* Улучшение UX
