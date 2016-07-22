 window.doc={
      player:document.getElementById("player"),
      playercontent:document.getElementById("player-content"),
      allvideos:document.getElementById("all-videos")
  };

var DataService=(function(){
    var dataServiceInstance; 
    var type; 
    var callback;
    var url;

    function create(){

      var readFile=function(){
      	
      var XMLHttpFactories = [
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		function () {return new ActiveXObject("Microsoft.XMLHTTP")}
       ];
       var xhttp;
       for (var i=0;i<XMLHttpFactories.length;i++) {
		try {
			xhttp = XMLHttpFactories[i]();
		}
		catch (e) {
			continue;
		}
		break;
	   }
	  

       xhttp.onreadystatechange=function(){
           if (xhttp.readyState == 4 && xhttp.status == 200) {

           	   if(type=="XML"){
           	   	callback(xhttp.responseXML);
           	   }
               else if(type=="JSON"){
               	callback(JSON.parse(xmlhttp.responseText));
               }
            }
       }
       xhttp.open("GET", url, true);
       xhttp.send();



    };  	

     var get=function(_type,_url,_callback){
        
        type=_type;
        url=_url;    
        callback=_callback; 
        readFile();

     };

     return{
     	get:get
     }


    }

    return{
       getInstance :function(){
         if(!dataServiceInstance){
           dataServiceInstance=create();
         }
         return dataServiceInstance;

       }
    }


})();


var VideoService=(function(){

   var videoServiceInstance;   
   var player;
   function create(){
    
     var initPlayer=function(_playerid){
         player=videojs(_playerid,{
          techOrder: ['html5','flash','youtube'],
          autoplay: true
         });
     };

    var destroyVideo=function(){
      if(player){
        player.pause();
        player.currentTime(0);
        player.dispose();
      }
    }

     var loadVideo=function(src){        
        if(player){
        player.src(src);
        }
        else{
          alert('Please initialiaze player first.');
        }
     }

     var bind=function(eventType,callback){
          if(eventType=="ended"){
            player.on('ended',function(){
                callback();
            });
          }
     };

     return{
      initPlayer:initPlayer,     
      destroyVideo:destroyVideo,
      loadVideo:loadVideo,
      bind:bind
     }


   }

   return{
    getInstance:function(){
      if(!videoServiceInstance){
        videoServiceInstance=create();
      }
      return videoServiceInstance;
    }
   }
    

})();


(function(document){

    
     var appData;
     var allVideosInfo=[];
     var currentActiveVideo=0;
     var currentVideoInfo;
     var videoService=VideoService.getInstance();
     var xmlService=DataService.getInstance();
     


     var Video=function(id,title,src){
         this.id=typeof(id)=="undefined"?"":id;
         this.title=typeof(title)=="undefined"?"":title;
         this.src=typeof(src)=="undefined"?[]:src;
        
     }

     Video.prototype.loadVideo=function(){

           videoService.loadVideo(this.src);
     };
    
     
     xmlService.get('XML','data/data.xml',function(data){
            appData=data;

            (function(){

            var videoinfo= appData.getElementsByTagName("video");
            var length=videoinfo.length;
            for(var i=0; i< length; i++){
              var video=new Video();
              allVideosInfo.push(video);
              video.id="vid"+i;

              (function(videoinfo){
                
                var title=videoinfo.getElementsByTagName('title')[0].childNodes[0].nodeValue;
                var sourceinfo=videoinfo.getElementsByTagName('source');
                var length= sourceinfo.length;
                video.title=title;
                for(var i=0; i< length; i++){
                    
                    (function(sourceinfo){
                      
                      var type=sourceinfo.getAttribute('type');
                      var url=sourceinfo.childNodes[0].nodeValue;
                    
                      video.src.push({
                        type:type,
                        src:url
                      }) 

                    })(sourceinfo[i]);

                 };

                 
              })(videoinfo[i]);


              }

            })();
            
           
             createVideos();
             loadVideo();
             
     });

     var createPlayer=function(){   
           doc.playercontent.innerHTML='<video id="player" class="video-js vjs-default-skin" controls preload="auto" width="100%" height="268">';
           videoService.initPlayer('player');
     }

     var createVideos=function(){

          var ul="<ul>";          
          allVideosInfo.forEach(function(videoinfo,index){        
             ul+="<li id=vid"+index+"><a href='#'>"+videoinfo.title+"</a></li>";
          });         
          ul+="</ul>";

          doc.allvideos.innerHTML=ul;
        

           [].forEach.call(doc.allvideos.querySelectorAll("li a"),function(element){
              element.addEventListener('click',function(e){
                 e.preventDefault();                
                 currentActiveVideo=parseInt(this.parentNode.id.split("vid")[1]);
                 videoService.destroyVideo();
                 loadVideo();

              }); 
         });

     };

     var activeVideo=function(){

         [].forEach.call(doc.allvideos.querySelectorAll("li a"),function(element,index){
              if(currentActiveVideo==index){
                element.classList.add('active');
              }
              else{
                element.classList.remove('active');
              }
         });
     };

     var loadVideo=function(){
       createPlayer();
       currentVideoInfo=allVideosInfo[currentActiveVideo];
       videoService.loadVideo(currentVideoInfo.src); 
       videoService.bind('ended',onVideoEnded);     
       activeVideo();
     };

     var onVideoEnded=function(){
         if(currentActiveVideo==allVideosInfo.length-1){
          currentActiveVideo=0;
         }
         else{
          currentActiveVideo+=1;
         }
         videoService.destroyVideo();
         loadVideo();                
       
     }

})(document);