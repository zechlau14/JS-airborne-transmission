function graph_choice(){
    //Get the checkbox
    var checkBox = document.getElementById("contour-or-point");
    var coord_input = document.getElementById("coord-eval");

    //show the correct button
    if(checkBox.checked == false){
        coord_input.style.display='none';
    } else{
        coord_input.style.display='block';
    }
}

function model_choice(){
    //Get the checkbox
    var checkBox = document.getElementById("risk-or-conc");
    var risk_button = document.getElementById("run-risk");
    var conc_button = document.getElementById("run-conc");

    //show the correct button
    if(checkBox.checked == false){
        conc_button.style.display='none';
        risk_button.style.display='block';
    } else{
        risk_button.style.display='none';
        conc_button.style.display='block';
    }
}

function add_break(){
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
    const chart = document.getElementById("result");
    chart.innerHTML="";
    const avg_print = document.getElementById("avg");
    avg_print.innerHTML="";
    const inf_print = document.getElementById("infected");
    inf_print.innerHTML="";

    const output = document.getElementById("output");
    output.style.display='block';
    $("#loading").show();
    setTimeout(function(){

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
        var xx = x_array(l,delta_x);
        var yy = y_array(w,delta_y);

        if(breakBox.checked == false){
            var zz = P_contour(time,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,p,r,mask_ex,mask_in,frac_speak,delta_t,delta_x,delta_y);
        } else{
            var time_break = document.getElementById("break-duration").value;
            time_break = parseFloat(time_break);
            var time2 = document.getElementById("break-start").value;
            time2 = parseFloat(time2);
            var time_cont = time - time2;
            var zz = P_break_contour(time_break,time_cont,time2,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,p,r,mask_ex,mask_in,frac_speak,delta_t,delta_x,delta_y);
        }

        var datapt = [{
            x: xx,
            y: yy,
            z: zz,
            type: 'contour'
        }];
        Plotly.newPlot(chart,datapt,{margin:{t:0}});
        
        var P_avg = avg(zz,l,w,delta_x,delta_y);
        console.log(typeof P_avg);
        P_avg = P_avg*100;
        avg_print.innerHTML = "<p> Average infection risk from airborne transmission in the room is " + P_avg + "%. </p>";
        inf_print.innerHTML = "<p> ie. <output>" + P_avg + "</output> out of <input type='number' value='100' min='0' step='1' style='width:45px' oninput='this.previousElementSibling.value = this.value/100*" + P_avg+"'> </input> people in the room will likely be infected.</p>";
    } else{
        var x_e = document.getElementById("x_e").value;
        x_e = parseFloat(x_e);
        var y_e = document.getElementById("y_e").value;
        y_e = parseFloat(y_e);

        if(breakBox.checked == false){
            var t_chart = t_graph(time,delta_t);
            var zz = Prob(R,time,x_e,y_e,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,p,r,mask_in);
        } else{
            var time_break = document.getElementById("break-duration").value;
            time_break = parseFloat(time_break);
            var time2 = document.getElementById("break-start").value;
            time2 = parseFloat(time2);
            var time_cont = time - time2;
            var t_chart = t_graph(time+time_break,delta_t);
            var zz = Prob_break(time_break,time_cont,R,time2,x_e,y_e,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,p,r,mask_in);
        }
        
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
    const chart = document.getElementById("result");
    chart.innerHTML="";
    const avg_print = document.getElementById("avg");
    avg_print.innerHTML="";
    const inf_print = document.getElementById("infected");
    inf_print.innerHTML="";

    const output = document.getElementById("output");
    output.style.display='block';
    $("#loading").show();

    setTimeout(function(){

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
    var xx = x_array(l,delta_x);
    var yy = y_array(w,delta_y);

    if(breakBox.checked == false){
        var zz = C_contour(time,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,delta_x,delta_y);
    }else{
        var time_break = document.getElementById("break-duration").value;
        time_break = parseFloat(time_break);
        var time2 = document.getElementById("break-start").value;
        time2 = parseFloat(time2);
        var time_cont = time - time2;
        var zz = C_break_contour(time_break,time_cont,time2,R,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,delta_x,delta_y);
    }
    var datapt = [{
        x: xx,
        y: yy,
        z: zz,
        type: 'contour'
    }];
    Plotly.newPlot(chart,datapt,{margin:{t:0}});

    var C_avg = avg(zz,l,w,delta_x,delta_y);
    avg_print.innerHTML = "<p> Average concentration in the room is " + C_avg + " particles/m<sup>3</sup>. </p>";
    }else{
        var x_e = document.getElementById("x_e").value;
        x_e = parseFloat(x_e);
        var y_e = document.getElementById("y_e").value;
        y_e = parseFloat(y_e);

        if(breakBox.checked == false){
            var t_chart = t_graph(time,delta_t);
            var zz = C(R,time,x_e,y_e,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t,p,r,mask_in);
        }else{
            var time_break = document.getElementById("break-duration").value;
            time_break = parseFloat(time_break);
            var time2 = document.getElementById("break-start").value;
            time2 = parseFloat(time2);
            var time_cont = time - time2;

            var t_chart = t_graph(time+time_break,delta_t);
            var zz = C_break(time_break,time_cont,R,time2,x_e,y_e,x_o,y_o,l,w,v_x,v_y,Q,d,s,h,mask_ex,frac_speak,delta_t);
        }
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
    hideObj.disabled=true;        
    hideObj.style.display='none';
    showObj.disabled=false;   
    showObj.style.display='inline';
    showObj.focus();
  }

function pass_break(){
    var duration = document.getElementById("duration").value;
    var breaky = document.getElementById("break-start");

    breaky.max = duration;
}

function pass_x_coord(){
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