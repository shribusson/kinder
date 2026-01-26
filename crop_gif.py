#!/usr/bin/env python3
from PIL import Image

gif_path = "/Users/void/kinder/Милый_мультик_с_совенком.gif"
output_path = "/Users/void/kinder/apps/web/public/owl-animated.gif"

try:
    frames = []
    durations = []
    
    with Image.open(gif_path) as orig:
        print(f"Всего кадров: {getattr(orig, 'n_frames', 1)}")
        print(f"Размер: {orig.size}")
        
        for frame_idx in range(getattr(orig, 'n_frames', 1)):
            orig.seek(frame_idx)
            
            # Конвертируем кадр
            if orig.mode == 'P':
                frame = orig.convert('RGBA')
            else:
                frame = orig.convert('RGBA')
            
            # Обрезаем прозрачность/чёрные края
            bbox = frame.getextrema()
            if bbox:
                frame = frame.crop(frame.getbbox())
            
            frames.append(frame)
            durations.append(orig.info.get('duration', 100))
            print(f"Кадр {frame_idx}: {frame.size}")
    
    if frames:
        # Сохраняем как GIF с прозрачностью
        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            duration=durations,
            loop=0,
            transparency=0
        )
        print(f"✅ Сохранено: {output_path}")
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()
