Web based interface for controlling the Raspberry Pi Camera, includes motion detection, time lapse, and image and video recording.
Current version 6.4.50
All information on this project can be found here: http://www.raspberrypi.org/forums/viewtopic.php?f=43&t=63276

The wiki page can be found here:

http://elinux.org/RPi-Cam-Web-Interface

This includes the installation instructions at the top and full technical details.

# HACK HACK HACK

Modifications on top of original build:

* Use `min.php` as entry point, with minor modifications
  * run in fullscreen mode at all times
  * post mouse click events to a web server

To access base functionality provided by `index.php`, visit `/admin.php`.
