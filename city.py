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