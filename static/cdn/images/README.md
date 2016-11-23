### Extracting Icons from WoW (Windows only right now)

* In the battle.net launcher, go into Game Settings, select "Additional Command Line Arguments" and enter `-console`
* Start the game and stay on the login screen
* Press the backtick key to open the console up
* Enter ```ExportInterfaceFiles art```.  The game will appear to freeze while this happens.
* Once the game starts responding again, go to <WoW Install Directory>/BlizzardInterfaceArt/

* Remove the existing icons from the Web project public/assets/images/icons
* Copy the icons from <WoW Install Directory>/BlizzardInterfaceArt/ICONS/ into the Web project icons dir
* Open a File Explorers.  Navigate to /static/cdn/images.
* In the explorer, drag the "icons" directory onto the BLP2PNG.exe file, in the /static/cdn/images directory
