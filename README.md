# JS-airborne-transmission
The airborne transmission model -- coded in Javascript


index.html -- This is a very bare skeleton of elements that we'll require on the website. The model is called using script/main.js.

script/functions.js -- This contains all the definitions of functions that run the model.

script/main.js  
This has a list of parameters that are the inputs to the model. These need to be converted to be pulled from the user-input form. 
Then the script calls the functions of the model with those inputs. The following are the major functions:
t_array() -- returns an array for the time axis for the other functions.
t_graph() -- returns an array with the x-data for the line charts.
C() -- returns an array of the concentration, ie. the y-data for the concentration line charts.
Prob() -- returns an array of the infection risk, ie. the y-data for the infection risk line charts.
x_array() and y_array() -- returns arrays for the x-data and y-data for the contour charts.
C_contour() -- returns an array for the z-data for the Concentration contour charts.
P_contour() -- returns an array for the z-data for the Infection risk contour charts.
