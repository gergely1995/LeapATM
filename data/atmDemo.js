/*!
 * LeapATM
 * https://github.com/gergely1995/LeapATM/
 *
 * Copyright 2020 Gergely Szentgyörgyi
 * Released under the Apache-2.0 license
 * https://github.com/gergely1995/LeapATM/blob/master/LICENSE
 */

var controller = new Leap.Controller({enableGestures: true});



//select number
var dial=[1,0,0];//toggle,prevValue,selectValue
var at=0;//withdraw amount cursor location
function dialControl(hand){
    var t=20;//tolerance
    if(hand.grabStrength<1){
        if((dial[2]<9)&&(dial[1]+t<hand.palmPosition[1])&&(hand.palmPosition[1]>=100)){dial[2]++;dial[1]=hand.palmPosition[1];}
        else if((dial[2]>0)&&(dial[1]-t>hand.palmPosition[1])){dial[2]--;dial[1]=hand.palmPosition[1];}
    }
}

//confirm number selection
var obt=[false,null];//toggle,prev
function OKbkspc(hand){
    var OKdir=0.1;
    var NOdir=-0.1;
    if(obt[0]==false&&hand.thumb.extended&&hand.grabStrength==1){//ok sign
        if(obt[1]==null){obt[1]=hand.direction[0];}
        if(hand.direction[0]>obt[1]+OKdir){//up
            obt[0]=true;
            return "OK";
        }else if(hand.direction[0]<obt[1]+NOdir){//down
            obt[0]=true;
            return "backspace";
        }
    }else if(obt[0]==true&&hand.grabStrength==0){obt[0]=false;obt[1]=null;return "reset";}//reset
    return null;
}

//show numbers with fingers
var okct=false;//toggle options
var tt=null;//timed toggle to prevent accidentla swipes and option toggle
function signToInt(hand){
    var r=null;
    if(okct==false){//fingers to numbers
        /*5*/if(hand.indexFinger.extended&&hand.middleFinger.extended&&hand.ringFinger.extended&&hand.pinky.extended&&hand.thumb.extended){
            okct=true;
            return 5;
        }
        /*4*/else if((hand.indexFinger.extended&&hand.middleFinger.extended&&hand.ringFinger.extended&&hand.thumb.extended)||(hand.indexFinger.extended&&hand.middleFinger.extended&&hand.ringFinger.extended&&hand.pinky.extended)){
            okct=true;
            return 4;
        }
        /*3*/else if(hand.indexFinger.extended&&hand.middleFinger.extended&&hand.thumb.extended){
            okct=true;
            return 3;
        }
        /*2*/else if((hand.indexFinger.extended&&hand.middleFinger.extended)||(hand.indexFinger.extended&&hand.thumb.extended)){
            okct=true;
            return 2;
        }
        /*1*/else if(hand.indexFinger.extended){
            okct=true;
            return 1;
        }
    }
    //    if(r!=null){console.log(r);}
    return null;
}

//confirm withdraw amount
var ndtmp=["",0,false];//signYes firstDirection,counter,toggle
function signYes(hand){
    var t=0.5;//tolerance
    if(!hand.indexFinger.extended&&!hand.middleFinger.extended&&!hand.ringFinger.extended&&!hand.pinky.extended&&!hand.thumb.extended&&hand.grabStrength==1){
        //            if(hand.pinchStrength==1){
        if(ndtmp[0]==""){ndtmp[0]=hand.direction[1];}//set firstDirection
        var cldf=ndtmp[0]-hand.direction[1];
//        console.log(ndtmp[0]+" | "+hand.direction[1]+" | "+cldf);
        if(ndtmp[2]==false&&cldf<t){ndtmp[2]=true;console.log("down");ndtmp[1]++;}
        if(ndtmp[2]==true&&cldf>t){ndtmp[2]=false;console.log("up");}
        if(ndtmp[1]>2){return true;}
    }else{ndtmp=["",0,false];console.log("reset");}
    return false;
}

//return card
var retC=[null,null];//return card firstPos,firstangle
function signTake(hand){
    var t=0.1;
    if(hand.pinchStrength==1&&hand.grabStrength==1){
        if(retC[0]==null){retC[0]=hand.palmPosition[2];}
        if(retC[1]==null){obt[1]=hand.direction[0];}
        if(hand.palmPosition[2]-retC[0]>50&&hand.direction[0]>retC[1]+t){
            console.log("return card");
            return true;
        }
    }else if(hand.pinchStrength==1&&hand.grabStrength==1){retC=[null,null];}
    return false;
}

var uit=0;//ui toggle
var withdrawAmount="";

controller.loop(function(frame) {
    if(frame.hands.length>0){
//        console.log(frame.hands[0].pinchStrength);
//        console.log(frame.hands[0].palmPosition);
//        console.log(frame.hands[0].direction[1]);
        ////////////////////////////////////////////////////////////////////////////return card
        if(signTake(frame.hands[0])==true){
            console.log("return card");
            ////////////////////////////////////////////////////////////////////////////withdraw confirm
            document.getElementById("UI").remove();
            document.getElementById("header").insertAdjacentHTML('afterend',''
                                                                 +'<div id="UI" class="scrollable" style="height:250; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; overflow:auto;text-align:center;">'
                                                                 +'<br>'
                                                                 +'<p style="font-size:30">card returned</p>'
                                                                 +'<p style="font-size:30">refresh page</p>'
                                                                 +''
                                                                 +'</div>'
                                                                 );
            ////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////guide
            document.getElementById("guide").remove();
            document.getElementById("UI").insertAdjacentHTML('afterend',''
                                                             +'<div id="guide" class="scrollable" style="height:170; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; background-color:#34363A; overflow:auto; text-align:center;">'
                                                             +'<br>'
                                                             //                                                                 +'<p>1 show balance</p>'
                                                             +'<p style="color:white;"></p>'
                                                             +''
                                                             +'</div>'
                                                             );
            ////////////////////////////////////////////////////////////////////////////
        }
        ////////////////////////////////////////////////////////////////////////////
        if(uit==0){//pin
            ////////////////////////////////////////////////////////////////////////////dial controls
            var rst=false;//reset number when cancelling
            dialControl(frame.hands[0]);
            switch(OKbkspc(frame.hands[0])){
                case "OK":
                    console.log("OK");
                    if(dial[0]<4){
                        dial[0]++;
                    }else{
                        uit=1;
                        okct=false;
                    }
                    break;
                case "backspace":
                    if(dial[0]>1){dial[0]--;}
                    console.log("backspace");
                    rst=true;
                    break;
            }
            if(dial[0]<=4){if(rst==false){document.getElementById('dial_'+dial[0]).value=dial[2];}else{document.getElementById('dial_'+(dial[0]+1)).value=0;}}//update dial
            ////////////////////////////////////////////////////////////////////////////
        }
        if(uit==1){//menu
            ////////////////////////////////////////////////////////////////////////////main menu
            document.getElementById("UI").remove();
            document.getElementById("header").insertAdjacentHTML('afterend',''
                                                                 +'<div id="UI" class="scrollable" style="height:250; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; overflow:auto;text-align:center;">'
                                                                 +'<br>'
                                                                 +'<p style="font-size:30">1 show balance</p>'
                                                                 +'<p style="font-size:30">2 withdraw money</p>'
                                                                 +''
                                                                 +'</div>'
                                                                 );
            ////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////guide
            document.getElementById("guide").remove();
            document.getElementById("UI").insertAdjacentHTML('afterend',''
                                                             +'<div id="guide" class="scrollable" style="height:170; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; background-color:#34363A; overflow:auto; text-align:center;">'
                                                             +'<br>'
                                                             +'<pre style="color:white;">option 1        option 2        return card</pre>'
                                                             +'<img src="data/o1.png" style="height:100; width:100;">'
                                                             +'<img src="data/o2.png" style="height:100; width:100;">'
                                                             +'<img src="data/return_card.gif" style="height:100; width:100;">'
                                                             +''
                                                             +'</div>'
                                                             );
            ////////////////////////////////////////////////////////////////////////////
            switch(signToInt(frame.hands[0])){
                case 1:
                    document.getElementById("UI").remove();
                    ////////////////////////////////////////////////////////////////////////////balance
                    document.getElementById("header").insertAdjacentHTML('afterend',''
                                                                         +'<div id="UI" class="scrollable" style="height:250; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; overflow:auto;text-align:center;">'
                                                                         +'<br>'
                                                                         +'<p style="font-size:30">your balance:</p>'
                                                                         +''
                                                                         +'</div>'
                                                                         );
                    ////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////guide
                    document.getElementById("guide").remove();
                    document.getElementById("UI").insertAdjacentHTML('afterend',''
                                                                     +'<div id="guide" class="scrollable" style="height:170; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; background-color:#34363A; overflow:auto; text-align:center;">'
                                                                     +'<br>'
                                                                     //                                                                 +'<p>1 show balance</p>'
                                                                     +'<pre style="color:white;">back     return card</pre>'
                                                                     +'<img src="data/back.gif" style="height:100; width:100;">'
                                                                     +'<img src="data/return_card.gif" style="height:100; width:100;">'
                                                                     +''
                                                                     +'</div>'
                                                                     );
                    ////////////////////////////////////////////////////////////////////////////
                    uit=2;
                    break;
                case 2:
                    document.getElementById("UI").remove();
                    ////////////////////////////////////////////////////////////////////////////withdraw
                    document.getElementById("header").insertAdjacentHTML('afterend',''
                                                                         +'<div id="UI" class="scrollable" style="height:250; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; overflow:auto;text-align:center;">'
                                                                         +'<br>'
                                                                         +'<p style="font-size:30">withdraw</p>'
                                                                         +'<textarea id="amount_0" type="text" name="fname" style="width:50; height:100; border:0; background-color:#34363A; color:white; font-size:80px; value:0;">0</textarea>'
                                                                         +'</div>'
                                                                         );
                    ////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////guide
                    document.getElementById("guide").remove();
                    document.getElementById("UI").insertAdjacentHTML('afterend',''
                                                                     +'<div id="guide" class="scrollable" style="height:170; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; background-color:#34363A; overflow:auto; text-align:center;">'
                                                                     +'<br>'
                                                                     //                                                                 +'<p>1 show balance</p>'
                                                                     +'<pre style="color:white;">dial          next       delete      confirm    back     return card</pre>'
                                                                     +'<img src="data/dial.gif" style="height:80; width:80;">'
                                                                     +'<img src="data/ok.gif" style="height:80; width:80;">'
                                                                     +'<img src="data/cancel.gif" style="height:80; width:80;">'
                                                                     +'<img src="data/sign_ok.gif" style="height:80; width:80;">'
                                                                     +'<img src="data/back.gif" style="height:80; width:80;">'
                                                                     +'<img src="data/return_card.gif" style="height:80; width:80;">'
                                                                     +''
                                                                     +'</div>'
                                                                     );
                    ////////////////////////////////////////////////////////////////////////////
                    uit=3;
                    break;
            }
            if(tt!=null&&okct==true&&frame.timestamp-tt>1000000){//toggle options
                okct=false;
                tt=null;
            }else if(tt==null){tt=frame.timestamp;}//reset timer
        }
        if(uit==2){
            if(frame.gestures.length>0){if(frame.gestures[0].type==="swipe"){if(frame.gestures[0].direction[0]<0){console.log("back");uit=1;tt=frame.timestamp;okct=true;}}}
        }
        if(uit==3){
            ////////////////////////////////////////////////////////////////////////////dial controls
            switch(OKbkspc(frame.hands[0])){
                case "OK":
                    console.log("OK");
                    document.getElementById("amount_"+at).insertAdjacentHTML('afterend',''
                                                                             +'<textarea id="amount_'+(at+1)+'" type="text" name="fname" style="width:50; height:100; border:0; background-color:#34363A; color:white; font-size:80px; value:0;">0</textarea>'
                                                                             );
                    at++;
                    console.log(dial[2]);
                    withdrawAmount+=dial[2];
                    break;
                case "backspace":
                    if(at!=0){
                        okct=true;
                        console.log("backspace");
                        document.getElementById("amount_"+at).remove();
                        rst=true;
                        at--;
                        withdrawAmount.slice(0,withdrawAmount.length-1);
                    }
                    break;
            }
            dialControl(frame.hands[0]);
            document.getElementById('amount_'+at).value=dial[2];
            ////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////sign language yes
            if(signYes(frame.hands[0])==true){
                console.log("confirm");
                uit=4;
                tt=frame.timestamp;
                okct=true;
                withdrawAmount+=dial[2];
                ////////////////////////////////////////////////////////////////////////////withdraw confirm
                document.getElementById("UI").remove();
                document.getElementById("header").insertAdjacentHTML('afterend',''
                                                                     +'<div id="UI" class="scrollable" style="height:250; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; overflow:auto;text-align:center;">'
                                                                     +'<br>'
                                                                     +'<p style="font-size:30">Confirm: '+withdrawAmount+'</p>'
                                                                     +'<p style="font-size:30">Thank you for testing :)</p>'
                                                                     +''
                                                                     +'</div>'
                                                                     );
                ////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////guide
                document.getElementById("guide").remove();
                document.getElementById("UI").insertAdjacentHTML('afterend',''
                                                                 +'<div id="guide" class="scrollable" style="height:170; width:505; border:0; margin:0px 0px 0px 0px; padding:0px 0px 0px 0px; background-color:#34363A; overflow:auto; text-align:center;">'
                                                                 +'<br>'
                                                                 //                                                                 +'<p>1 show balance</p>'
                                                                 +'<pre style="color:white;">confirm        back         return card</pre>'
                                                                 +'<img src="data/sign_ok.gif" style="height:100; width:100;">'
                                                                 +'<img src="data/back.gif" style="height:100; width:100;">'
                                                                 +'<img src="data/return_card.gif" style="height:100; width:100;">'
                                                                 +''
                                                                 +'</div>'
                                                                 );
                ////////////////////////////////////////////////////////////////////////////
            }
            ////////////////////////////////////////////////////////////////////////////
            if(frame.gestures.length>0){if(frame.gestures[0].type==="swipe"){if(frame.gestures[0].direction[0]<0){console.log("back");uit=1;tt=frame.timestamp;okct=true;dial=[1,0,0];at=0;ndtmp=["",0,false];withdrawAmount="";}}}
        }
        if(uit==4){
            if(frame.gestures.length>0){if(frame.gestures[0].type==="swipe"){if(frame.gestures[0].direction[0]<0){console.log("back");uit=1;tt=frame.timestamp;okct=true;dial=[1,0,0];at=0;ndtmp=["",0,false];withdrawAmount="";}}}
        }
    }
});
controller.on('ready', function() {
    console.log("ready");
});
controller.on('connect', function() {
    console.log("connect");
});
controller.on('disconnect', function() {
    console.log("disconnect");
});
controller.on('focus', function() {
    console.log("focus");
});
controller.on('blur', function() {
    console.log("blur");
});
controller.on('deviceConnected', function() {
    console.log("deviceConnected");
});
controller.on('deviceDisconnected', function() {
    console.log("deviceDisconnected");
});
