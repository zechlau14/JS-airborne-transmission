// declare variables -- values should later come from user input form.

let time = 1; //time(h)
let delta_t = 1; //time-step (s)
let w = 8; // room width, ie. y-direction (m)
let l = 8; // room length ie. x-direction (m)
let h = 3; // room height (m)
let x_o = l/2; //x-coordinate of infectious person (m)
let y_o = w/2; //y-coordinate of infectious person (m)
let R = 0.5; //infectious particle emission rate (particles/s)
let v_x=0.15; //airflow velocity assumed in x-direction (m/s)
let v_y=0; //airflow velocity assumed in y-direction (m/s)
let d = 1.7*10**(-4); //virus deactivation rate (s^-1)
let s = 1.1*10**(-4); // particle settling rate (s^-1)
let Q = 0.72; // air exchange rate (h^-1)
Q = Q/3600; // convert Q from h^{-1} to s^{-1}
let mask_ex = 1; // mask exhalation efficiency of infectious person
let mask_in = 1; // mask inhalation efficiency of susceptible person
let frac_speak = 0.5; //fraction of time speaking
let k = 0.0069; // Infectious constant
let p = 1.3*10**(-4); // Respiration rate of susceptible person (m^3/s)
let x = x_o+2; // x-coordinate of susceptible person 1 (m)
let y = y_o; // y-coordinate of susceptible person 1 (m)
let x2 = l; // x-coordinate of susceptible person 2 (m)
let y2 = w; // y-coordinate of susceptible person 2 (m)
let delta_x = 0.1; // size of x-step (m)
let delta_y = 0.1; // size of y-step (m)

//Define time-axis from input given
//Key functions, as calling the result of t_array is required for each of the other functions
const t = t_array(time,delta_t);
//t_chart is just a conversion function to change t_array from seconds to minutes for ease of reading the chart later.
const t_chart = t_graph(t);

//Call functions to calculate Concentration at a point
let C_point = C(R,t,x,y,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak);
let C_point2 = C(R,t,x2,y2,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak);

//Call functions to calculate Probability at a point
let P_point = Prob(t,C_point,p,k,mask_in);
let P_point2 = Prob(t,C_point2,p,k,mask_in);  

//Define x,y mesh for contour plots
let xx = x_array(l, delta_x);
let yy = y_array(w, delta_y);
//Call function to calculate Concentration contour at a given time
let zz = C_contour(xx,yy,t,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak);
//Call funciton to calculate Probability contour at a given time
let zz2 = P_contour(xx,yy,t,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,p,k,mask_ex,mask_in,frac_speak);


//The following are test code to make some test plots, Not essential to the algorithm\
//You may change this as required to create better graphs
const ctx = document.getElementById("C-vs-t");
var pointA = {
    x:t_chart,
    y:C_point,
    name: `Point A (${x},${y})`
};
var pointB = {
    x:t_chart,
    y:C_point2,
    name: `Point B (${x2},${y2})`
};

Plotly.newPlot(ctx, [pointA, pointB], 
    {margin: {t:0} } 
);

const ctx2 = document.getElementById("P-vs-t");
var pointA = {
    x:t_chart,
    y:P_point,
    name: `Point A (${x},${y})`
};
var pointB = {
    x:t_chart,
    y:P_point2,
    name: `Point B (${x2},${y2})`
};
Plotly.newPlot(ctx2, [pointA, pointB], 
    {margin: {t:0} } 
);

var C_contour_data = [{
    x: xx,
    y: yy,
    z: zz,
    type: 'contour'
}];
const ctx3 = document.getElementById("C-Contour");
Plotly.newPlot(ctx3,C_contour_data,{margin: {t:0} });

var P_contour_data = [{
    x: xx,
    y: yy,
    z: zz2,
    type: 'contour'
}];
const ctx4 = document.getElementById("P-Contour");
Plotly.newPlot(ctx4,P_contour_data,{margin: {t:0} });
