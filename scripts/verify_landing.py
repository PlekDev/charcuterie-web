import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        try:
            # Go to the home page
            print("Navigating to http://localhost:3000...")
            await page.goto('http://localhost:3000', wait_until='domcontentloaded', timeout=60000)
            await asyncio.sleep(5)

            os.makedirs('/home/jules/verification/screenshots', exist_ok=True)

            await page.screenshot(path='/home/jules/verification/screenshots/hero_final.png')
            print("Hero screenshot saved.")

            await page.evaluate("window.scrollTo(0, 1000)")
            await asyncio.sleep(2)
            await page.screenshot(path='/home/jules/verification/screenshots/categories_final.png')
            print("Categories screenshot saved.")

            await page.evaluate("window.scrollTo(0, 2000)")
            await asyncio.sleep(2)
            await page.screenshot(path='/home/jules/verification/screenshots/editorial_final.png')
            print("Editorial screenshot saved.")

            await page.evaluate("window.scrollTo(0, 3000)")
            await asyncio.sleep(2)
            await page.screenshot(path='/home/jules/verification/screenshots/products_final.png')
            print("Products screenshot saved.")

            print("All screenshots taken successfully.")

        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
