//ALGORITHM FOR BUILDING AND RETURNING STATION LISTS
//class to hold the start and end route stations
class route{
    constructor(){
        this.start_stn_name = '',
        this.start_line_i = '', 
        this.start_stn_i = '', 
        this.start_line_inter_i = '',
        this.start_line_plus = '',
        this.end_stn_name = '',
        this.end_line_i = '', 
        this.end_stn_i = '', 
        this.end_line_inter_i = '',
        this.end_line_plus = '',
        this.route_connector = " --> ",
        this.route = '',
        this.wayPts=[],
        this.switch_lines = ''
        this.interconnect = 'Richmond'
    }
}
let trip = ''

//name = string, stations = []
class line {
    constructor(name, stations){
        this.line_name = name,
        this.stations = stations
    }
}

//build network
let network = []
network.push(new line ('alamein',[
  {name:'Flinders Street', latLng:{lat:-37.8181354740904, lng:144.96706179815612}},
  {name:'Richmond', latLng:{lat:-37.82360061170248, lng:144.98919822699185}},
  {name:'East Richmond', latLng:{lat:-37.826342140223495, lng:144.99726690060592}},
  {name:'Burnley', latLng:{lat:-37.82765411232484, lng:145.007733766259}},
  {name:'Hawthorn', latLng:{lat:-37.82128493600619, lng:145.02457456809626}},
  {name:'Glenferrie', latLng:{lat:-37.82146501757419, lng:145.03645895581136}}
  ]));
network.push(new line ('glen_waverly',[
  {name:'Flagstaff', latLng:{lat:-37.8120434751738, lng:144.9560195828145}},
  {name:'Melbourne Central', latLng:{lat:-37.81040631759949, lng:144.96291170493143}},
  {name:'Parliament', latLng:{lat:-37.81028705096947, lng:144.97286077791554}},
  {name:'Richmond', latLng:{lat:-37.82360061170248, lng:144.98919822699185}},
  {name:'Kooyong', latLng:{lat:-37.83986543517936, lng:145.03294822699218}},
  {name:'Tooronga', latLng:{lat:-37.84940041575873, lng:145.0415879791411}}
]));
network.push(new line ('sandringham',[
  {name:'Southern Cross', latLng:{lat:-37.81834001342736, lng:144.95248577791554}},
  {name:'Richmond', latLng:{lat:-37.82360061170248, lng:144.98919822699185}},
  {name:'South Yarra', latLng: {lat:-37.83891067907375, lng:144.99218031541324}},
  {name:'Prahran', latLng:{lat:-37.85138538762354, lng:144.98926588168288}},
  {name:'Windsor', latLng:{lat:-37.85600106493203, lng:144.9917561717712}},
  {name:'Balaclava', latLng:{lat:-37.8693704134397, lng:144.99364491080965}},
  {name:'Ripponlea', latLng:{lat:-37.87556134001444, lng:144.99513621893163}},
  {name:'Elsternwick', latLng:{lat:-37.88403402141081, lng:145.0006236075728}}

]));

//pass in station objects and this updates the route object.  It also passes back true/false if it had issues finding the terminal station names
function find_stations(start_stn_name, dest_stn_name){
    trip = new route();
    trip.start_stn_name = start_stn_name;
    trip.end_stn_name = dest_stn_name;
    no_issues_origin = false;
    no_issues_dest = false;


    //find the origin station and line details
  let i;
  network.forEach((line, line_index) => {
    line.stations.forEach((station, station_index) => {
      (i = station.name.indexOf(start_stn_name))!= -1 && start_stn_name !=''? 
            (trip.start_line_i = line_index, 
            trip.start_stn_i = station_index,
            trip.start_line_plus = station.latLng,
            trip.start_line_inter_i = line.stations.findIndex(function(station){
              return station.name == trip.interconnect
            }),
            
            no_issues_origin = true
            )
            : 'missed at least once'
    })
  });

    //find the destination station and line details
    network.forEach((line, line_index) => {
      line.stations.forEach((station, station_index) => {
        (i = station.name.indexOf(dest_stn_name))!= -1 && dest_stn_name !=''? 
              (trip.end_line_i = line_index, 
              trip.end_stn_i = station_index,
              trip.end_line_plus = station.latLng,
              trip.end_line_inter_i = line.stations.findIndex(function(station){
                return station.name == trip.interconnect
              }),
              
              no_issues_dest = true
              )
              : 'missed at least once'
      })
    });
    
    trip.start_line_i == trip.end_line_i ? trip.switch_lines = false : trip.switch_lines = true
    return no_issues_dest && no_issues_dest ? true : false
}

//fetch the names of the station and handle reverse order
function fetch_station_names(line, start_station, end_station){
  let station_arr = [];
  
  line.stations.forEach(station=> {
    station_arr.push(station.name);
    trip.wayPts.push({location:station.latLng, stopover:false});
  });
  //handle station locations same as names - this can be cleaned up! its an after thought - DT suggested showing stations between so implementing as good idea :)
  trip.wayPts = start_station > end_station ? (trip.wayPts.slice(end_station, start_station+1)).reverse() : (trip.wayPts.slice(start_station,end_station+1));
  return start_station > end_station ? (station_arr.slice(end_station, start_station+1)).reverse() : (station_arr.slice(start_station,end_station+1))
}

//build the route as an array so it can easily be used for DOM manipulation
function build_route(){
  //empty waypoints value
  trip.wayPts = [];
  console.log('build_route');
    //single line trip
    if (!trip.switch_lines){
        trip.route = fetch_station_names(network[trip.start_line_i], trip.start_stn_i, trip.end_stn_i);
        printToConsole();
        printToDom(true); 
    } else {
        //crosses two lines
        trip.route = fetch_station_names(network[trip.start_line_i], trip.start_stn_i, trip.start_line_inter_i);
        //remove richmond as the second half of the journey ALSO has richmond/interconnecting station name
        trip.route.pop();
        trip.route = trip.route.concat(fetch_station_names(network[trip.end_line_i], trip.end_line_inter_i, trip.end_stn_i));
        printToConsole();
        printToDom(true); 
    }  
};

function printToConsole() {
let line_1_string;
    
    if(!trip.switch_lines){
      console.log(trip.route.join(trip.route_connector))
    } else {
      //print the first line up to the interconnect station with route connector arrows and stick that all in a strin
      console.log(line_1_string = fetch_station_names(network[trip.start_line_i], trip.start_stn_i, trip.start_line_inter_i).join(trip.route_connector))
      //use the string length to work out how many spaces needed 
      console.log(" ".repeat(line_1_string.length - 5) + "||")
      console.log(" ".repeat(line_1_string.length - 8) + 
      fetch_station_names(network[trip.end_line_i], trip.end_line_inter_i, trip.end_stn_i).join(trip.route_connector))
    } 
}

function printToDom(printRoute){
    document.getElementById('stationList').innerHTML = '';
    //this is verbose code for testing, can clean up later.  ALSO connect the tag divs using an SVG line - currently using element borders in CSS
    if(printRoute){
        trip.route.forEach((station, i) => {
          if(i==0 ){
            document.getElementById('stationList').innerHTML += `<div class='station-name'><div class='tag'>A</div>${station}</div>`
          } else if (i==trip.route.length-1) {
            document.getElementById('stationList').innerHTML += `<div class='station-name'><div class='tag'>B</div>${station}</div>`
          }
          else {
            document.getElementById('stationList').innerHTML += `<div class='station-name'><div></div>${station}</div>`
          }
        })
    }
 

    //pop and shift the first and last wayPt values as these are the origin and destinations
    trip.wayPts.pop();
    trip.wayPts.shift();

    //pass in waypts
    calcRoute(trip.start_line_plus, trip.end_line_plus, trip.wayPts);
}

//AUTOCOMPLETE ON INPUT FORMS
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
        var pos = arr[i].toUpperCase().indexOf(val.toUpperCase());
          /*check if the item starts with the same letters as the text field value:*/
          if (pos > -1) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = arr[i].substr(0, pos);
            b.innerHTML += "<strong>" + arr[i].substr(pos, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(pos + val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;

                
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keyup", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) {
                x[currentFocus].click();
            }
          }
        }
    });

    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
          if(document.getElementById('originInput').value != null && document.getElementById('destInput').value != null){
            userSelections();
          }
        }
      }
      
 
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });

  }
  let userSelectionCalls = 0
  function userSelections(){
    userSelectionCalls++;
    let originSelect = document.getElementById('originInput').value;
    let destinationSelect = document.getElementById('destInput').value;
    
    //if it finds stations and there's no problems
    if(find_stations(originSelect, destinationSelect)){        
        build_route();
    }
  }

const userInputOrigin = document.getElementById("originInput");
const userInputDest = document.getElementById("destInput");

/*An array containing all the country names in the world:*/
var stationList = [];
network.forEach(line => {
    line.stations.forEach(station => {
      stationList.push(station.name)         
    })
  });

//thanks to Nour Saud for this code - Bubbly Button
var animateButton = function(e) {
  e.preventDefault;
  //strip the list of stations from the DOM
  document.querySelectorAll('.station-name').forEach(function(a){
    a.remove()
  });
  //reset the inputs
  document.getElementById('destInput').value = '';
  document.getElementById('originInput').value = '';
  //re-initialise the map
  initialize();
  //reset animation
  e.target.classList.remove('animate');
  e.target.classList.add('animate');

  setTimeout(function(){
    e.target.classList.remove('animate');
  },900);
};

var bubblyButtons = document.getElementsByClassName("bubbly-button");

for (var i = 0; i < bubblyButtons.length; i++) {
  bubblyButtons[i].addEventListener('click', animateButton, false);
}

/*initiate the autocomplete function on the "originInput" element, and pass along the stations array as possible autocomplete values:*/
autocomplete(userInputOrigin, stationList);
autocomplete(userInputDest, stationList);