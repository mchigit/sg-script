from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class Military:
    npc_loc = {
        'medium': [{
            'x': 153, 'y': 44
        }, {
            'x': 153, 'y': 41
        }],
        'small': [{
            'x': 156, 'y': 39
        }]
    }


    

    def __init__(self, driver):
        self.driver = driver

    def attackNPC(self):
        militaryDriver = self.driver
        militaryDriver.execute_script('military_action_show(1,'');return false;')
       

        x_input = militaryDriver.find_element_by_name('x_value')
        y_input = militaryDriver.find_element_by_name('y_value')
        x_input.send_keys(self.npc_loc['small'][0]["x"])
        y_input.send_keys(self.npc_loc['small'][0]["y"])

        general = militaryDriver.find_element_by_id('general_1')
        general.click()

        # soldiers ID are a101-6, select them in a loop
        # if the element is not display:none, that means it is clickable
        # For now attack select only a101 - a106
        for i in range(1, 7):
            id = "a10{0}".format(i)
            solder_element = militaryDriver.find_element_by_id(id)
            if solder_element.value_of_css_property('display') != 'none':
                solder_element.click()

        militaryDriver.execute_script('check_form();')
        militaryDriver.implicitly_wait(1)
        militaryDriver.execute_script('sendFormStartArmyData();')


    def levelUp(self):
        militaryDriver = self.driver
        militaryDriver.refresh()
        militaryDriver.implicitly_wait(3)
        action = ActionChains(militaryDriver)
        action.click(militaryDriver.find_element_by_id('military_a'))
        action.pause(3)
        action.click(militaryDriver.find_element_by_id('military_general_general_a'))
        action.perform()

        try:
            militaryDriver.implicitly_wait(5)
            levelUpBtns = militaryDriver.find_elements_by_class_name('sg_zz_wzb')
            for btns in levelUpBtns:
                childImg = btns.find_element_by_tag_name('img')
                if childImg.get_attribute('src') == 'http://static.sg.9wee.com/general/g_cf_2.gif':
                    # clickable button
                    # militaryDriver.execute_script(childImg.get_attribute('onclick'))
                    # militaryDriver.implicitly_wait(1)
                    # ok_button = militaryDriver.find_element_by_class_name('kj_c_c').find_elements_by_tag_name('img')[0]
                    # militaryDriver.execute_script(ok_button.get_attribute('onclick'))
                    # militaryDriver.implicitly_wait(1)
                    if '等级' in childImg.get_attribute('msg'):
                        militaryDriver.execute_script('generalSurePromote(3); return false;')
                    elif '官职' in childImg.get_attribute('msg'):
                        militaryDriver.execute_script('generalSurePromote(1); return false;')
                    else:
                        militaryDriver.execute_script('generalSurePromote(2); return false;')
                        
                    
            print('Leveled up everything!')
            militaryDriver.refresh()
        except:
            print('couldnt find buttons')
        #  militaryDriver.execute_script('generalOfficialPromote(3)')

