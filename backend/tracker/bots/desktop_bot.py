import os
import time
import pyautogui
import webbrowser

class WhatsAppDesktopBot:
    def __init__(self):
        # Safety fail-safe: Gerakkan mouse ke pojok kiri atas untuk membatalkan script
        pyautogui.FAILSAFE = True
        
    def call(self, phone_number):
        print(f"[BOT] Preparing to call {phone_number} via Desktop App...")
        
        # 1. Format Nomor (Harus 62xxx)
        clean_number = "".join(filter(str.isdigit, phone_number))
        if clean_number.startswith("0"):
            clean_number = "62" + clean_number[1:]
            
        # 2. Buka Link
        # Kita coba gunakan protocol langsung (whatsapp://) karena lebih cepat & tanpa browser popup jika terdaftar
        uri = f"whatsapp://send?phone={clean_number}"
        print(f"[BOT] Opening URI: {uri}")
        
        try:
            # os.startfile lebih handal di Windows untuk protocol handler
            os.startfile(uri)
            print("[BOT] os.startfile successful.")
        except Exception as e:
            print(f"[BOT] os.startfile failed: {e}. Falling back to webbrowser...")
            # Fallback ke browser jika protocol handler gagal
            webbrowser.open(f"https://wa.me/{clean_number}")
            time.sleep(2)
            pyautogui.press('enter') # Konfirmasi popup browser
        
        # 3. Tunggu Aplikasi Terbuka & Fokus (8 detik - WA Desktop agak berat)
        print("[BOT] Waiting for WhatsApp Desktop to load and focus...")
        time.sleep(8) 
        
        # 4. Pastikan fokus dengan menekan tombol 'Esc' sekali (menghapus popup/search focus jika ada)
        pyautogui.press('esc')
        time.sleep(1)
        
        # 5. Tekan Shortcut Call (Audio Call)
        # Windows: Ctrl + Shift + C
        print("[BOT] Sending Call Shortcut (Ctrl+Shift+C)...")
        pyautogui.hotkey('ctrl', 'shift', 'c')
        
        # 6. Fallback: Kadang WA butuh Enter jika ada dialog konfirmasi
        time.sleep(2)
        pyautogui.press('enter')
        
        print("[BOT] Call command sequence finished.")
        return True

if __name__ == "__main__":
    # Test Manual
    bot = WhatsAppDesktopBot()
    # Ganti nomor test di sini
    bot.call("0895411663546")
