import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

# Setup Chrome options
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

# Create screenshots directory
os.makedirs('screenshots', exist_ok=True)

# Pages to screenshot
pages = [
    ('index.html', 'homepage'),
    ('features.html', 'features'),
    ('products.html', 'products'),
    ('contact.html', 'contact'),
    ('customers.html', 'customers'),
    ('messages.html', 'messages'),
    ('login.html', 'login'),
    ('register.html', 'register'),
    ('profile.html', 'profile'),
    ('admin.html', 'admin')
]

try:
    driver = webdriver.Chrome(options=chrome_options)
    
    for page, name in pages:
        try:
            url = f'http://localhost:8000/{page}'
            print(f'Taking screenshot of {page}...')
            driver.get(url)
            time.sleep(2)  # Wait for page to load
            driver.save_screenshot(f'screenshots/{name}.png')
            print(f'✓ Saved {name}.png')
        except Exception as e:
            print(f'✗ Error with {page}: {str(e)}')
    
    driver.quit()
    print('\nAll screenshots completed!')
    
except Exception as e:
    print(f'Error initializing driver: {str(e)}')