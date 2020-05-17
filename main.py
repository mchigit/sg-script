from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from city import City
from actions import Actions
from military import Military
import urllib.parse

PATH = '/Users/dychi/Documents/webdriver/chromedriver'
driver = webdriver.Chrome(PATH)


driver.get("http://sg.9wee.com/")
# driver.add_cookie({
#     'name': 'weeCookie',
#     'value': '%7B%22loginFlag%22%3Atrue%2C%22uid%22%3A%22123172068%22%2C%22username%22%3A%22wuhui8013ee%22%2C%22nickname%22%3A%22%5Cu8fdf%5Cu8bef%22%2C%22usertype%22%3A%220%22%2C%22email%22%3A%22dychi1997@gmail.com%22%2C%22urb%22%3A%221965-02-27%22%2C%22mac%22%3A%22440be5b95d0e11884a18ec559f7b3c7f%22%7D',
#     'path': '/',
# })

driver.implicitly_wait(10)

driver.implicitly_wait(5)

userName = driver.find_element_by_id('user-name')
userName.send_keys('wuhui8013ee')

password_hidden = driver.find_element_by_id('showPass')
password_hidden.click()

password = driver.find_element_by_id('user-wp')
password.send_keys('baidu@88')

password.send_keys(Keys.RETURN)

try:
    lastUserLogin = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user_lastlogin"))
    )
    driver.execute_script('document.getElementById(\'user_lastlogin\').getElementsByTagName(\'a\')[0].setAttribute(\'target\', \'_self\')')
    loginLink = lastUserLogin.find_elements_by_tag_name('a')
    if len(loginLink) > 0:
        loginLink[0].click()

    driver.implicitly_wait(5)
    # driver.switch_to.window(driver.window_handles[1])
    actualGamePage = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )


    while True:
        mucai = int(actualGamePage.find_element_by_id('r0').text)
        nitu = int(actualGamePage.find_element_by_id('r1').text)
        tiekuang = int(actualGamePage.find_element_by_id('r2').text)
        liangshi = int(actualGamePage.find_element_by_id('r3').text)
        city = City(mucai, nitu, tiekuang, liangshi)
        city.parseResourceBuilding(driver)
        print(city.getResource())

        isMilitaryInOpration = driver.find_element_by_id('is_military_training_c')
        innerChild = isMilitaryInOpration.get_attribute('innerHTML')
        if isMilitaryInOpration.value_of_css_property('display') == 'none' or '无战争' in innerChild:
            print('is going to attack')
            military = Military(driver)
            military.attackNPC()
        else:
            print('is not going to attack')

        military = Military(driver)
        military.levelUp()
        
        time.sleep(300)


    
finally:
    time.sleep(10)
    driver.quit()


