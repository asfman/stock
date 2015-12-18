var Vue = require("vue");
var $ = require("./jquery-2.1.4.min");

var xhr = new XMLHttpRequest();
new Vue({
	el: "#stock-search",
	data: {
		code: null,
		result: null
	},
	methods: {
		getPrice: function() {
			code = this.code;
			if(!code) return this.result="";
			code += "";
			code = code.toLowerCase();
			if(code.length != 6 && code.length != 8) return;
			if(code.length == 6)
				code = code.indexOf("6") == 0 ? "sh" + code : "sz" + code; 
			var apiUrl =  "/api/query/" + code;
			xhr.open('GET', apiUrl);
			var _this = this;
			xhr.onload = function () {
				var responseText = xhr.responseText;
				eval(responseText);
				console.log(responseText);
				var result = eval("hq_str_" + code);
				 _this.result = formatResult(result);	
			}
			xhr.send();
		}
	}
})

function formatResult(result) {
	var ret = result.split(",");
	var lastPrice = ret[2];
	var percent = ((ret[3] - ret[2]) * 100 /ret[2]).toFixed(2);
	percent = percent > 0 ? "<span class='red'>" + percent + "</span>"  
			: (percent < 0 ? "<span class='green'>" + percent + "</span>" : percent);	
	//ret[0] + " " +
	return ret[0].substr(0,2) + " " + parseFloat(ret[3],10).toFixed(2) + " " + percent 
	+ " " + parseFloat(ret[2],10).toFixed(2)
	+ " " + parseFloat(ret[4],10).toFixed(2) 
	+ " " + parseFloat(ret[5],10).toFixed(2); 	
}

function initSortable(vm) {
	var Sortable = require("./Sortable");
	var el = document.getElementById('editable');
	// Editable list
	var editableList = Sortable.create(el, {
		filter: '.js-remove',
		//handle: '.drag-handle',
		animation: 150,	
		onFilter: function (evt) {
			//var el = editableList.closest(evt.item); // get dragged item
			//el && el.parentNode.removeChild(el);
			vm.stocks.splice(evt.oldIndex, 1);
		},
		// dragging ended
		onEnd: function (/**Event*/evt) {
			if(evt.newIndex == evt.oldIndex) return;
			var arr = [];
			$(evt.item.parentNode).find(".code").each(function(){
				arr.push($(this).html());
			});
			vm.stocks = arr;
		    //console.log(evt.newIndex + " - " + evt.oldIndex);		
		}
	});	
}
var defaultStocks = ["sh000001", "sz399006", "600122", "300345"];
new Vue({
  el: '#stock_ct',
  data: {
    currentView: 'edit'
  },
  methods: {
  	switchTab: function(e) {
  		this.currentView = $(e.target).html();
  	}
  },
  components: { 	
  	realtime: {
  		template: "#results-template",
		data: function() {
			return {
				stocks: JSON.parse(localStorage.getItem("stocks")),
				timeout: 5000,
				timer: null,
				startTimer: null,
				results: null
			};
		},   		
  		ready: function() {
  			if(!this.stocks) this.stocks = defaultStocks;
  			this.start();
  		},
  		destroyed: function() {
  			this.clearTimer();
  		},
		methods: {
			fetchData: function() {
				var _this = this;
				this.clearTimer();
				this.timer = setInterval(function(){
					_this.getPrice();
				}, this.timeout);	  				
			},
			getPrice: function() {
				var _this = this;
				if(!this.stocks) {
					console.log("stocks null");
					return;
				}
				var codes = [];
				this.stocks.forEach(function(code) {
					if(/^\d+/.test(code))
						code = code.indexOf("6") == 0 ? "sh" + code : "sz" + code; 
					codes.push(code);
				});
				var apiUrl = "/api/query/" + codes.join(",");
				xhr.open('GET', apiUrl);
				xhr.onload = function () {
					var responseText = xhr.responseText;
					eval(responseText);
					console.log(responseText);
					var results = [];
					codes.forEach(function(code) {
						var result = eval("hq_str_" + code);
						results.push(formatResult(result));
					});
					_this.results = results.join("<br />");
				}
				xhr.send();
			},
			clearTimer: function() {
				if(this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}	
				if(this.startTimer) {
					clearTimeout(this.startTimer);
					this.startTimer = null;
				}
				if(xhr.readyState == 1)
					xhr.abort();			
			},
			start: function() {
				if(!this.stocks || !this.stocks.length) return;
				this.getPrice();
				var _this = this;
				this.startTimer = setTimeout(function(){_this.fetchData();}, this.timeout);
			},
			controllHandler: function(e) {
				this.clearTimer();
				if(e.target.value == "stop") {
					e.target.value = "start";
				} else {
					e.target.value = "stop";
					this.start();
				}
			}
		}  		
  	},
    edit: {
		template:"#editable-template",
		data: function() {
			return {
				stocks: defaultStocks
			};
		},
		watch: {
			'stocks': function(stocks) {
				if(this.stocks)
					localStorage.setItem("stocks", JSON.stringify(this.stocks));
			}
		},
		methods: {
			add: function(e) {
				this.stocks.push(e.target.value);
				e.target.value = "";
			}
		},
		ready: function() {
			if(localStorage.getItem("stocks"))
				this.stocks = JSON.parse(localStorage.getItem("stocks"));
			initSortable(this);
		},
		beforeDestroy: function() {
			if(this.stocks)
				localStorage.setItem("stocks", JSON.stringify(this.stocks));			
		}
	}
  }
})