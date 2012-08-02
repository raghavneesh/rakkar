function imageLoader(){
	return {
			onComplete: function(){} // Fires when all finished loading
			,onLoaded: function(){} // Fires when an image finishes loading
			,current: null // Last loaded image (Image Object)
			,qLength : 0 // the queue length before process_queue
			,images: [] // Loaded images (array of Image Object)
			,inProcess : false // a flag to indicate if in process_queue
			,queue:[] // Waiting to be processed (array of strings (urls for Image SRC))
			,queue_images: function(){ // gets multiple arguments each can be either an image src or an array of image src (you can mix).
				var arg=arguments;
				for (var i=0;i<arg.length;i++){
					if (arg[i].constructor === Array){
						this.queue= this.queue.concat(arg[i]); // add to queue, do not empty it!
					}else if(typeof arg[i]==='string'){
						this.queue.push(arg[i]);
					}
				}				
			}
			,process_queue: function() { // start loading images from the queue
				this.inProcess = true;
				this.qLength += this.queue.length;
				while(this.queue.length >0){
					this.load_image(this.queue.shift()); //pull the next image off the top and load it
				}
				this.inProcess = false;
			}
			,load_image: function(imageSrc){ // load a single by a url and continue to process the queue
				var th = this;
				var im = new Image;
				im .onload = function(){ // After user agent has the image
					th.current = im ; // set the current
					th.images.push(im ); // add the image to the stack
					(th.onLoaded)(); //fire the onloaded
					if(th.queue.length > 0 && !th.inProcess){
						th.process_queue(); // make sure other items are loaded!
					}
					if(th.qLength == th.images.length){ // all images loaded?
						(th.onComplete)(); // call callback
					}//else{// if queue is not empty 
					 //	
					// }
				}
				im.onerror=function(){
					th.current=im;
					(th.onLoaded(true));
				}
				im .src = imageSrc; // Tell the User Agent to GET the image
			}
		}
}