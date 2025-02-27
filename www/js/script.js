//
// Interface
//
function pointer_position(e) {
  var we = window.event;
  var x = we.pageX - we.currentTarget.offsetLeft;
  var y = we.pageY - we.currentTarget.offsetTop;
  var xmlHttp = new XMLHttpRequest();
  var async = true
  xmlHttp.onreadystatechange = function() {}
  xmlHttp.open("GET", "http://raspberrypi.local:1337/position?x=" + x + "&y=" + y, async);
  xmlHttp.send(null);
}

function toggle_fullscreen(e) {

  var background = document.getElementById("background");

  if(!background) {
    background = document.createElement("div");
    background.id = "background";
    document.body.appendChild(background);
  }
  
  if(e.className == "fullscreen") {
    e.className = "";
    background.style.display = "none";
  }
  else {
    e.className = "fullscreen";
    background.style.display = "block";
  }
}

function set_display(value) {
   var d = new Date();
   var val;
   d.setTime(d.getTime() + (365*24*60*60*1000));
   var expires = "expires="+d.toUTCString();
   if (value == "SimpleOff") {
	   val = "Off";
   } else if (value == "SimpleOn") {
	   val = "Full";
   } else {
	   val = value
   }
   
   document.cookie="display_mode=" + val + "; " + expires;
   document.location.reload(true);
}

function set_stream_mode(value) {
   var d = new Date();
   d.setTime(d.getTime() + (365*24*60*60*1000));
   var expires = "expires="+d.toUTCString();
   
   if (value == "DefaultStream") {
      document.getElementById("toggle_stream").value = "MJPEG-Stream";
   } else {
      document.getElementById("toggle_stream").value = "Default-Stream";
   }
   document.cookie="stream_mode=" + value + "; " + expires;
   document.location.reload(true);
}

function schedule_rows() {
   var sun, day, fixed, mode;
   mode = parseInt(document.getElementById("DayMode").value);
   switch(mode) {
      case 0: sun = 'table-row'; day = 'none'; fixed = 'none'; break;
      case 1: sun = 'none'; day = 'table-row'; fixed = 'none'; break;
      case 2: sun = 'none'; day = 'none'; fixed = 'table-row'; break;
      default: sun = 'table-row'; day = 'table-row'; fixed = 'table-row'; break;
   }
   var rows;
   rows = document.getElementsByClassName('sun');
   for(i=0; i<rows.length; i++) 
      rows[i].style.display = sun;
   rows = document.getElementsByClassName('day');
   for(i=0; i<rows.length; i++) 
      rows[i].style.display = day;
   rows = document.getElementsByClassName('fixed');
   for(i=0; i<rows.length; i++) 
      rows[i].style.display = fixed;
}

function set_preset(value) {
  var values = value.split(" ");
  document.getElementById("video_width").value = values[0];
  document.getElementById("video_height").value = values[1];
  document.getElementById("video_fps").value = values[2];
  document.getElementById("MP4Box_fps").value = values[3];
  document.getElementById("image_width").value = values[4];
  document.getElementById("image_height").value = values[5];
  
  set_res();
}

function set_res() {
  send_cmd("px " + document.getElementById("video_width").value + " " + document.getElementById("video_height").value + " " + document.getElementById("video_fps").value + " " + document.getElementById("MP4Box_fps").value + " " + document.getElementById("image_width").value + " " + document.getElementById("image_height").value);
  update_preview_delay();
  updatePreview(true);
}

function set_ce() {
  send_cmd("ce " + document.getElementById("ce_en").value + " " + document.getElementById("ce_u").value + " " + document.getElementById("ce_v").value);

}

function set_preview() {
  send_cmd("pv " + document.getElementById("quality").value + " " + document.getElementById("width").value + " " + document.getElementById("divider").value);
  update_preview_delay();
}

function set_encoding() {
  send_cmd("qp " + document.getElementById("minimise_frag").value + " " + document.getElementById("initial_quant").value + " " + document.getElementById("encode_qp").value);
}

function set_roi() {
  send_cmd("ri " + document.getElementById("roi_x").value + " " + document.getElementById("roi_y").value + " " + document.getElementById("roi_w").value + " " + document.getElementById("roi_h").value);
}

function set_at() {
  send_cmd("at " + document.getElementById("at_en").value + " " + document.getElementById("at_y").value + " " + document.getElementById("at_u").value + " " + document.getElementById("at_v").value);
}

function set_ac() {
  send_cmd("ac " + document.getElementById("ac_en").value + " " + document.getElementById("ac_y").value + " " + document.getElementById("ac_u").value + " " + document.getElementById("ac_v").value);
}

function set_ag() {
  send_cmd("ag " + document.getElementById("ag_r").value + " " + document.getElementById("ag_b").value);
}

function send_macroUpdate(i, macro) {
  var macrovalue = document.getElementById(macro).value;
  if(!document.getElementById(macro + "_chk").checked) {
	  macrovalue = "-" + macrovalue;
  }
  send_cmd("um " + i + " " + macrovalue);
}

//
// System shutdow, reboot, settime
//
function sys_shutdown() {
  ajax_status.open("GET", "cmd_func.php?cmd=shutdown", true);
  ajax_status.send();
}

function sys_reboot() {
  ajax_status.open("GET", "cmd_func.php?cmd=reboot", true);
  ajax_status.send();
}

function sys_settime() {
  var strDate = document.getElementById("timestr").value;
  if(strDate.indexOf("-") < 0) {
	  ajax_status.open("GET", "cmd_func.php?cmd=settime&timestr=" + document.getElementById("timestr").value, true);
	  ajax_status.send();
  }
}

//
// MJPEG
//
var mjpeg_img;
var halted = 0;
var previous_halted = 99;
var mjpeg_mode = 0;
var preview_delay = 0;
var btn_class_p = "btn btn-primary"
var btn_class_a = "btn btn-warning"

function reload_img () {
  if(!halted) mjpeg_img.src = "cam_pic.php?time=" + new Date().getTime() + "&pDelay=" + preview_delay;
  else setTimeout("reload_img()", 500);
}

function error_img () {
  setTimeout("mjpeg_img.src = 'cam_pic.php?time=' + new Date().getTime();", 100);
}

function updatePreview(cycle)
{
   if (mjpegmode)
   {
      if (cycle !== undefined && cycle == true)
      {
         mjpeg_img.src = "/updating.jpg";
         setTimeout("mjpeg_img.src = \"cam_pic_new.php?time=\" + new Date().getTime()  + \"&pDelay=\" + preview_delay;", 1000);
         return;
      }
      
      if (previous_halted != halted)
      {
         if(!halted)
         {
            mjpeg_img.src = "cam_pic_new.php?time=" + new Date().getTime() + "&pDelay=" + preview_delay;			
         }
         else
         {
            mjpeg_img.src = "/unavailable.jpg";
         }
      }
	previous_halted = halted;
   }
}

//
// Ajax Status
//
var ajax_status;

if(window.XMLHttpRequest) {
  ajax_status = new XMLHttpRequest();
}
else {
  ajax_status = new ActiveXObject("Microsoft.XMLHTTP");
}


ajax_status.onreadystatechange = function() {
  if(ajax_status.readyState == 4 && ajax_status.status == 200) {

    if(ajax_status.responseText == "ready") {
      document.getElementById("video_button").disabled = false;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {send_cmd("ca 1");};
      document.getElementById("image_button").disabled = false;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {send_cmd("im");};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl 1");};
      document.getElementById("md_button").disabled = false;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {send_cmd("md 1");};
      document.getElementById("halt_button").disabled = false;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {send_cmd("ru 0");};
      document.getElementById("preview_select").disabled = false;
      document.getElementById("video_button").className = btn_class_p;
      document.getElementById("timelapse_button").className = btn_class_p;
      document.getElementById("md_button").className = btn_class_p;
      document.getElementById("image_button").className = btn_class_p;
      halted = 0;
    }
    else if(ajax_status.responseText == "md_ready") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = false;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {send_cmd("im");};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl 1");};
      document.getElementById("md_button").disabled = false;
      document.getElementById("md_button").value = "motion detection stop";
      document.getElementById("md_button").onclick = function() {send_cmd("md 0");};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
      document.getElementById("preview_select").disabled = false;
      document.getElementById("video_button").className = btn_class_p;
      document.getElementById("timelapse_button").className = btn_class_p;
      document.getElementById("md_button").className = btn_class_a;
      document.getElementById("image_button").className = btn_class_p;
      halted = 0;
    }
    else if(ajax_status.responseText == "timelapse") {
      document.getElementById("video_button").disabled = false;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {send_cmd("ca 1");};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse stop";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl 0");};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
      document.getElementById("preview_select").disabled = false;
      document.getElementById("video_button").className = btn_class_p;
      document.getElementById("timelapse_button").className = btn_class_a;
      document.getElementById("md_button").className = btn_class_p;
      document.getElementById("image_button").className = btn_class_p;
    }
    else if(ajax_status.responseText == "tl_md_ready") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = false;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {send_cmd("im");};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse stop";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl 0");};
      document.getElementById("md_button").disabled = false;
      document.getElementById("md_button").value = "motion detection stop";
      document.getElementById("md_button").onclick = function() {send_cmd("md 0");};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
      document.getElementById("preview_select").disabled = false;
      document.getElementById("video_button").className = btn_class_p;
      document.getElementById("timelapse_button").className = btn_class_a;
      document.getElementById("md_button").className = btn_class_a;
      document.getElementById("image_button").className = btn_class_p;
      halted = 0;
    }
    else if(ajax_status.responseText == "video") {
      document.getElementById("video_button").disabled = false;
      document.getElementById("video_button").value = "record video stop";
      document.getElementById("video_button").onclick = function() {send_cmd("ca 0");};
      document.getElementById("image_button").disabled = false;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {send_cmd("im");};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl 1");};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
      document.getElementById("preview_select").disabled = true;
      document.getElementById("video_button").className = btn_class_a;
      document.getElementById("timelapse_button").className = btn_class_p;
      document.getElementById("md_button").className = btn_class_p;
      document.getElementById("image_button").className = btn_class_p;
    }
    else if(ajax_status.responseText == "md_video") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video stop";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = false;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {send_cmd("im");};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl 1");};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "recording video...";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
      document.getElementById("preview_select").disabled = true;
      document.getElementById("video_button").className = btn_class_a;
      document.getElementById("timelapse_button").className = btn_class_p;
      document.getElementById("md_button").className = btn_class_a;
      document.getElementById("image_button").className = btn_class_p;
    }
    else if(ajax_status.responseText == "tl_video") {
      document.getElementById("video_button").disabled = false;
      document.getElementById("video_button").value = "record video stop";
      document.getElementById("video_button").onclick = function() {send_cmd("ca 0");};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {send_cmd("im");};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse stop";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl 0");};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
      document.getElementById("preview_select").disabled = false;
      document.getElementById("video_button").className = btn_class_a;
      document.getElementById("timelapse_button").className = btn_class_a;
      document.getElementById("md_button").className = btn_class_p;
      document.getElementById("image_button").className = btn_class_p;
    }
    else if(ajax_status.responseText == "tl_md_video") {
      document.getElementById("video_button").disabled = false;
      document.getElementById("video_button").value = "record video stop";
      document.getElementById("video_button").onclick = function() {send_cmd("ca 0");};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = false;
      document.getElementById("timelapse_button").value = "timelapse stop";
      document.getElementById("timelapse_button").onclick = function() {send_cmd("tl 0");};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "recording video...";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
      document.getElementById("preview_select").disabled = false;
      document.getElementById("video_button").className = btn_class_a;
      document.getElementById("timelapse_button").className = btn_class_a;
      document.getElementById("md_button").className = btn_class_a;
      document.getElementById("image_button").className = btn_class_p;
    }
    else if(ajax_status.responseText == "image") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "recording image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = true;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = true;
      document.getElementById("halt_button").value = "stop camera";
      document.getElementById("halt_button").onclick = function() {};
      document.getElementById("preview_select").disabled = false;
      document.getElementById("image_button").className = btn_class_a;
    }
    else if(ajax_status.responseText == "halted") {
      document.getElementById("video_button").disabled = true;
      document.getElementById("video_button").value = "record video start";
      document.getElementById("video_button").onclick = function() {};
      document.getElementById("image_button").disabled = true;
      document.getElementById("image_button").value = "record image";
      document.getElementById("image_button").onclick = function() {};
      document.getElementById("timelapse_button").disabled = true;
      document.getElementById("timelapse_button").value = "timelapse start";
      document.getElementById("timelapse_button").onclick = function() {};
      document.getElementById("md_button").disabled = true;
      document.getElementById("md_button").value = "motion detection start";
      document.getElementById("md_button").onclick = function() {};
      document.getElementById("halt_button").disabled = false;
      document.getElementById("halt_button").value = "start camera";
      document.getElementById("halt_button").onclick = function() {send_cmd("ru 1");};
      document.getElementById("preview_select").disabled = false;
      document.getElementById("video_button").className = btn_class_p;
      document.getElementById("timelapse_button").className = btn_class_p;
      document.getElementById("md_button").className = btn_class_p;
      document.getElementById("video_button").className = btn_class_p;
      document.getElementById("timelapse_button").className = btn_class_p;
      document.getElementById("md_button").className = btn_class_p;
      document.getElementById("image_button").className = btn_class_p;
      halted = 1;
    }
    else if(ajax_status.responseText.substr(0,5) == "Error") alert("Error in RaspiMJPEG: " + ajax_status.responseText.substr(7) + "\nRestart RaspiMJPEG (./RPi_Cam_Web_Interface_Installer.sh start) or the whole RPi.");

	updatePreview();
    reload_ajax(ajax_status.responseText);

  }
}

function reload_ajax (last) {
  ajax_status.open("GET","status_mjpeg.php?last=" + last,true);
  ajax_status.send();
}

//
// Ajax Commands
//
var ajax_cmd;

if(window.XMLHttpRequest) {
  ajax_cmd = new XMLHttpRequest();
}
else {
  ajax_cmd = new ActiveXObject("Microsoft.XMLHTTP");
}

function encodeCmd(s) {
   return s.replace(/&/g,"%26").replace(/#/g,"%23").replace(/\+/g,"%2B");
}

function send_cmd (cmd) {
  ajax_cmd.open("GET","cmd_pipe.php?cmd=" + encodeCmd(cmd),true);
  ajax_cmd.send();
}

function update_preview_delay() {
   var video_fps = parseInt(document.getElementById("video_fps").value);
   var divider = parseInt(document.getElementById("divider").value);
   preview_delay = Math.floor(divider / Math.max(video_fps,1) * 1000000);
}

//
// Init
//
function init(mjpeg, video_fps, divider) {

  mjpeg_img = document.getElementById("mjpeg_dest");
  preview_delay = Math.floor(divider / Math.max(video_fps,1) * 1000000);
  if (mjpeg) {
    mjpegmode = 1;
  } else {
     mjpegmode = 0;
     mjpeg_img.onload = reload_img;
     mjpeg_img.onerror = error_img;
     reload_img();
  }
  reload_ajax("");
}
