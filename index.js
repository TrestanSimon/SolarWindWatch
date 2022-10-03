// https://2022.spaceappschallenge.org/challenges/2022-challenges/creative-data-display/teams/coronal-mass-affection/project
// https://www.swpc.noaa.gov/products/real-time-solar-wind
// https://www.spaceweatherlive.com/en/auroral-activity.html
// TODO:
// Improve magnetosphere
// Have particles tend toward magnetotail
// 

$(document).ready(function() {
  var div = document.createElement('div'),
  canvas = document.getElementById('space'),
  ctx = canvas.getContext('2d'),
  canvas_text = document.getElementById('text'),
  canvas_speed = document.getElementById('canvas speed'),
  canvas_density = document.getElementById('canvas density'),
  ctxt = canvas_text.getContext('2d'),
  w,
  h,
  earth_r,
  bow_x,
  bow_y,
  plasma_t,
  plasma_rho,
  plasma_speed,
  plasma_temp,
  wind_speed,
  wind_rho = 1000,
  wind_color,
  get_timer,
  wind_arr = [50]

  // initialize
  function init() {

    get_timer = 60000.0;
    
    UpdateData();

    UpdatePosition();
    create_wind();

    // 1 frame every 30ms
    if (typeof game_loop != "undefined") clearInterval(game_loop);
    game_loop = setInterval(mainLoop, 30);
  }
  init();

  function create_wind() {
    var len = wind_rho;
    wind_arr = []; // Empty array to start with
    for (var i = len - 1; i >= 0; i--) {
      wind_arr.push({
        x: 0,
        y: 1,
        z: 0
      });
    }

    for (var j = 0; j < wind_rho; j++) {
      wind_arr[j].x = Math.floor(Math.random() * w);
      wind_arr[j].y = Math.floor(Math.random() * h);
      wind_arr[j].z = Math.random();
    }
  }

  function mainLoop() {
    UpdatePosition();

    // Timer for updating data
    if (get_timer < 0.0) {
      get_timer = 60000.0;
      UpdateData();
    } else {
      get_timer -= 30.0;
    }

    // Background
    var bg = "#050505"
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,w,h);

    // Bow Shock
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = w/200;
    ctx.ellipse(w, h/2, bow_x, bow_y, 0, 0, 2*Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();

    // Earth
    var earth_grd = ctx.createLinearGradient(Math.floor(w/2 - earth_r), 0, w/2 + earth_r, 0);
    earth_grd.addColorStop(0, "blue");
    earth_grd.addColorStop(0.6, "#000040");
    ctx.fillStyle = earth_grd;
    ctx.arc(w/2, h/2, earth_r, 0, 2*Math.PI);
    ctx.fill();

    wind();

    // Text (to do: switch to <p>)
    ctxt.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctxt.font = '60px Sans-Serif';

    ctxt.font = '30px Sans-Serif';
    
    ctxt.fillText("Density:", w/2 - 240, h - 300);
    ctxt.fillText(plasma_rho + " p/cm³", w/2 - 240, h - 260);
    
    ctxt.fillText("Speed:", w/2 + 160, h - 300);
    ctxt.fillText(plasma_speed + " km/s", w/2 + 160, h - 260);
    
    // ctx.fillText("Temp: " + plasma_temp + " K", 50, h - 50);

    ctxt.font = '15px Sans-Serif';
    ctxt.fillText("Last update: " + plasma_t + " UT", w - 300, h - 15);
  }

  // Update data
  function UpdateData() {
    var plasmaAPI = "https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json";
    $.getJSON(plasmaAPI, function(data) {
      plasma_t = data[data.length - 1][0];
      plasma_rho = data[data.length-1][1];
      plasma_speed = data[data.length - 1][2];
      plasma_temp = data[data.length - 1][3];

      wind_rho = Math.max(30, 400 + Math.floor(400 * Math.log10(plasma_rho + 1)) / (w/1000));
      wind_speed = 20 * (plasma_speed - 200)/600 * (w/2000);

      CreateGauge();
    });
  }

  function CreateGauge() {
    // Speed gauge:
    var opts_speed = {
      angle: -0.25,
      lineWidth: 0.2,
      fontColor: '#AAAAAA',
      pointer: {
        length: 0.6,
        strokeWidth: 0.05,
        color: '#808080'
      },
      staticLabels: {
        font: "12px sans-serif",
        labels: [200, 400, 700, 500, 900, 1000],
        color: "#FFFFFF",
      },
      staticZones: [
         {strokeStyle: "#30B32D", min: 200, max: 400},
         {strokeStyle: "#FFDD00", min: 400, max: 500},
         {strokeStyle: "#FFA500", min: 500, max: 700},
         {strokeStyle: "#FF0000", min: 700, max: 900},
         {strokeStyle: "#CC0000", min: 900, max: 1000}
      ],
      limitMax: true,
      limitMin: true,
      strokeColor: '#E0E0E0',
      highDpiSupport: true
    };
    var gauge_speed = new Gauge(canvas_speed).setOptions(opts_speed);
    gauge_speed.maxValue = 1000;
    gauge_speed.setMinValue(200);
    gauge_speed.animationSpeed = 32;
    gauge_speed.set(plasma_speed);

    // Density guage:
    var opts_density = {
      angle: -0.25,
      lineWidth: 0.2,
      fontColor: '#AAAAAA',
      pointer: {
        length: 0.6,
        strokeWidth: 0.05,
        color: '#808080'
      },
      staticLabels: {
        font: "12px sans-serif",
        labels: [0, 10, 20, 40, 60, 100],
        color: "#FFFFFF",
      },
      staticZones: [
         {strokeStyle: "#30B32D", min: 0, max: 10},
         {strokeStyle: "#FFDD00", min: 10, max: 20},
         {strokeStyle: "#FFA500", min: 20, max: 40},
         {strokeStyle: "#FF0000", min: 40, max: 60},
         {strokeStyle: "#CC0000", min: 60, max: 100}
      ],
      limitMax: true,
      limitMin: true,
      strokeColor: '#E0E0E0',
      highDpiSupport: true
    };
    var gauge_density = new Gauge(canvas_density).setOptions(opts_density);
    gauge_density.maxValue = 100;
    gauge_density.setMinValue(0);
    gauge_density.animationSpeed = 32;
    gauge_density.set(plasma_rho);
  }

  function UpdateGauge() {
    gauge_speed.set(plasma_speed); // set actual value
  }
  
  // Update Position
  function UpdatePosition () {
    w = canvas.width = Math.max(wind_rho, innerWidth);
    h = canvas.height = Math.max(wind_rho, innerHeight);

    canvas_text.width = w;
    canvas_text.height = h;

    earth_r = w/80,
    bow_x = 3*w/4,
    bow_y = w/2,

    canvas_speed.style.left = w/2 + 200 - 200 + "px";
    canvas_speed.style.top = h - 250 + "px";
    canvas_density.style.left = w/2 - 200 - 200 + "px";
    canvas_density.style.top = h - 250 + "px";
  }

  // Individual particles
  function wind() {
    for (var i = 0; i < wind_rho; i++) {
      var speed = wind_speed + (wind_speed/10 * wind_arr[i].z);
      // var speed = wind_speed * (wind_arr[i].w+1);
      var dx = w/2 - wind_arr[i].x;
      var dy = h/2 - wind_arr[i].y;
      var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      var bowx = w - wind_arr[i].x;
      var bowy_speed = Math.sign(dy) * (Math.pow(bowx/bow_x, 2) + Math.pow(dy/bow_y, 2)) * speed / (dr/(w/8));

      if (wind_arr[i].x >= w) {
        wind_arr[i].x = 0;
        wind_arr[i].y = Math.floor(Math.random() * h);
      }

      if (wind_arr[i].y >= h) {
        wind_arr[i].x = 0;
        wind_arr[i].y = Math.floor(Math.random() * h);
      } else if (dr <= w/6) {
        if (dr < earth_r) { // Reset when hits Earth
          wind_arr[i].x = 0;
          wind_arr[i].y = Math.floor(Math.random() * h);
        } else { // Funnel
          wind_arr[i].x += Math.sign(dx) * speed * dx/(w/10);
          wind_arr[i].y += bowy_speed * Math.abs(dy)/(w/6)  - Math.sign(dy) * speed * Math.abs(dy)/w;
        }
      } else if (Math.pow(bowx/bow_x, 2) + Math.pow(dy/bow_y, 2) <= 1) {
        // Bowshock effect
        wind_arr[i].y -= bowy_speed;
        wind_arr[i].x += speed;
      } else {
        wind_arr[i].x += speed;
      }

      wind_color = Math.min(255, 60 + 195 * (Math.log10(plasma_temp)-4)/2);
      if (wind_color == NaN) {
        wind_color = "Blue";
      }
      ctx.fillStyle = "rgb(" + wind_color + "," + wind_color + "," + wind_color + ")";
      ctx.fillRect(wind_arr[i].x, wind_arr[i].y, 2, 2);
    }
  }
})
