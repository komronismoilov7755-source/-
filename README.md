# Змейка 🐍

Классическая игра «Змейка» — белый фон, красная змейка, уровни сложности и таблица рекордов. Чистый HTML/CSS/JS, без сборки и зависимостей.

## Как опубликовать на GitHub Pages

1. Создайте новый репозиторий на GitHub (например, `snake-game`).
2. Загрузите в него три файла из этой папки: `index.html`, `style.css`, `script.js`.
   - Через веб-интерфейс: кнопка **Add file → Upload files**.
   - Или через терминал:
     ```bash
     git init
     git add index.html style.css script.js README.md
     git commit -m "Snake game"
     git branch -M main
     git remote add origin https://github.com/ВАШ_ЛОГИН/snake-game.git
     git push -u origin main
     ```
3. В репозитории откройте **Settings → Pages**.
4. В разделе **Build and deployment** выберите:
   - Source: `Deploy from a branch`
   - Branch: `main`, папка `/ (root)`
5. Сохраните — через минуту-две сайт появится по адресу:
   `https://ВАШ_ЛОГИН.github.io/snake-game/`

## Управление
- **Клавиатура:** стрелки или WASD
- **Телефон:** свайпы по игровому полю или кнопки под ним

## Функции
- 5 уровней сложности (скорость змейки)
- Таблица из 5 лучших результатов (хранится в браузере, localStorage)
- Рекорд сохраняется между сессиями
