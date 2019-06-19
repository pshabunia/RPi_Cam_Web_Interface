<?php 
      function getDimension() {
        global $config;
        return 'style="width:' . $config['width'] . 'px;height:' . $config['height'] . 'px;"';
     }
?>

<!DOCTYPE html>
<html>
  <head>
    <title>RPi Cam Preview</title>
    <script src="js/script.js"></script>
	<link rel="stylesheet" href="css/style_minified.css" />
  </head>
  <body onload="setTimeout('init(0,25,1);', 100);">
    <center>
      <div><img id="mjpeg_dest" <?php echo getDimension();?>  onclick="pointer_position(this);" /></div>
    </center>
 </body>
</html>