var movie = movie || {
	moviesArr:[],
	search:null,
	baseUrl: 'http://www.omdbapi.com/?',
	apiKey:'e05e8167',
	searchTypes:[{type:'byTitle',prefix:'t='},{type:'byId',prefix:'i='},
	{type:'byType',prefix:'type=',options:['movie','series','episode']},
	{type:'byYear',prefix:'y='}
	],
	searchObj:{},
	currOptions:{},
	initApp:function(){
		movie.notFound = new Image();
		movie.notFound.src="404.jpg";
		movie.moviesArr=[];
		movie.search = document.getElementById('search');
		movie.advancedToggle = document.getElementById('advanced-toggle');
		movie.submitSearch = document.getElementById('advanced-search-form');
		movie.tabs = document.querySelectorAll('.tab');
		movie.addHandlers();
	},
	addHandlers:function(){
		movie.tabsModule.initTabs(movie.tabs);
		movie.search.addEventListener('input',movie.searchModule.search);
		movie.search.hasListener = true;
		movie.advancedToggle.addEventListener('click',movie.displayModule.toggleAdvancedSearch);

		movie.submitSearch.addEventListener('submit',function(e){
			e.preventDefault();
			movie.searchObj = movie.helpModule.createFormDataObject(this.elements);
			movie.searchModule.advancedSearch(movie.searchObj);
		})

	}
};

movie.tabsModule = {
	initTabs:function(tabs){
		var self = this;
		Array.prototype.forEach.call(tabs,function(tab){
			tab.onclick = self.changeTab.bind(tab,tabs);
		});
		this.changeTab.call(null,tabs,0);
	},
	changeTab:function(tabs,idx){
var args = Array.prototype.slice.call(arguments);
		if(typeof idx != 'number' && typeof idx != 'string'){
		tabs.forEach(function(tab){
			tab.classList.remove('active');
		})	
		var tab= this;
		tab.classList.add('active');
		var index = tab.getAttribute('data-index');
		movie.tabsModule.loadTabContent(index);
		return;
		}else{
			tabs.forEach(function(tab){
			tab.classList.remove('active');
		})	
		tabs[idx].classList.add('active');
		if(args.length == 2){
			console.log(args);
			movie.tabsModule.loadTabContent(idx);
		}
		
		}

		
		
	},
	loadTabContent:function(index){
		console.log(typeof index);
		if(index>=0 && (typeof index == 'number' || typeof index == 'string')){
			console.log(index);
			movie.htmlModule.createHtml(undefined,index);
		} 
		
		
	}
}

movie.displayModule={
	toggleAdvancedSearch:function(e){
	var advancedContainer = document.getElementById('advanced-search-container');
		switch(advancedContainer.style.display){
			case 'none':
			case '':
				
				$(advancedContainer).animate({'left':0,'opacity':1},400);
				$(advancedContainer).fadeIn(300);
				if(movie.search.hasListener){
					movie.search.removeEventListener('input',movie.searchModule.search);
					movie.search.hasListener=false;
					movie.advancedSearch=true;
				}
				break;
			case 'block':
			$(advancedContainer).animate({'left':'200px','opacity':0},400);
			$(advancedContainer).fadeOut(100);
			if(!movie.search.hasListener){
					movie.search.addEventListener('input',movie.searchModule.search);
					movie.search.hasListener=true;
				}
				movie.advancedSearch=false;
				break;
		}
	}
};


movie.memoryModule = {
	savedMovies:[],
	saveToTheList:function(){

		if(!movie.helpModule.isEmptyObject(this)){
			movie.memoryModule.savedMovies.push(this);
			movie.memoryModule.cache(this);
		}
	},

	cache:function(movie){
		if(!movie) return false;
		
		var movies = this.getStorageItem('movies');
		if(typeof movies !== 'undefined' && movies !== null){
			var movieToFind = movies.find(function(movieInArr){
				return movie.Title == movieInArr.Title;
			});
			if(!movieToFind){
				movies.push(movie);	
				this.setStorageItem('movies',movies);
			}else{
				return Error('Error. Movie is already saved.')
			}
		}else{
			this.setStorageItem('movies',[movie]);
		}
	},
	

	getStorageItem:function(key){
		var result = window.localStorage.getItem(key);
		result = JSON.parse(result);
		return result;
	},

	setStorageItem:function(key,value){
		if(!key || !value) return false;
		value = JSON.stringify(value);
		window.localStorage.setItem(key,value);
		return true;
	},

	removeStorageItem:function(identificator){
		var moviesList = this.getStorageItem('movies');
		var idx = movie.memoryModule.findItemIdxOrItemInStorage('movies',identificator,true);
		if(idx !== -1){
			moviesList.splice(idx,1);
		}
		this.setStorageItem('movies',moviesList);
		movie.htmlModule.createHtml(undefined,'1');
		
	},
	removeMovieFromCache:function(target){
				
				var data;
				var parent = movie.memoryModule.findParent(target);

			data = parent.getAttribute('data-title');
		
			if(data){
				movie.memoryModule.removeStorageItem(data);
			}else{
				return new Error('Failed to remove the movie from storage')
			};
	},
	findItemIdxOrItemInStorage:function(key,item,isIndex){
		var moviesList = this.getStorageItem('movies');
		if(isIndex){
		var idx = moviesList.findIndex(function(movie){
			return movie.Title.toLowerCase() === item;
		})
		return idx;
		}else{
			var element = moviesList.find(function(movie){
			return movie.Title.toLowerCase() === item;
		})
		return element;
		}
	},
	findParent:function(element){
		var parent=element.parentElement;
		while(!parent.getAttribute('data-title')){
				parent =parent.parentElement;
				}
				if(!parent) return false;
				return parent;
	}

}



movie.searchModule = {
	currentSearch:'',
	advancedSearch:function(searchObj){
		var url;
			if(movie.advancedSearch){
				if(!movie.helpModule.isEmptyObject(searchObj)){
				url = movie.ajaxModule.createUrl(searchObj);
				console.log(url);
				}else{
					return;
				}
			movie.ajaxModule.request({url:url}).then(function(data){
				console.log(data);
			})
			}
	},
	search:function(e){
		if(movie.searchModule.timeout) clearTimeout(movie.searchModule.timeout);
			var target = e.target;
			var value = target.value;
			var options;
			options = {byTitle:value};
			
			if(movie.searchModule.currentSearch != value){
				movie.searchModule.currentSearch = value;
				movie.searchModule.timeout = setTimeout(function(){
					var url = movie.ajaxModule.createUrl(options);
			movie.ajaxModule.request({url:url}).then(function(data){
			movie.htmlModule.refreshDom(data);
			}).catch(function(error){
				movie.helpModule.handleError(error);
			})
			
		},900);
				}
			
	},

	getRequestPrefix(type){
		var prefix;
		var rTypes = movie.searchTypes;
		rTypes.forEach(function(item){
			if(item.type == type){
				prefix = item.prefix;
			}
		});
		return prefix;
	}
}


movie.ajaxModule = {
	currentResponse:{},
	createUrl:function(options){
		var base = movie.baseUrl;
		var urlTail='';
		for(var key in options){
			var prefix = movie.searchModule.getRequestPrefix(key);
			if(Object.keys(options).length > 1){
				urlTail+= prefix + options[key] + '&';
			}else{
				urlTail+= prefix + options[key];
			}	
		};
		var url = base + urlTail;
		url = movie.formatModule.formatUrl(url) + '&apikey='+movie.apiKey;
		return url;
	},

		request: function(options){
			return new Promise(function(resolve,reject){
				var xhr = new XMLHttpRequest();
		 		onSendData = options.send ? JSON.stringify(options.send) : null,
				method = options.method || 'GET';
				xhr.open(method, options.url, true);

		xhr.onload = function(){
			 var response = JSON.parse(xhr.responseText);
			if(xhr.status == 200 && !response.hasOwnProperty('Error')){
				resolve(xhr.responseText);		
			}else{
				reject(Error(xhr.responseText));
			};
			console.log(response['Error'])
		};

		xhr.onerror = function(){
			reject(Error("An error occured"));
		}
		xhr.send(onSendData);
			})		
	}
}


movie.formatModule = {
	formatUrl:function(url){
		var regex = new RegExp(/&$/g);
		url = url.replace(regex,'');
		return url;
	}
};


movie.helpModule = {

	isEmptyObject:function(obj){
		for(var key in obj){
			if(obj.hasOwnProperty(key)){
				return false;
			}
		}
		return true;
	},
	createAverageRating:function(data){
		var len = data.length;
		console.log(data);
		data = data.map(function(item,idx){
			return item.Value
		});

		var avg = data.reduce(function(acc,current){
			if(!current.match(/\%/g)){
				current =current.split('/');
				
				if(current[0].match(/\./g)){
					current[0] = parseFloat(current[0])*10;
				}else{
					current[0]=parseInt(current[0]);
				}
				return acc+current[0]
			}else{
				current = parseInt(current.replace(/\%/g,''));
				return acc+current;
			}
		},0)
		avg = avg/len;
		return avg.toFixed(0);
	},

	createFormDataObject:function(elements){
		var obj={};
		elements = Array.prototype.slice.call(elements);
		
		elements.forEach(function(element,i){
			if(element.name){
				var key=element.name;
				var value = element.value;
				obj[key]=value;
			}
		})
		return obj;
	},

	handleError:function(error){
		error = JSON.parse(error.message)
				var b = document.getElementById('movie-cont');
				b.innerHTML = '';
				var cover = document.createElement('div');
				b.style.background = 'url('+movie.notFound.src+')';
				b.style.backgroundSize = 'cover';
				
				cover.innerHTML=error['Error'] + ' Try again';
				cover.style.width = '100%';
				cover.style.height = '100%';
				cover.style.background = 'rgba(0,0,0,.5)';
				cover.style.position = 'absolute';
				cover.style.transform = 'translateX(-30px)';
				b.appendChild(cover);
	},
	handleSavedMovieClick:function(e){
		var target = e.target;
		if(target.className === 'saved-movies-single-remove'){
			movie.memoryModule.removeMovieFromCache(target);
		}else if(target.className === 'saved-movies-single-img'){
			var parent = movie.memoryModule.findParent(target);
			var data = parent.getAttribute('data-title');
			var item = movie.memoryModule.findItemIdxOrItemInStorage('movies',data,false);
			if(item){
				movie.htmlModule.createHtml(item);
			}

		}
	}
}


movie.htmlModule={
	createHtml:function(data,idx){
		var container;
		
		var element = movie.htmlModule.createContainer();
		element.style.background='none'
		if(typeof data === 'undefined'){
			idx = idx.toString();
			switch(idx){
				case '0':
				console.log('hey')
				var hint = document.createElement('p');
				hint.className="hint";
				hint.innerText='Start typing in the search area the movie that you are interested in or'+
					' use the advanced search option'
					element.appendChild(hint);
					break;
				case '1':
					var list = movie.memoryModule.getStorageItem('movies');
					if(!list.length){
						var hint = document.createElement('p');
				hint.className="hint";
				hint.innerText='No saved items yet.'
					element.appendChild(hint);
					}else{
						var newList=movie.htmlModule.createSavedMoviesList(list);
					element.appendChild(newList)
					}
					
					break;
			};
			
		}
		else if(data){
			element.innerHTML='';
			if(typeof data === 'string'){
				data = JSON.parse(data);
			}
			
			movie.htmlModule.createContainerElements(data).then(function(data){
			container = data;
			element.style.display='none';
			element.appendChild(container);
			$(element).fadeIn(1500);
			});

		}
		
	},
	createSavedMoviesList:function(list){
		var main = document.createElement('ul');
		var requiredItems = {
			removeBtn:{tag:'span',handler:'btnHandler'},
		img:{tag:'img',handler:'imgHandler'},
		title:{tag:'p',handler:'textHandler'},
		year:{tag:'p',handler:'textHandler'},
		genre:{tag:'p',handler:'textHandler'}
	}
	var result = [];
	list.forEach(function(element){
		var _movie = {};
		_movie['data'] = element['Title'].toLowerCase();
		for(var variable in requiredItems){
			var item = movie.htmlModule[requiredItems[variable].handler](variable,requiredItems[variable].tag,element);
			
			_movie[variable]=item;
		};

		result.push(_movie);
	})
	
		result.forEach(function(element){
			var midresult=document.createElement('li');
			midresult.setAttribute('data-title',element['data']);		
			delete element['data'];
			var divForMeta = document.createElement('div');
			for(var key in element){
				if(key !== 'genre' && key !== 'title' && key !== 'year'){
					midresult.appendChild(element[key])
				}

				else{
					
					divForMeta.classList.add('saved-movies-single-meta');
					divForMeta.appendChild(element[key]);
					midresult.appendChild(divForMeta);
				}
				
			}
			midresult.classList.add('saved-movies-list-elem');
			main.appendChild(midresult);
		})
		main.classList.add('saved-movies-list');
		main.addEventListener('click',movie.helpModule.handleSavedMovieClick);
		return main;
		
	},
	imgHandler:function(name,tag,data){
		var div = document.createElement('div');
		var img = document.createElement(tag);
		img.src = data['Poster'];
		img.classList.add('saved-movies-single-img');
		div.classList.add('saved-movies-single-img-div');
		div.appendChild(img);
		return div;
	},
	textHandler:function(name,tag,data){
		var text = document.createElement(tag);
		switch(name){
			case 'title':
			text.innerHTML=data['Title'];
			text.classList.add('saved-movies-single-title');
			break;
			case 'genre':
			text.innerHTML=data['Genre'];
			text.classList.add('saved-movies-single-genre');
			break;
			case 'year':
			text.innerHTML=data['Year'];
			text.classList.add('saved-movies-single-year');
			break;
		}
		
		return text;
	},
	btnHandler:function(name,tag,data){
		var btn = document.createElement(tag);
		btn.innerText = 'X';
		btn.classList.add('saved-movies-single-remove');
		return btn;
	},
	createContainer:function(){
		var element = document.getElementById('movie-cont');
		element.innerHTML='';
		element.classList.add('movie-container');
		return element;
	},
	createContainerElements:function(data){
		var innerContainer = document.createElement('div');
		var infobox = document.createElement('div');
		var img = document.createElement('img');
		var title= document.createElement('h3');
		var year = document.createElement('p');
		var description = document.createElement('div');
		var genre = document.createElement('ul');
		var actors = document.createElement('ul');
		var rating = document.createElement('div');
		var saveBtn = document.createElement('button');

		title.innerText = data['Title'];
		year.innerHTML = data['Year'] + '<small> year</small';
		img = new Image();
		if(!data['Poster'] || typeof data['Poster'] == 'undefined' || 
			data['Poster'] == 'N/A' ){
			img.alt = "Sorry, no image for this item";
		}else{
			img.src = data['Poster'];
		}
		
		img.className = 'movie-img';

		description.innerHTML = data['Plot'];

		genre.innerHTML = movie.htmlModule.createList(data['Genre'])
		actors.innerHTML = movie.htmlModule.createList(data['Actors'],true);

		genre.className="movie-genre";
		actors.className="movie-actors";

		rating.setAttribute('id','rating');
		var ratingText = document.createElement('p');
		
		if(data['Ratings'].length){
			ratingText.innerText='Average rating: ';
		rating.appendChild(ratingText);
			movie.htmlModule.createStarRating(data['Ratings'],rating);
		}else{
			ratingText.innerText='Sorry,there is no rating to display!';
			rating.appendChild(ratingText);
		}
		
		saveBtn.innerText="SAVE";
		saveBtn.classList.add('saveBtn');
		saveBtn.addEventListener('click',movie.memoryModule.saveToTheList.bind(data))

		infobox.appendChild(genre);
		infobox.appendChild(title);
		infobox.appendChild(year);
		infobox.appendChild(description);
		infobox.appendChild(actors);
		infobox.appendChild(rating); ///make an array an create a function to add
		infobox.appendChild(saveBtn);
		infobox.className = 'infobox';

		innerContainer.appendChild(img);
		innerContainer.appendChild(infobox);
		return new Promise(function(resolve,reject){
			resolve(innerContainer);
		})
		
	},
	createList:function(str,highlightFirst){
		var arrOfItems = str.split(',');
		var htmlValue='';

		arrOfItems.forEach(function(item,idx){
			var value = movie.htmlModule.createListElement(item,idx,highlightFirst);
			htmlValue+=value;
		})
		console.log(htmlValue);
		return htmlValue;
	},
	createListElement:function(item,idx,highlightFirst){
		if(highlightFirst){
			if(idx==0){
				return '<li><strong>'+ item + '</strong></li>';
			}
			return '<li>'+ item + '</li>';
		}else{
			return '<li>'+ item + '</li>';
		}
	},
	createStarRating:function(data,rating){
		var starsAmount =5;

		 var avg = movie.helpModule.createAverageRating(data),
		starsAffected = starsAmount * (avg/100),
		emptyStars = Math.floor(starsAmount-starsAffected),
		starsCreated=0;

		for(var i=0;i<starsAmount;i++){
			if(starsAffected>1){
				var star = movie.htmlModule.createSingleStar(avg,i);
			rating.appendChild(star);
			starsCreated++;
			}
			
			else if(starsAffected>0 && starsAffected<1){
				var star = movie.htmlModule.createSingleStar(avg,i,starsAffected);
				rating.appendChild(star);
				starsCreated++;
			}
			starsAffected--;
		}
		if(starsCreated<starsAmount){
			for(var i =starsCreated;i<starsAmount;i++){
			var star = movie.htmlModule.createSingleStar(avg,i,undefined,emptyStars);
			rating.appendChild(star);
		}
		}
		
		return rating;
	},

	createSingleStar:function(data,i,filledPercentage,emptyStars){
		
		var star = document.createElement('span'),
		emptystar = document.createElement('span');

		star.setAttribute('id','star_'+(i+1));
		star.innerHTML='&#9733;';
		star.classList.add('single-star')
		if(filledPercentage){
			var extra =document.createElement('span');
			extra.classList.add('single-star');
			extra.style.color='grey';
			extra.style.zIndex="0";
			extra.innerHTML='&#9733;';
			extra.style.position='absolute';
			star.style.width = 2.7 * filledPercentage +'%';
			emptystar.style['margin-right'] = '5%';
			star.style.zIndex='1000';
			star.style.position='absolute';
			emptystar.appendChild(extra);
			emptystar.appendChild(star);
			return emptystar;
		}
		if(emptyStars){
			star.style.color='grey';
		}
		
		

		return star;
	},
	refreshDom:function(data){
		var b = document.getElementById('movie-cont');
		b.innerHTML='';
		b.style.background='none';
		movie.ajaxModule.currentResponse = data;	
		movie.htmlModule.createHtml(movie.ajaxModule.currentResponse);
	}
};



$(document).ready(function() {  
 movie.initApp();
});