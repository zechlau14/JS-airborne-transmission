function graph_choice(){
    //check result of toggle switch "contour-or-point"
    //if box is checked show inputs for coordinates; else hide

    var checkBox = document.getElementById("contour-or-point");
    var coord_input = document.getElementById("coord-eval");

    if(checkBox.checked == false){
        coord_input.style.display='none';
    } else{
        coord_input.style.display='block';
    }
}

function model_choice(){
    //check the toggle switch for risk or concentration
    //show the button that runs the correct function.
    var checkBox = document.getElementById("risk-or-conc");
    var risk_button = document.getElementById("run-risk");
    var conc_button = document.getElementById("run-conc");

    if(checkBox.checked == false){
        conc_button.style.display='none';
        risk_button.style.display='block';
    } else{
        risk_button.style.display='none';
        conc_button.style.display='block';
    }
}

function add_break(){
    //check the checkbox for adding a break
    //if checked, show the inputs for a break.
    var checkBox = document.getElementById("break");
    var break_input = document.getElementById("break-time");
    var break_when = document.getElementById("break-when");

    if(checkBox.checked == false){
        break_input.style.display='none';
        break_when.style.display='none';
    }  else{
        break_input.style.display='block';
        break_when.style.display='block';
    }
}

function advanced_options(){
    //function for advanced options button
    //when button is pressed, show the advanced-options inputs
    var checkBox = document.getElementById("advanced-options");
    if(checkBox.style.display == "none"){
        checkBox.style.display = "block";
    } else{
        checkBox.style.display = "none";
    }
}

//variables
const delta_x = 0.1;
const delta_y = 0.1;
const s = 3.397*10**(-5);
const delta_t = 1;

function run_risk(){
    //erase the results from previous runs of the model
    const chart = document.getElementById("result");
    chart.innerHTML="";
    const avg_print = document.getElementById("avg");
    avg_print.innerHTML="";
    const inf_print = document.getElementById("infected");
    inf_print.innerHTML="";

    //Show the "loading" image in the output section.
    const output = document.getElementById("output");
    output.style.display='block';
    $("#loading").show();
    setTimeout(function(){
    //reads all the inputs from the page.
    var l = document.getElementById("room-length").value;
    l = parseFloat(l);    
    var w = document.getElementById("room-width").value;
    w = parseFloat(w);    
    var h = document.getElementById("room-height").value;
    h = parseFloat(h);    
    var Q_c = document.getElementById("vent-custom").value;
    if(Q_c>0){
        var Q = parseFloat(Q_c);
    }else{
        var Q = document.getElementById("vent").value;
        Q = parseFloat(Q); 
    }
    var v_c = document.getElementById("airflow-custom").value;
    if(v_c>0){
        var v = parseFloat(v_c);
    }else{
        var v = document.getElementById("airflow").value;
        v = parseFloat(v);    
    }     
    var v_dir = document.getElementById("airflow-dir").value;
    var v_x = 0; var v_y = 0;
    if (v_dir == "0"){v_x = v;}
    if (v_dir == "1"){v_x = -v;}
    if (v_dir == "2"){v_y = v;}
    if (v_dir == "3"){v_y = -v;}
    var time = document.getElementById("duration").value;
    time = parseFloat(time);    
    var p_c = document.getElementById("occ-act-custom").value;
    if(p_c>0){
        var p = parseFloat(p_c);
    }else{
        var p = document.getElementById("occ-act").value;
        p = parseFloat(p);  
    }     
    var mask_in_c = document.getElementById("occ-mask-custom").value;
    if(mask_in_c>0){
        var mask_in = parseFloat(mask_in_c) / 100;
    }else{
        var mask_in = document.getElementById("occ-mask").value;
        mask_in = parseFloat(mask_in);
    }     
    var x_o = document.getElementById("x0").value;
    x_o = parseFloat(x_o);
    var y_o = document.getElementById("y0").value;
    y_o = parseFloat(y_o);
    var mask_ex_c = document.getElementById("inf-mask-custom").value;
    if(mask_ex_c>0){
        var mask_ex = parseFloat(mask_ex_c) / 100;
    }else{
        var mask_ex = document.getElementById("inf-mask").value;
        mask_ex = parseFloat(mask_ex);
    }     
    var frac_speak = document.getElementById("talk").value;
    frac_speak = parseFloat(frac_speak);
    frac_speak = frac_speak*0.01;
    var R_c = document.getElementById("viral-load-custom").value;
    if(R_c>0){
        var R = Math.log(parseFloat(R_c)) / Math.log(10);
    }else{
        var R = document.getElementById("viral-load").value;
        R = parseFloat(R);
    }     
    var d = document.getElementById("deact").value;
    d = parseFloat(d);
    var r = document.getElementById("transmissibility").value;
    r = parseFloat(r)/100;

    var checkBox = document.getElementById("contour-or-point");
    var breakBox = document.getElementById("break");

    if(checkBox.checked == false){
        //if toggle button for whole room is chosen
        //calculate x and y coordinates for the graph.
        var xx = x_array(l,delta_x);
        var yy = y_array(w,delta_y);

        if(breakBox.checked == false){
            //if no break is selected, run P_contour function
            var zz = P_contour(time,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,p,r,mask_ex,mask_in,frac_speak,delta_t,delta_x,delta_y);
        } else{
            //if a break is selected, obtain those parameters, then run P_break_contour function
            var time_break = document.getElementById("break-duration").value;
            time_break = parseFloat(time_break);
            var time2 = document.getElementById("break-start").value;
            time2 = parseFloat(time2);
            var time_cont = time - time2;
            var zz = P_break_contour(time_break,time_cont,time2,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,p,r,mask_ex,mask_in,frac_speak,delta_t,delta_x,delta_y);
        }

        //Plot results
        var datapt = [{
            x: xx,
            y: yy,
            z: zz,
            type: 'contour'
        }];
        Plotly.newPlot(chart,datapt,{margin:{t:0}});
        
        //run avg function then print average probability
        //and translate it to a figure given the number of occupants
        var P_avg = avg(zz,l,w,delta_x,delta_y);
        P_avg = P_avg*100;
        avg_print.innerHTML = "<p> Average infection risk from airborne transmission in the room is " + P_avg + "%. </p>";
        inf_print.innerHTML = "<p> ie. <output>" + P_avg + "</output> out of <input type='number' value='100' min='0' step='1' style='width:45px' oninput='this.previousElementSibling.value = this.value/100*" + P_avg+"'> </input> people in the room will likely be infected.</p>";
    } else{
        //toggle button chooses evaluate at a specific location, so read the coordinates of the location
        var x_e = document.getElementById("x_e").value;
        x_e = parseFloat(x_e);
        var y_e = document.getElementById("y_e").value;
        y_e = parseFloat(y_e);

        if(breakBox.checked == false){
            //if no break is chosen, run Prob function.
            var t_chart = t_graph(time,delta_t);
            var zz = Prob(R,time,x_e,y_e,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,p,r,mask_in);
        } else{
            //if add_break is chosen, get break parameters and run Prob_break function.
            var time_break = document.getElementById("break-duration").value;
            time_break = parseFloat(time_break);
            var time2 = document.getElementById("break-start").value;
            time2 = parseFloat(time2);
            var time_cont = time - time2;
            var t_chart = t_graph(time+time_break,delta_t);
            var zz = Prob_break(time_break,time_cont,R,time2,x_e,y_e,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,p,r,mask_in);
        }
        
        //plot graph
        var datapt = [{
            x: t_chart,
            y: zz
        }];
        Plotly.newPlot(chart,datapt,{margin:{t:0}});
    }

        $("#loading").hide();
    },1);
    
}

function run_conc(){
    //erase the results from previous runs of the model
    const chart = document.getElementById("result");
    chart.innerHTML="";
    const avg_print = document.getElementById("avg");
    avg_print.innerHTML="";
    const inf_print = document.getElementById("infected");
    inf_print.innerHTML="";

    //show loading screen in output div
    const output = document.getElementById("output");
    output.style.display='block';
    $("#loading").show();

    setTimeout(function(){
    //read parameter inputs
    var l = document.getElementById("room-length").value;
    l = parseFloat(l);    
    var w = document.getElementById("room-width").value;
    w = parseFloat(w);    
    var h = document.getElementById("room-height").value;
    h = parseFloat(h); 
    var Q_c = document.getElementById("vent-custom").value;
    if(Q_c>0){
        var Q = parseFloat(Q_c);
    }else{
        var Q = document.getElementById("vent").value;
        Q = parseFloat(Q); 
    } 
    var v_c = document.getElementById("airflow-custom").value;
    if(v_c>0){
        var v = parseFloat(v_c);
    }else{
        var v = document.getElementById("airflow").value;
        v = parseFloat(v);    
    }
    var v_dir = document.getElementById("airflow-dir").value;
    var v_x = 0; var v_y = 0;
    if (v_dir == "0"){v_x = v;}
    if (v_dir == "1"){v_x = -v;}
    if (v_dir == "2"){v_y = v;}
    if (v_dir == "3"){v_y = -v;}
    var time = document.getElementById("duration").value;
    time = parseFloat(time);    
    var p_c = document.getElementById("occ-act-custom").value;
    if(p_c>0){
        var p = parseFloat(p_c);
    }else{
        var p = document.getElementById("occ-act").value;
        p = parseFloat(p);  
    }   
    var mask_in_c = document.getElementById("occ-mask-custom").value;
    if(mask_in_c>0){
        var mask_in = parseFloat(mask_in_c) / 100;
    }else{
        var mask_in = document.getElementById("occ-mask").value;
        mask_in = parseFloat(mask_in);
    } 
    var x_o = document.getElementById("x0").value;
    x_o = parseFloat(x_o); 
    var y_o = document.getElementById("y0").value;
    y_o = parseFloat(y_o);
    var mask_ex_c = document.getElementById("inf-mask-custom").value;
    if(mask_ex_c>0){
        var mask_ex = parseFloat(mask_ex_c) / 100;
    }else{
        var mask_ex = document.getElementById("inf-mask").value;
        mask_ex = parseFloat(mask_ex);
    }     
    var frac_speak = document.getElementById("talk").value;
    frac_speak = parseFloat(frac_speak);
    frac_speak = frac_speak*0.01;
    var R_c = document.getElementById("viral-load-custom").value;
    if(R_c>0){
        var R = Math.log(parseFloat(R_c)) / Math.log(10);
    }else{
        var R = document.getElementById("viral-load").value;
        R = parseFloat(R);
    }     
    var d = document.getElementById("deact").value;
    d = parseFloat(d);
    var r = document.getElementById("transmissibility").value;
    r = parseFloat(r);

    var checkBox = document.getElementById("contour-or-point");
    var breakBox = document.getElementById("break");

    if(checkBox.checked == false){
    //if the toggle switch chooses the whole room
    //calc x and y values for graph.
    var xx = x_array(l,delta_x);
    var yy = y_array(w,delta_y);

    if(breakBox.checked == false){
        //if no break is added, run C_contour function
        var zz = C_contour(time,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,delta_x,delta_y);
    }else{
        //if a break is added, get break parameters and run C_break_contour function
        var time_break = document.getElementById("break-duration").value;
        time_break = parseFloat(time_break);
        var time2 = document.getElementById("break-start").value;
        time2 = parseFloat(time2);
        var time_cont = time - time2;
        var zz = C_break_contour(time_break,time_cont,time2,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,delta_x,delta_y);
    }
    //plot contour graph
    var datapt = [{
        x: xx,
        y: yy,
        z: zz,
        type: 'contour'
    }];
    Plotly.newPlot(chart,datapt,{margin:{t:0}});

    //calc avg concentration and print result.
    var C_avg = avg(zz,l,w,delta_x,delta_y);
    avg_print.innerHTML = "<p> Average concentration in the room is " + C_avg + " particles/m<sup>3</sup>. </p>";
    }else{
        //if specific location is chosen
        //read x and y coordinate of specific location
        var x_e = document.getElementById("x_e").value;
        x_e = parseFloat(x_e);
        var y_e = document.getElementById("y_e").value;
        y_e = parseFloat(y_e);

        if(breakBox.checked == false){
            //if no break is added, run C function
            var t_chart = t_graph(time,delta_t);
            var zz = C(R,time,x_e,y_e,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,p,r,mask_in);
        }else{
            //if break is added, get break parameters and run C_break function.
            var time_break = document.getElementById("break-duration").value;
            time_break = parseFloat(time_break);
            var time2 = document.getElementById("break-start").value;
            time2 = parseFloat(time2);
            var time_cont = time - time2;

            var t_chart = t_graph(time+time_break,delta_t);
            var zz = C_break(time_break,time_cont,R,time2,x_e,y_e,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t);
        }
        //plot line graph.
        var datapt = [{
            x: t_chart,
            y: zz
        }];
        Plotly.newPlot(chart,datapt,{margin:{t:0}});
    }
    $("#loading").hide();
    },1);
}

function toggleField(hideObj,showObj){
    //function to toggle custom value input
    hideObj.disabled=true;        
    hideObj.style.display='none';
    showObj.disabled=false;   
    showObj.style.display='inline';
    showObj.focus();
  }

function pass_break(){
    //function to pass duration value selected by user to the break slider
    var duration = document.getElementById("duration").value;
    var breaky = document.getElementById("break-start");

    breaky.max = duration;
}

function pass_x_coord(){
    //function to pass room length selected by user to the x coordinate sliders
    var l = document.getElementById("room-length").value;
    var x = document.getElementById("x0");
    var x_e = document.getElementById("x_e");

    x.max = l;
    x.value = l/2;
    x.nextElementSibling.value = x.value;
    x_e.max = l;
    x_e.value = l/4;
    x_e.nextElementSibling.value = x_e.value;
}

function pass_y_coord(){
    //function to pass room width selected by user to the y coordinate sliders
    var w = document.getElementById("room-width").value;
    var y = document.getElementById("y0");
    var y_e = document.getElementById("y_e");

    y.max = w;
    y.value = w/2;
    y.nextElementSibling.value = y.value;
    y_e.max = w;
    y_e.value = w/4;
    y_e.nextElementSibling.value = y_e.value;
}