class City:
    famuchangs = []
    nituchangs = []
    tiekuangchangs = []
    nongtians = []

    def __init__(self, mucai, nitu, tiekuang, liangshi):
        self.mucai = mucai
        self.nitu = nitu
        self.tiekuang = tiekuang
        self.liangshi = liangshi

    def setResource(self, mucai, nitu, tiekuang, liangshi):
        self.mucai = mucai
        self.nitu = nitu
        self.tiekuang = tiekuang
        self.liangshi = liangshi

    def getResource(self):
        return {
            'mucai': self.mucai,
            'nitu': self.nitu,
            'tiekuang': self.tiekuang,
            'liangshi': self.liangshi
        }

    def parseResourceBuilding(self, driver):
        resourceColumns = driver.find_elements_by_class_name('sg_jza_box')
        self.famuchangs = resourceColumns[0]
        self.nituchangs = resourceColumns[1]
        self.tiekuangchangs = resourceColumns[2]
        self.nongtians = resourceColumns[3]

    def canBuild(self, driver):
        # TODO: Modify condition for building
        # For now, just check whether the build button is there
        # In the future, should check if city has enough resources
        buildButtons = driver.find_element_by_css_selector(".CBU img")
        if buildButtons and len(buildButtons) == 2:
            return True

        return False

    def buildMilitaryBuildings(self, driver):
        driver.refresh()
        driver.find_element_by_id('city_build_building_a').click()
