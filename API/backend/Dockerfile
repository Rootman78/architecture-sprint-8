# Используем официальный образ Python
FROM python:3.9-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем остальные файлы
COPY . .

# Открываем порт, на котором работает приложение
EXPOSE 8000

ENV PYTHONUNBUFFERED=1

# Запускаем приложение
CMD ["python",  "-u", "report_server.py"]