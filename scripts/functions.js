//Defining Functions

function t_array(time,delta_t){
    //set up time axis (in s) -- returns an array of len(int(time*3600/delta_t))
    //its output is required in almost all following functions
    //inputs are time and delta_t from user input form
    let t_end = time * 60 * 60;
    let n_t = parseInt(t_end / delta_t);
    let t = new Array();
    for (let i=0; i<n_t; i++){
        t[i] = (i+1)*delta_t;
    }
    return t;
}

function t_graph(t){
    //returns the time axis converted to minutes: to be used as x-data for the line graphs
    //input is the result of t_array, and returns an array of equal length
    let t_chart = new Array();
    for (let i=0; i<t.length; i++){
        t_chart[i] = round(t[i]/60);
    }
    return t_chart;
}

function C(R,t,x,y,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak){
    //Calculates the concentration at (x,y)
    //Returns array of len(t), which is the y-data of the line graph for Concentration vs Time
    //Required inputs from user form: R,x,y,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak
    //Also requires t, the output from t_array
    let I = Impulse(t,x,y,x_o,y_o,l,w,v_x,v_y,Q,d,s);
    let S = Source(R,t,mask_ex,frac_speak);
    let result = convolve(I,S);
    for (let i=0; i<result.length; i++){
        result[i] = result[i] / (h/2);
        result[i] = round(result[i]);
    }
    return result;
}

function Prob(t,C,p,k,mask_in){
    //Function to calculate infection risk at (x,y)
    //returns an array of len(t), which is the y-data of the line graph for Infection Risk vs Time line graph
    //Required inputs from user form: p, k, mask_in
    //Also requires t, the output from t_array, and C, the output from function C.
    let numInt = cumtrapz(t,C);
    let prob = new Array();
    for (let i=0; i<t.length; i++){
        prob[i] = 1 - Math.exp(numInt[i]*p*mask_in*k*(-1));
    }
    return prob;
}

function x_array(l,delta_x){
    // returns x-steps for plotting of contour graphs, ie. the x-data of the contour graphs
    // returns an array of len(l / delta_x + 1)
    // Required inputs from user form: l and delta_x
    let x = new Array();
    n_x = parseInt(l / delta_x + 1);
    for (let i=0; i<n_x; i++){
        x[i] = i * delta_x;
    }
    return x;
}

function y_array(w,delta_y){
    // returns y-steps for plotting of contour graphs, ie. the y-data of the contour graphs
    // returns an array of len(w / delta_y + 1)
    // Required inputs from user form: w and delta_y
    let y = new Array();
    n_y = parseInt(w / delta_y +1);
    for (let i=0; i<n_y; i++){
        y[i] = i*delta_y;
    }
    return y;
}

function C_contour(x_array,y_array,t,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak){
    //Calculates concentration at a given time throughout the room
    //returns an Array of size (len(y) * len(x)), where C_contour[y][x] is the z-data for the Concentration contour plot at (x,y)
    //Required inputs from user form: R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak
    //Also requires t, the output from t_array, and the outputs from x_array and y_array.

    /*Algorithm: 
    1. calls yImpulse function for each y-coordinate
    2. calls xImpulse function for each x-coordinate
    3. calls sinks functions
    4. calls Source function
    4. for each (x,y), combine the results of steps 1-3 to get the impulse array
    5. for each (x,y), convolve Source array and impulse array to obtain concentration
    */
    let n_x = x_array.length;
    let n_y = y_array.length;
    let n_t = t.length;

    let I_y = new Array(n_y);
    for (let i=0; i<n_y; i++){
    I_y[i] = new Array(n_t);
    }
    var temp;
    for (let i=0; i<n_y;i++){
        temp = yImpulse(t,y_array[i],y_o,l,w,h,v_y,Q);
        for (let j=0;j<n_t;j++){
            I_y[i][j] = temp[j];
        }
    }

    let I_x = new Array(n_x);
    for (let i=0; i<n_x; i++){
    I_x[i] = new Array(n_t);
    }
    for (let i=0; i<n_x;i++){
        temp = xImpulse(t,x_array[i],x_o,l,w,h,v_x,Q);
        for (let j=0;j<n_t;j++){
            I_x[i][j] = temp[j];
        }
    }

    let sink = sinks(t,Q,s,d);

    let S = Source(R,t,mask_ex,frac_speak);

    let V = l*w*h;
    let K = 0.39*V*Q*(2*V*0.059)**(-1/3);
    let I = new Array(n_t);
    let result = new Array(n_y);
    for (let i=0; i<n_y; i++){
    result[i] = new Array(n_x);
    }
    for (let i=0;i<n_x;i++){
        for(let j=0;j<n_y;j++){
            for (let k=0;k<n_t;k++){
                I[k] = 1/(4*Math.PI*K*t[k]) * I_x[i][k] * I_y[j][k] * sink[k];
            }

            result[j][i] = last_convolve(S,I) / (h/2);
            result[j][i] = round(result[j][i]);
        }
    }

    return result;
}

function P_contour(x_array,y_array,t,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,p,r,mask_ex,mask_in,frac_speak){
    //Calculates infection risk at a given time throughout the room
    //returns an Array of size (len(y) * len(x)), where P_contour[y][x] is the z-data for the Infection risk contour graph at (x,y)
    //Required inputs from user form: R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,mask_in,frac_speak
    //Also requires t, the output from t_array, and the outputs from x_array and y_array.    
    
    /*Algorithm: 
    1. calls yImpulse function for each y-coordinate
    2. calls xImpulse function for each x-coordinate
    3. calls sinks functions
    4. calls Source function
    4. for each (x,y), combine the results of steps 1-3 to get the impulse array
    5. for each (x,y), convolve Source array and impulse array to obtain concentration array
    6. for each (x,y), perform numerical integration to find risk
    */
    let n_x = x_array.length;
    let n_y = y_array.length;
    let n_t = t.length;

    let I_y = new Array(n_y);
    for (let i=0; i<n_y; i++){
    I_y[i] = new Array(n_t);
    }
    var temp;
    for (let i=0; i<n_y;i++){
        temp = yImpulse(t,y_array[i],y_o,l,w,h,v_y,Q);
        for (let j=0;j<n_t;j++){
            I_y[i][j] = temp[j];
        }
    }

    let I_x = new Array(n_x);
    for (let i=0; i<n_x; i++){
    I_x[i] = new Array(n_t);
    }
    for (let i=0; i<n_x;i++){
        temp = xImpulse(t,x_array[i],x_o,l,w,h,v_x,Q);
        for (let j=0;j<n_t;j++){
            I_x[i][j] = temp[j];
        }
    }

    let sink = sinks(t,Q,s,d);

    let S = Source(R,t,mask_ex,frac_speak);

    let V = l*w*h;
    let K = 0.39*V*Q*(2*V*0.059)**(-1/3);
    let I = new Array(n_t);
    let temp2 = new Array(n_t);

    let result = new Array(n_y);
    for (let i=0; i<n_y; i++){
    result[i] = new Array(n_x);
    }
    for (let i=0;i<n_x;i++){
        for(let j=0;j<n_y;j++){
            for (let k=0;k<n_t;k++){
                I[k] = 1/(4*Math.PI*K*t[k]) * I_x[i][k] * I_y[j][k] * sink[k];
            }
            temp2 = convolve(S,I);
            console.log(`calc C of (${x_array[i]},${y_array[j]})`);
            result[j][i] = 1 - Math.exp((-1)*p*mask_in*r/(h/2)*trapz(t,temp2));
            console.log(`calc P of (${x_array[i]},${y_array[j]})`);
        }
    }

    return result;
}


//From this point are functions defined for the model's algorithms, to be internally called by the functions defined above
//The following should not be called directly by the website.

function Source(R,t,mask_ex,frac_speak){
    // Define Source Function (returns array of len(t))
    // Required input 
    let n_t = t.length;
    let delta_t = t[1] - t[0];
    let S = new Array();
    for (let i=0; i<n_t; i++){
        S[i] = mask_ex*(R*(1-frac_speak)+10*R*frac_speak) * delta_t;
    }
    return S;
}

function xImpulse(t,x,x_o,l,w,h,v,Q){
    // Define xImpulse Function (returns array of len(t))
    // I_x = Sum_{n= -\infty}^{\infty} ( exp(-(x-x_0-vt-2nl)^2/(4Kt)) + exp(-(x+x_0+vt-2nl)^2/(4Kt)) )
    let time = t[t.length-1] / 3600;
    let m = parseInt(v*3600/(2*l)*time);
    m = Math.max(m,4);
    let V = l*w*h;
    let K = 0.39*V*Q*(2*V*0.059)**(-1/3);
    let n_t = t.length;

    let I_x = new Array();
    for (let i=0; i<n_t; i++){
        I_x[i] = Math.exp((-1)*(x-x_o-v*t[i])**2 /(4*K*t[i])) + Math.exp((-1)*(x+x_o+v*t[i])**2 / (4*K*t[i]));
        for (let j=1; j<m+1; j++){
            I_x[i] = I_x[i] + Math.exp((-1)*(x-x_o-v*t[i]-2*j*l)**2 / (4*K*t[i])) + Math.exp((-1)*(x+x_o+v*t[i]-2*j*l)**2 / (4*K*t[i]));
            I_x[i] = I_x[i] + Math.exp((-1)*(x-x_o-v*t[i]+2*j*l)**2 / (4*K*t[i])) + Math.exp((-1)*(x+x_o+v*t[i]+2*j*l)**2 / (4*K*t[i]));
        }
    }
    return I_x;
}

function yImpulse(t,y,y_o,l,w,h,v,Q){
    // Define yImpulse Function (returns array of len(t))
    // I_y = Sum_{n= -\infty}^{\infty} ( exp(-(y-y_0-2nw)^2/(4Kt)) + exp(-(y+y_0-2nw)^2/(4Kt)) )
    let V = l*w*h;
    let K = 0.39*V*Q*(2*V*0.059)**(-1/3);
    let n_t = t.length;
    let time = t[t.length-1] / 3600;
    let m = parseInt(v*3600/(2*w)*time);
    m = Math.max(m,4);

    let I_y = new Array();
    for (let i=0; i<n_t; i++){
        I_y[i] = Math.exp((-1)*(y-y_o-v*t[i])**2 / (4*K*t[i])) + Math.exp((-1)*(y+y_o+v*t[i])**2 / (4*K*t[i]));
        for (let j=1; j<m+1;j++){
            I_y[i] = I_y[i] + Math.exp((-1)*(y-y_o-v*t[i]-2*j*w)**2 / (4*K*t[i])) + Math.exp((-1)*(y+y_o+v*t[i]-2*j*w)**2 / (4*K*t[i]));
            I_y[i] = I_y[i] + Math.exp((-1)*(y-y_o-v*t[i]+2*j*w)**2 / (4*K*t[i])) + Math.exp((-1)*(y+y_o+v*t[i]+2*j*w)**2 / (4*K*t[i]));
        }
    }
    return I_y;
}

function sinks(t,Q,s,d){
    // Define sink Function (returns array of len(t))
    // sink = exp(-(Q+d+s)t)
    let n_t = t.length;
    let result = new Array();

    for (let i=0; i<n_t; i++){
        result[i] = Math.exp( (-1)*t[i]*(Q+s+d) );
    }
    return result;
}

function Impulse(t,x,y,x_o,y_o,l,w,v_x,v_y,Q,d,s){
    //Define Impulse function
    let time = t[t.length-1] / 3600;
    let m_x = parseInt(v_x*3600/(2*l)*time);
    m_x = Math.max(m_x,4);
    let m_y = parseInt(v_y*3600/(2*w)*time);
    m_y = Math.max(m_y,4);
    let V = l*w*h;
    let K = 0.39*V*Q*(2*V*0.059)**(-1/3);
    let n_t = t.length;

    let I_y = new Array();
    let I_x = new Array();
    let sink = sinks(t,Q,d,s);
    for (let i=0; i<n_t; i++){
        I_y[i] = Math.exp((-1)*(y-y_o-v_y*t[i])**2 / (4*K*t[i])) + Math.exp((-1)*(y+y_o+v_y*t[i])**2 / (4*K*t[i]));
        for (let j=1; j<m_y+1;j++){
            I_y[i] = I_y[i] + Math.exp((-1)*(y-y_o-v_y*t[i]-2*j*w)**2 / (4*K*t[i])) + Math.exp((-1)*(y+y_o+v_y*t[i]-2*j*w)**2 / (4*K*t[i]));
            I_y[i] = I_y[i] + Math.exp((-1)*(y-y_o-v_y*t[i]+2*j*w)**2 / (4*K*t[i])) + Math.exp((-1)*(y+y_o+v_y*t[i]+2*j*w)**2 / (4*K*t[i]));
        }
        I_x[i] = Math.exp((-1)*(x-x_o-v_x*t[i])**2 /(4*K*t[i])) + Math.exp((-1)*(x+x_o+v_x*t[i])**2 / (4*K*t[i]));
        for (let j=1; j<m_x+1; j++){
            I_x[i] = I_x[i] + Math.exp((-1)*(x-x_o-v_x*t[i]-2*j*l)**2 / (4*K*t[i])) + Math.exp((-1)*(x+x_o+v_x*t[i]-2*j*l)**2 / (4*K*t[i]));
            I_x[i] = I_x[i] + Math.exp((-1)*(x-x_o-v_x*t[i]+2*j*l)**2 / (4*K*t[i])) + Math.exp((-1)*(x+x_o+v_x*t[i]+2*j*l)**2 / (4*K*t[i]));
        }
    }

    let I = new Array();
    for (let i=0;i<n_t;i++){
        I[i] = I_y[i] * I_x[i] * sink[i] / (4*Math.PI*K*t[i]);
    }

    return I;
}

function convolve(A,B){
    //define convolution function used. previously had used scipy.signal.convolve
    //returns array of len(A)
    //Conv = Sum_{n=0}^i (A[i-n] * B[B.length-1-n])
    if (A.length === B.length){
    let result = new Array();
        for (let i=0; i<A.length; i++){
            result[i] = 0;
            for (let j=0; j<=i; j++){
                result[i] = result[i] + A [i-j] * B[B.length-1-j];
            }
        }
    return result;
    } else{return console.log("convolution error!");}
}

function last_convolve(A,B){
    //define convolution function used. previously had used scipy.signal.convolve
    //returns float
    //Conv = Sum_{n=0}^i (A[i-n] * B[B.length-1-n])
    if (A.length === B.length){
        let result=0;            
            for (let j=0; j<A.length; j++){
                result = result + A [j] * B[B.length-1-j];
            }
        return result;
        } else{return console.log("convolution error!");}
}

function round(num){
    // Function to round answer to 2d.p. (returns float)
    var m = Number((Math.abs(num) * 100).toPrecision(15));
    return Math.round(m) / 100 * Math.sign(num);
}

function cumtrapz(t,C){
    //Function for trapezium method of numerical integration
    //returns an array of len(t)
    let delta_t = t[2] - t[1];
    let result = new Array();
    result[0] = 0;
    for (let i=1; i<t.length; i++){
        result[i] = result[i-1] + 0.5*(C[i-1]+C[i])*delta_t;
    }        
    return result;
}

function trapz(t,C){
    //Function for trapezium method of numerical integration
    //returns a float
    let delta_t = t[2] - t[1];
    let result = 0;
    for (let i=1; i<t.length; i++){
        result = result + 0.5*(C[i-1]+C[i])*delta_t;
    }        
    return result;
}