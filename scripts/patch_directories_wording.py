from pathlib import Path

path = Path('/Users/void/kinder/apps/web/app/crm/settings/directories/page.tsx')
text = path.read_text(encoding='utf-8')

replacements = [
    ('Справочник брендов', 'Справочник категорий'),
    ('брендов, ', 'категорий, '),
    ('Добавить бренд', 'Добавить категорию'),
    ('Поиск бренда...', 'Поиск категории...'),
    ('Удалить марку "${name}" и все её модели?', 'Удалить категорию "${name}" и все её подкатегории?'),
    ('Удалить модель "${name}"?', 'Удалить подкатегорию "${name}"?'),
    ('Нет моделей', 'Нет подкатегорий'),
    ('Редактировать бренд', 'Редактировать категорию'),
    ('Новый бренд', 'Новая категория'),
    ('Популярный бренд', 'Популярная категория'),
    ('Название (лат)', 'Название'),
    ('placeholder="TOYOTA"', 'placeholder="CATEGORY_IT"'),
    ('placeholder="Toyota"', 'placeholder="Робототехника"'),
    ('placeholder="Тойота"', 'placeholder="Робототехника"'),
    ('Страна', 'Группа'),
    ('placeholder="Япония"', 'placeholder="STEM"'),
    ('placeholder="TOYOTA_CAMRY"', 'placeholder="IT_JUNIOR"'),
    ('placeholder="Camry"', 'placeholder="Junior"'),
]

count = 0
for old, new in replacements:
    count += text.count(old)
    text = text.replace(old, new)

path.write_text(text, encoding='utf-8')
print(f'replacements={count}')
