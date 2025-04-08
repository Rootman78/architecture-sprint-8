from flask import Flask, jsonify
from flask_cors import CORS
#import random
#from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех доменов

# Генерация тестовых данных отчёта
def generate_report_data():
    '''
    # Создаем временные метки за последние 7 дней
    dates = [datetime.now() - timedelta(days=i) for i in range(7)]
    dates = [d.strftime('%Y-%m-%d') for d in dates]
    
    # Генерируем случайные данные для каждой даты
    report_data = {
        "dates": dates,
        "metrics": {
            "sales": [random.randint(1000, 5000) for _ in range(7)],
            "visitors": [random.randint(500, 2000) for _ in range(7)],
            "conversion": [round(random.uniform(1.5, 5.0), 2) for _ in range(7)],
            "revenue": [round(random.uniform(5000, 20000), 2) for _ in range(7)]
        },
        "summary": {
            "total_sales": sum([random.randint(1000, 5000) for _ in range(7)]),
            "avg_conversion": round(random.uniform(2.0, 4.5), 2),
            "total_revenue": round(sum([random.uniform(5000, 20000) for _ in range(7)]), 2)
        }
    }
    '''
    report_data = {"dates": "test"}
    return report_data

# Маршрут для получения данных отчёта
@app.route('/api/reports', methods=['GET'])
def get_reports():
    return jsonify(generate_report_data())


if __name__ == '__main__':
    app.run(debug=True, port=8000)